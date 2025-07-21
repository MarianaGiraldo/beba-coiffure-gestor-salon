package controllers

import (
	"fmt"
	"net/http"
	"salon/models"
	"salon/services"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

const (
	ErrEmailAlreadyExists    = "Email already registered"
	ErrPasswordsDontMatch    = "Passwords do not match"
	ErrFailedCreateAccount   = "Failed to create account"
	ErrFailedRetrieveAccount = "Failed to retrieve created account"
	ErrFailedRetrieveClients = "Failed to retrieve clients"
	ErrFailedCreateClient    = "Failed to create client"
	ErrFailedUpdateClient    = "Failed to update client"
	ErrFailedDeleteClient    = "Failed to delete client"
	ErrInvalidClientID       = "Invalid client ID"
	ErrFailedHashPassword    = "Failed to hash password"
	ErrUserNotAuthenticated  = "User not authenticated"
	ErrClientProfileNotFound = "Client profile not found"
	ErrEmailAlreadyInUse     = "Email already in use"
	ErrFailedUpdateProfile   = "Failed to update profile"
)

type ClientController struct {
	dbService *services.DatabaseService
}

func NewClientController(dbService *services.DatabaseService) *ClientController {
	return &ClientController{
		dbService: dbService,
	}
}

type ClientRegistrationRequest struct {
	Nombre          string `json:"nombre" binding:"required"`
	Apellido        string `json:"apellido" binding:"required"`
	Telefono        string `json:"telefono"`
	Email           string `json:"email" binding:"required,email"`
	Password        string `json:"password" binding:"required,min=6"`
	ConfirmPassword string `json:"confirmPassword" binding:"required"`
}

type ClientRegistrationResponse struct {
	Message string        `json:"message"`
	Client  models.Client `json:"client"`
}

// GetClients returns all clients (for admin/employee use)
func (cc *ClientController) GetClients(c *gin.Context) {
	clients, err := cc.dbService.GetClientes()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve clients"})
		return
	}

	// Remove passwords from response
	for i := range clients {
		clients[i].CliPassword = ""
	}

	c.JSON(http.StatusOK, gin.H{
		"clients": clients,
		"total":   len(clients),
	})
}

// CreateClient creates a new client (admin only)
func (cc *ClientController) CreateClient(c *gin.Context) {
	var client models.Client
	if err := c.ShouldBindJSON(&client); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Hash password if provided
	if client.CliPassword != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(client.CliPassword), bcrypt.DefaultCost)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": ErrFailedHashPassword})
			return
		}
		client.CliPassword = string(hashedPassword)
	}

	if err := cc.dbService.InsertCliente(client); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": ErrFailedCreateClient})
		return
	}

	client.CliPassword = "" // Don't return password
	c.JSON(http.StatusCreated, gin.H{
		"message": "Client created successfully",
		"client":  client,
	})
}

// UpdateClient updates an existing client
func (cc *ClientController) UpdateClient(c *gin.Context) {
	var client models.Client
	if err := c.ShouldBindJSON(&client); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	id := c.Param("id")
	// Convert string to uint
	var clientID uint
	if _, err := fmt.Sscanf(id, "%d", &clientID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": ErrInvalidClientID})
		return
	}
	client.CliID = clientID // Set ID for update

	// Hash password if provided
	if client.CliPassword != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(client.CliPassword), bcrypt.DefaultCost)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": ErrFailedHashPassword})
			return
		}
		client.CliPassword = string(hashedPassword)
	}

	if err := cc.dbService.UpdateCliente(client); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": ErrFailedUpdateClient})
		return
	}

	client.CliPassword = "" // Don't return password
	c.JSON(http.StatusOK, gin.H{
		"message": "Client updated successfully",
		"client":  client,
	})
}

// DeleteClient deletes a client
func (cc *ClientController) DeleteClient(c *gin.Context) {
	id := c.Param("id")

	// Convert string to uint
	var clientID uint
	if _, err := fmt.Sscanf(id, "%d", &clientID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": ErrInvalidClientID})
		return
	}

	if err := cc.dbService.DeleteCliente(clientID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": ErrFailedDeleteClient})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Client deleted successfully"})
}

// GetProfile gets the authenticated client's own profile
func (cc *ClientController) GetProfile(c *gin.Context) {
	// Get user information from context (set by AuthMiddleware)
	userEmail, exists := c.Get("user_email")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": ErrUserNotAuthenticated})
		return
	}

	// Get client by email
	client, err := cc.dbService.BuscarClientePorCorreo(userEmail.(string))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": ErrClientProfileNotFound})
		return
	}

	// Remove password from response
	client.CliPassword = ""

	c.JSON(http.StatusOK, gin.H{
		"client": client,
	})
}

// UpdateProfile updates the authenticated client's own profile
func (cc *ClientController) UpdateProfile(c *gin.Context) {
	// Get user information from context (set by AuthMiddleware)
	userEmail, exists := c.Get("user_email")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": ErrUserNotAuthenticated})
		return
	}

	// Get current client data
	currentClient, err := cc.dbService.BuscarClientePorCorreo(userEmail.(string))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": ErrClientProfileNotFound})
		return
	}

	// Bind new client data from request
	var updateData models.Client
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Ensure client can only update their own profile
	updateData.CliID = currentClient.CliID

	// Validate email hasn't changed (or if it has, ensure it's not taken)
	if updateData.CliCorreo != currentClient.CliCorreo {
		// Check if new email already exists
		_, err := cc.dbService.BuscarClientePorCorreo(updateData.CliCorreo)
		if err == nil {
			c.JSON(http.StatusConflict, gin.H{"error": ErrEmailAlreadyInUse})
			return
		}
	}

	// Hash password if provided
	if updateData.CliPassword != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(updateData.CliPassword), bcrypt.DefaultCost)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": ErrFailedHashPassword})
			return
		}
		updateData.CliPassword = string(hashedPassword)
	} else {
		// If no password provided, keep current password (don't update it)
		updateData.CliPassword = currentClient.CliPassword
	}

	if err := cc.dbService.UpdateCliente(updateData); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": ErrFailedUpdateProfile})
		return
	}

	// Remove password from response
	updateData.CliPassword = ""
	c.JSON(http.StatusOK, gin.H{
		"message": "Profile updated successfully",
		"client":  updateData,
	})
}
