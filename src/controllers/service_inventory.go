package controllers

import (
	"net/http"
	"salon/config"
	"salon/models"
	"strconv"

	"github.com/gin-gonic/gin"
)

type ServiceController struct{}

func (sc *ServiceController) GetServices(c *gin.Context) {
	var services []models.Service
	if err := config.AppConfig.DB.Find(&services).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch services"})
		return
	}
	c.JSON(http.StatusOK, services)
}

func (sc *ServiceController) CreateService(c *gin.Context) {
	var service models.Service
	if err := c.ShouldBindJSON(&service); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := config.AppConfig.DB.Create(&service).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create service"})
		return
	}

	c.JSON(http.StatusCreated, service)
}

func (sc *ServiceController) UpdateService(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid service ID"})
		return
	}

	var service models.Service
	if err := config.AppConfig.DB.First(&service, uint(id)).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Service not found"})
		return
	}

	var updates models.Service
	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := config.AppConfig.DB.Model(&service).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update service"})
		return
	}

	c.JSON(http.StatusOK, service)
}

func (sc *ServiceController) DeleteService(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid service ID"})
		return
	}

	if err := config.AppConfig.DB.Delete(&models.Service{}, uint(id)).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete service"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Service deleted successfully"})
}

// Inventory Controller
type InventoryController struct{}

func (ic *InventoryController) GetInventory(c *gin.Context) {
	var inventory []models.Inventory
	if err := config.AppConfig.DB.Preload("Product").Find(&inventory).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch inventory"})
		return
	}
	c.JSON(http.StatusOK, inventory)
}

func (ic *InventoryController) UpdateInventory(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid inventory ID"})
		return
	}

	var inventory models.Inventory
	if err := config.AppConfig.DB.First(&inventory, uint(id)).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Inventory item not found"})
		return
	}

	var updates models.Inventory
	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := config.AppConfig.DB.Model(&inventory).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update inventory"})
		return
	}

	// Reload with product data
	config.AppConfig.DB.Preload("Product").First(&inventory, inventory.InvID)
	c.JSON(http.StatusOK, inventory)
}

// Product Controller
type ProductController struct{}

func (pc *ProductController) GetProducts(c *gin.Context) {
	var products []models.Product
	if err := config.AppConfig.DB.Find(&products).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch products"})
		return
	}
	c.JSON(http.StatusOK, products)
}

func (pc *ProductController) CreateProduct(c *gin.Context) {
	var product models.Product
	if err := c.ShouldBindJSON(&product); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := config.AppConfig.DB.Create(&product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create product"})
		return
	}

	// Create initial inventory entry
	inventory := models.Inventory{
		ProdID:            product.ProdID,
		InvCantidadActual: 0,
		InvObservaciones:  "Producto nuevo - Sin stock inicial",
	}
	config.AppConfig.DB.Create(&inventory)

	c.JSON(http.StatusCreated, product)
}
