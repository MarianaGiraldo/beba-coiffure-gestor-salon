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

// Helper function to get UserConnectionService with type assertion
func getUserConnectionService() *services.UserConnectionService {
	if config.AppConfig.UserConnectionService != nil {
		if userConnService, ok := config.AppConfig.UserConnectionService.(*services.UserConnectionService); ok {
			return userConnService
		}
	}
	return nil
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

	log.Printf("[AUTH] Login attempt for email: %s", req.Email)

	// Check if it's admin login
	if req.Email == config.AppConfig.AdminEmail && req.Password == config.AppConfig.AdminPass {
		log.Printf("[AUTH] Admin login detected for: %s", req.Email)

		// Close all user connections before admin login
		if userConnService := getUserConnectionService(); userConnService != nil {
			log.Printf("[AUTH] Closing all user connections for admin login")
			userConnService.CloseAllUserConnections()
			userConnService.LogConnectionsStatus()
		}

		token, err := middleware.GenerateJWT(1, req.Email, "admin", "admin")
		if err != nil {
			log.Printf("[AUTH] Failed to generate JWT for admin: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
			return
		}

		log.Printf("[AUTH] Admin login successful for: %s", req.Email)
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

	log.Printf("[AUTH] Regular user login for: %s", req.Email)

	// For non-admin users, first validate credentials using admin connection
	log.Printf("[AUTH] Using admin connection to validate credentials for: %s", req.Email)
	user, err := ac.dbService.BuscarUsuario(req.Email)
	if err != nil {
		log.Printf("[AUTH] User not found: %s, error: %v", req.Email, err)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// Validate password using bcrypt
	log.Printf("[AUTH] Validating password for user: %s", req.Email)
	if err := bcrypt.CompareHashAndPassword([]byte(user.UsuContrasena), []byte(req.Password)); err != nil {
		log.Printf("[AUTH] Invalid password for user: %s", req.Email)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	log.Printf("[AUTH] Password validation successful for user: %s (role: %s)", req.Email, user.UsuRol)

	// Get user data using admin connection FIRST (before establishing user connection)
	log.Printf("[AUTH] Retrieving user data using admin connection for: %s", req.Email)
	var userData interface{}
	var userID uint
	var userRole string

	switch user.UsuRol {
	case "empleado":
		if user.EmpID != nil {
			log.Printf("[AUTH] Fetching employee data for ID: %d using admin connection", *user.EmpID)
			employee, err := ac.dbService.BuscarEmpleadoPorID(*user.EmpID)
			if err != nil {
				log.Printf("[AUTH] Failed to get employee data for ID %d: %v", *user.EmpID, err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get employee data"})
				return
			}
			employee.EmpPassword = "" // Don't return password
			userData = employee
			userID = employee.EmpID
			userRole = employee.EmpPuesto
			log.Printf("[AUTH] Employee data retrieved successfully for: %s", req.Email)
		}
	case "cliente":
		if user.CliID != nil {
			log.Printf("[AUTH] Fetching client data for ID: %d using admin connection", *user.CliID)
			client, err := ac.dbService.BuscarClientePorID(*user.CliID)
			if err != nil {
				log.Printf("[AUTH] Failed to get client data for ID %d: %v", *user.CliID, err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get client data"})
				return
			}
			client.CliPassword = "" // Don't return password
			userData = client
			userID = client.CliID
			userRole = "client"
			log.Printf("[AUTH] Client data retrieved successfully for: %s", req.Email)
		}
	default:
		log.Printf("[AUTH] Invalid user role: %s for user: %s", user.UsuRol, req.Email)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user role"})
		return
	}

	// Now establish connection with user credentials
	log.Printf("[AUTH] Establishing user-specific connection for: %s with role: %s", req.Email, user.UsuRol)
	userConnService := getUserConnectionService()
	if userConnService == nil {
		log.Printf("[AUTH] UserConnectionService not available")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User connection service not available"})
		return
	}

	_, err = userConnService.GetUserConnection(req.Email, req.Password, user.UsuRol)
	if err != nil {
		log.Printf("[AUTH] Failed to establish user connection for %s: %v", req.Email, err)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Failed to establish user session"})
		return
	}

	// Log current connection status
	userConnService.LogConnectionsStatus()

	// Generate JWT token
	token, err := middleware.GenerateJWT(userID, req.Email, user.UsuRol, userRole)
	if err != nil {
		log.Printf("[AUTH] Failed to generate JWT for user %s: %v", req.Email, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	log.Printf("[AUTH] Login successful for user: %s (role: %s)", req.Email, user.UsuRol)
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

	// Create new client using stored procedure (pass plain password for MySQL user creation)
	client := models.Client{
		CliNombre:   req.Nombre,
		CliApellido: req.Apellido,
		CliTelefono: req.Telefono,
		CliCorreo:   req.Email,
		CliPassword: req.Password, // Pass plain password
	}

	// Use stored procedure to insert client (this will hash password for DB and create MySQL user)
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

func (ac *AuthController) Logout(c *gin.Context) {
	userEmail, exists := c.Get("user_email")
	log.Printf("[AUTH] Logout request received for user: %v", userEmail)

	if exists && userEmail != config.AppConfig.AdminEmail {
		// Close user connection on logout
		if email, ok := userEmail.(string); ok {
			log.Printf("[AUTH] Closing connection for user: %s", email)
			if userConnService := getUserConnectionService(); userConnService != nil {
				userConnService.CloseUserConnection(email)
				userConnService.LogConnectionsStatus()
			}
		}
	} else {
		log.Printf("[AUTH] Admin logout or no user email found")
	}

	log.Printf("[AUTH] Logout successful for user: %v", userEmail)
	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

// GetConnectionsInfo returns information about active database connections (Admin only)
func (ac *AuthController) GetConnectionsInfo(c *gin.Context) {
	log.Printf("[AUTH] Connection info requested")

	userConnService := getUserConnectionService()
	if userConnService == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Connection service not available"})
		return
	}

	connectionsInfo := userConnService.GetConnectionsInfo()
	userConnService.LogConnectionsStatus()

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    connectionsInfo,
	})
}
