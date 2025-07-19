package controllers

import (
	"net/http"
	"salon/models"
	"salon/services"
	"strconv"

	"github.com/gin-gonic/gin"
)

const (
	ErrFailedRetrieveServices = "Failed to retrieve services"
	ErrFailedCreateService    = "Failed to create service"
	ErrFailedUpdateService    = "Failed to update service"
	ErrFailedDeleteService    = "Failed to delete service"
	ErrInvalidServiceID       = "Invalid service ID"
	ErrServiceNotFound        = "Service not found"
)

type ServiceManagementController struct {
	dbService *services.DatabaseService
}

func NewServiceManagementController(dbService *services.DatabaseService) *ServiceManagementController {
	return &ServiceManagementController{
		dbService: dbService,
	}
}

type ServiceRequest struct {
	SerNombre           string  `json:"ser_nombre" binding:"required"`
	SerDescripcion      string  `json:"ser_descripcion"`
	SerCategoria        string  `json:"ser_categoria" binding:"required"`
	SerPrecioUnitario   float64 `json:"ser_precio_unitario" binding:"required,min=0"`
	SerDuracionEstimada int     `json:"ser_duracion_estimada" binding:"required,min=1"`
}

// GetServices returns all services
func (smc *ServiceManagementController) GetServices(c *gin.Context) {
	servicios, err := smc.dbService.ListarServicios()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": ErrFailedRetrieveServices})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"services": servicios,
		"total":    len(servicios),
	})
}

// GetService returns a specific service by ID
func (smc *ServiceManagementController) GetService(c *gin.Context) {
	id := c.Param("id")
	serviceID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": ErrInvalidServiceID})
		return
	}

	servicio, err := smc.dbService.BuscarServicioPorID(uint(serviceID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": ErrServiceNotFound})
		return
	}

	c.JSON(http.StatusOK, gin.H{"service": servicio})
}

// CreateService creates a new service
func (smc *ServiceManagementController) CreateService(c *gin.Context) {
	var req ServiceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := smc.dbService.InsertarServicio(
		req.SerNombre,
		req.SerDescripcion,
		req.SerCategoria,
		req.SerPrecioUnitario,
		req.SerDuracionEstimada,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": ErrFailedCreateService})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Service created successfully",
		"service": req,
	})
}

// UpdateService updates an existing service
func (smc *ServiceManagementController) UpdateService(c *gin.Context) {
	id := c.Param("id")
	serviceID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": ErrInvalidServiceID})
		return
	}

	var req ServiceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err = smc.dbService.ActualizarServicio(
		uint(serviceID),
		req.SerNombre,
		req.SerDescripcion,
		req.SerCategoria,
		req.SerPrecioUnitario,
		req.SerDuracionEstimada,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": ErrFailedUpdateService})
		return
	}

	// Return updated service
	updatedService := models.Service{
		SerID:               uint(serviceID),
		SerNombre:           req.SerNombre,
		SerDescripcion:      req.SerDescripcion,
		SerCategoria:        req.SerCategoria,
		SerPrecioUnitario:   req.SerPrecioUnitario,
		SerDuracionEstimada: req.SerDuracionEstimada,
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Service updated successfully",
		"service": updatedService,
	})
}

// DeleteService deletes a service
func (smc *ServiceManagementController) DeleteService(c *gin.Context) {
	id := c.Param("id")
	serviceID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": ErrInvalidServiceID})
		return
	}

	err = smc.dbService.EliminarServicio(uint(serviceID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": ErrFailedDeleteService})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Service deleted successfully"})
}

// GetServicesByCategory returns services filtered by category
func (smc *ServiceManagementController) GetServicesByCategory(c *gin.Context) {
	category := c.Param("category")
	if category == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Category parameter is required"})
		return
	}

	servicios, err := smc.dbService.ListarServicios()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": ErrFailedRetrieveServices})
		return
	}

	// Filter by category
	var filteredServices []models.Service
	for _, servicio := range servicios {
		if servicio.SerCategoria == category {
			filteredServices = append(filteredServices, servicio)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"services": filteredServices,
		"total":    len(filteredServices),
		"category": category,
	})
}

// GetServiceStats returns service statistics
func (smc *ServiceManagementController) GetServiceStats(c *gin.Context) {
	servicios, err := smc.dbService.ListarServicios()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": ErrFailedRetrieveServices})
		return
	}

	if len(servicios) == 0 {
		c.JSON(http.StatusOK, gin.H{
			"total_services": 0,
			"average_price":  0,
			"most_expensive": nil,
			"categories":     []string{},
		})
		return
	}

	// Calculate statistics
	totalServices := len(servicios)
	var totalPrice float64
	var mostExpensive *models.Service
	categories := make(map[string]bool)

	for i, servicio := range servicios {
		totalPrice += servicio.SerPrecioUnitario
		categories[servicio.SerCategoria] = true

		if mostExpensive == nil || servicio.SerPrecioUnitario > mostExpensive.SerPrecioUnitario {
			mostExpensive = &servicios[i]
		}
	}

	averagePrice := totalPrice / float64(totalServices)

	// Convert categories map to slice
	var categoryList []string
	for category := range categories {
		categoryList = append(categoryList, category)
	}

	c.JSON(http.StatusOK, gin.H{
		"total_services": totalServices,
		"average_price":  averagePrice,
		"most_expensive": mostExpensive,
		"categories":     categoryList,
	})
}
