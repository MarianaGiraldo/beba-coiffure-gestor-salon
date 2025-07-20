package controllers

import (
	"net/http"
	"salon/models"
	"salon/services"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type InventoryController struct {
	dbService *services.DatabaseService
}

func NewInventoryController(dbService *services.DatabaseService) *InventoryController {
	return &InventoryController{
		dbService: dbService,
	}
}

// GetInventoryComplete returns all inventory with product information
func (ic *InventoryController) GetInventoryComplete(c *gin.Context) {
	inventories, err := ic.dbService.ObtenerInventarioCompleto()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to retrieve inventory",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":   true,
		"inventory": inventories,
		"total":     len(inventories),
	})
}

// GetProducts returns all products
func (ic *InventoryController) GetProducts(c *gin.Context) {
	products, err := ic.dbService.GetProductos()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to retrieve products",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":  true,
		"products": products,
		"total":    len(products),
	})
}

// CreateProduct creates a new product with initial inventory entry
func (ic *InventoryController) CreateProduct(c *gin.Context) {
	var product models.Product
	if err := c.ShouldBindJSON(&product); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request data",
			"details": err.Error(),
		})
		return
	}

	// Validate required fields
	if product.ProdNombre == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Product name is required",
		})
		return
	}

	if product.ProdPrecioUnitario <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Product price must be greater than 0",
		})
		return
	}

	// Set default quantity if not provided
	if product.ProdCantidadDisponible < 0 {
		product.ProdCantidadDisponible = 0
	}

	// Use stored procedure to create product (it also creates inventory entry)
	err := ic.dbService.InsertProducto(product)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to create product",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Product created successfully",
		"product": product,
	})
}

// UpdateProduct updates an existing product
func (ic *InventoryController) UpdateProduct(c *gin.Context) {
	idStr := c.Param("id")
	productID, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid product ID",
		})
		return
	}

	var product models.Product
	if err := c.ShouldBindJSON(&product); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request data",
			"details": err.Error(),
		})
		return
	}

	// Set the product ID from URL parameter
	product.ProdID = uint(productID)

	// Validate required fields
	if product.ProdNombre == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Product name is required",
		})
		return
	}

	if product.ProdPrecioUnitario <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Product price must be greater than 0",
		})
		return
	}

	if product.ProdCantidadDisponible < 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Product quantity cannot be negative",
		})
		return
	}

	// Use stored procedure to update product (it also updates inventory)
	err = ic.dbService.UpdateProducto(product)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to update product",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Product updated successfully",
		"product": product,
	})
}

// DeleteProduct deletes a product
func (ic *InventoryController) DeleteProduct(c *gin.Context) {
	idStr := c.Param("id")
	productID, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid product ID",
		})
		return
	}

	// Use stored procedure to delete product
	err = ic.dbService.DeleteProducto(uint(productID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to delete product",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Product deleted successfully",
	})
}

// CreateInventory creates a new inventory entry
func (ic *InventoryController) CreateInventory(c *gin.Context) {
	var request struct {
		ProdID        uint   `json:"prod_id" binding:"required"`
		Cantidad      int    `json:"cantidad" binding:"required"`
		Observaciones string `json:"observaciones"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request data",
			"details": err.Error(),
		})
		return
	}

	if request.Cantidad < 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Quantity cannot be negative",
		})
		return
	}

	// Use current date
	fecha := time.Now().Format("2006-01-02")

	err := ic.dbService.CrearInventario(fecha, request.ProdID, request.Cantidad, request.Observaciones)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to create inventory entry",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Inventory entry created successfully",
	})
}

// UpdateInventory updates an existing inventory entry
func (ic *InventoryController) UpdateInventory(c *gin.Context) {
	idStr := c.Param("id")
	invID, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid inventory ID",
		})
		return
	}

	var request struct {
		Cantidad      int    `json:"cantidad" binding:"required"`
		Observaciones string `json:"observaciones"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request data",
			"details": err.Error(),
		})
		return
	}

	if request.Cantidad < 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Quantity cannot be negative",
		})
		return
	}

	// Use current date
	fecha := time.Now().Format("2006-01-02")

	err = ic.dbService.ActualizarInventario(uint(invID), fecha, request.Cantidad, request.Observaciones)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to update inventory",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Inventory updated successfully",
	})
}

// DeleteInventory deletes an inventory entry
func (ic *InventoryController) DeleteInventory(c *gin.Context) {
	idStr := c.Param("id")
	invID, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid inventory ID",
		})
		return
	}

	err = ic.dbService.EliminarInventario(uint(invID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to delete inventory entry",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Inventory entry deleted successfully",
	})
}
