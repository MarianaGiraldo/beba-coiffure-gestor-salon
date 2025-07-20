package controllers

import (
	"log"
	"net/http"
	"salon/config"
	"salon/middleware"
	"salon/models"
	"salon/services"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type AuthController struct {
	dbService *services.DatabaseService
}

func NewAuthController(dbService *services.DatabaseService) *AuthController {
	return &AuthController{dbService: dbService}
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type RegisterRequest struct {
	Nombre          string `json:"nombre" binding:"required"`
	Apellido        string `json:"apellido" binding:"required"`
	Telefono        string `json:"telefono"`
	Email           string `json:"email" binding:"required,email"`
	Password        string `json:"password" binding:"required,min=6"`
	ConfirmPassword string `json:"confirmPassword" binding:"required"`
}

type AuthResponse struct {
	Token    string      `json:"token"`
	UserType string      `json:"userType"`
	User     interface{} `json:"user"`
}

func (ac *AuthController) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if it's admin login
	if req.Email == config.AppConfig.AdminEmail && req.Password == config.AppConfig.AdminPass {
		token, err := middleware.GenerateJWT(1, req.Email, "admin", "admin")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
			return
		}

		c.JSON(http.StatusOK, AuthResponse{
			Token:    token,
			UserType: "admin",
			User: gin.H{
				"email": req.Email,
				"role":  "admin",
			},
		})
		return
	}

	// Use BuscarUsuario stored procedure to find user by email
	user, err := ac.dbService.BuscarUsuario(req.Email)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// Validate password using bcrypt.CompareHashAndPassword OR EXACT match
	if err := bcrypt.CompareHashAndPassword([]byte(user.UsuContrasena), []byte(req.Password)); err != nil || req.Password != user.UsuContrasena {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// Determine user type and get additional user data based on role
	var userData interface{}
	var userID uint
	var userRole string

	switch user.UsuRol {
	case "empleado":
		if user.EmpID != nil {
			employee, err := ac.dbService.BuscarEmpleadoPorID(*user.EmpID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get employee data"})
				return
			}
			employee.EmpPassword = "" // Don't return password
			userData = employee
			userID = employee.EmpID
			userRole = employee.EmpPuesto
		}
	case "cliente":
		if user.CliID != nil {
			client, err := ac.dbService.BuscarClientePorID(*user.CliID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get client data"})
				return
			}
			client.CliPassword = "" // Don't return password
			userData = client
			userID = client.CliID
			userRole = "client"
		}
	default:
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user role"})
		return
	}

	// Generate JWT token
	token, err := middleware.GenerateJWT(userID, req.Email, user.UsuRol, userRole)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, AuthResponse{
		Token:    token,
		UserType: user.UsuRol,
		User:     userData,
	})
}

func (ac *AuthController) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Password != req.ConfirmPassword {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Passwords do not match"})
		return
	}

	// Check if email already exists using stored procedure
	user, err := ac.dbService.BuscarUsuario(req.Email)
	if user.CliID != nil || user.EmpID != nil {
		log.Printf("ERROR: Email already registered, %+v", user)
		c.JSON(http.StatusConflict, gin.H{"error": "Email already registered"})
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// Create new client using stored procedure
	client := models.Client{
		CliNombre:   req.Nombre,
		CliApellido: req.Apellido,
		CliTelefono: req.Telefono,
		CliCorreo:   req.Email,
		CliPassword: string(hashedPassword),
	}

	// Use stored procedure to insert client (this will also create the user account)
	if err := ac.dbService.InsertCliente(client); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create account"})
		return
	}

	// Get the created client to return the ID
	createdClient, err := ac.dbService.BuscarClientePorCorreo(req.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Account created but failed to retrieve details"})
		return
	}

	createdClient.CliPassword = "" // Don't return password
	c.JSON(http.StatusCreated, gin.H{
		"message": "Account created successfully",
		"user":    createdClient,
	})
}

func (ac *AuthController) Me(c *gin.Context) {
	userID, _ := c.Get("user_id")
	userType, _ := c.Get("user_type")
	userEmail, _ := c.Get("user_email")

	switch userType {
	case "admin":
		c.JSON(http.StatusOK, gin.H{
			"user_id":   userID,
			"email":     userEmail,
			"user_type": userType,
			"role":      "admin",
		})
	case "empleado":
		// Use stored procedure to get employee by ID
		if id, ok := userID.(uint); ok {
			employee, err := ac.dbService.BuscarEmpleadoPorID(id)
			if err != nil {
				c.JSON(http.StatusNotFound, gin.H{"error": "Employee not found"})
				return
			}
			employee.EmpPassword = ""
			c.JSON(http.StatusOK, employee)
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		}
	case "cliente":
		// Use stored procedure to get client by ID
		if id, ok := userID.(uint); ok {
			client, err := ac.dbService.BuscarClientePorID(id)
			if err != nil {
				c.JSON(http.StatusNotFound, gin.H{"error": "Client not found"})
				return
			}
			client.CliPassword = ""
			c.JSON(http.StatusOK, client)
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		}
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user type"})
	}
}
