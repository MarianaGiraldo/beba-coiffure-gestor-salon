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
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
			return
		}
		client.CliPassword = string(hashedPassword)
	}

	if err := cc.dbService.InsertCliente(client); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create client"})
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
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid client ID"})
		return
	}
	client.CliID = clientID // Set ID for update

	// Hash password if provided
	if client.CliPassword != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(client.CliPassword), bcrypt.DefaultCost)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
			return
		}
		client.CliPassword = string(hashedPassword)
	}

	if err := cc.dbService.UpdateCliente(client); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update client"})
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
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid client ID"})
		return
	}

	if err := cc.dbService.DeleteCliente(clientID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete client"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Client deleted successfully"})
}
