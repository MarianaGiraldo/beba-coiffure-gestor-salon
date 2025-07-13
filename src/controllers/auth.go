package controllers

import (
	"net/http"
	"salon/config"
	"salon/middleware"
	"salon/models"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type AuthController struct{}

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

	// Check employee login
	var employee models.Employee
	if err := config.AppConfig.DB.Where("emp_correo = ?", req.Email).First(&employee).Error; err == nil {
		//TODO: Get password from usuario_sistema
		if err := bcrypt.CompareHashAndPassword([]byte(employee.EmpPassword), []byte(req.Password)); err == nil {
			token, err := middleware.GenerateJWT(employee.EmpID, employee.EmpCorreo, "employee", employee.EmpPuesto)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
				return
			}

			employee.EmpPassword = "" // Don't return password
			c.JSON(http.StatusOK, AuthResponse{
				Token:    token,
				UserType: "employee",
				User:     employee,
			})
			return
		}
	}

	// Check client login
	var client models.Client
	if err := config.AppConfig.DB.Where("cli_correo = ?", req.Email).First(&client).Error; err == nil {
		//TODO: Get password from usuario_sistema
		if err := bcrypt.CompareHashAndPassword([]byte(client.CliPassword), []byte(req.Password)); err == nil {
			token, err := middleware.GenerateJWT(client.CliID, client.CliCorreo, "client", "client")
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
				return
			}

			client.CliPassword = "" // Don't return password
			c.JSON(http.StatusOK, AuthResponse{
				Token:    token,
				UserType: "client",
				User:     client,
			})
			return
		}
	}

	c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
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

	// Check if email already exists
	var existingClient models.Client
	if err := config.AppConfig.DB.Where("cli_correo = ?", req.Email).First(&existingClient).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Email already registered"})
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// Create new client
	client := models.Client{
		CliNombre:   req.Nombre,
		CliApellido: req.Apellido,
		CliTelefono: req.Telefono,
		CliCorreo:   req.Email,
		CliPassword: string(hashedPassword),
	}

	if err := config.AppConfig.DB.Create(&client).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create account"})
		return
	}

	client.CliPassword = "" // Don't return password
	c.JSON(http.StatusCreated, gin.H{
		"message": "Account created successfully",
		"user":    client,
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
	// TODO: Call procedure to get employees or clients based on id
	case "employee":
		var employee models.Employee
		if err := config.AppConfig.DB.Where("emp_id = ?", userID).First(&employee).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Employee not found"})
			return
		}
		employee.EmpPassword = ""
		c.JSON(http.StatusOK, employee)
	case "client":
		var client models.Client
		if err := config.AppConfig.DB.Where("cli_id = ?", userID).First(&client).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Client not found"})
			return
		}
		client.CliPassword = ""
		c.JSON(http.StatusOK, client)
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user type"})
	}
}
