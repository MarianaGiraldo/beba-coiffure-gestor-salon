package controllers

import (
	"net/http"
	"salon/models"
	"salon/services"
	"strconv"

	"github.com/gin-gonic/gin"
)

const (
	ErrFailedRetrieveSuppliers = "Failed to retrieve suppliers"
	ErrFailedCreateSupplier    = "Failed to create supplier"
	ErrFailedUpdateSupplier    = "Failed to update supplier"
	ErrFailedDeleteSupplier    = "Failed to delete supplier"
	ErrInvalidSupplierID       = "Invalid supplier ID"
	ErrSupplierNotFound        = "Supplier not found"
)

type SupplierController struct {
	dbService *services.DatabaseService
}

func NewSupplierController(dbService *services.DatabaseService) *SupplierController {
	return &SupplierController{
		dbService: dbService,
	}
}

type SupplierRequest struct {
	ProvNombre    string `json:"prov_nombre" binding:"required"`
	ProvTelefono  string `json:"prov_telefono" binding:"required"`
	ProvCorreo    string `json:"prov_correo" binding:"required,email"`
	ProvDireccion string `json:"prov_direccion" binding:"required"`
}

// GetSuppliers returns all suppliers
func (sc *SupplierController) GetSuppliers(c *gin.Context) {
	suppliers, err := sc.dbService.ObtenerProveedores()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": ErrFailedRetrieveSuppliers})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"suppliers": suppliers,
		"total":     len(suppliers),
	})
}

// GetSupplier returns a specific supplier by ID
func (sc *SupplierController) GetSupplier(c *gin.Context) {
	id := c.Param("id")
	supplierID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": ErrInvalidSupplierID})
		return
	}

	// Since we don't have a specific get supplier by ID stored procedure,
	// we'll get all suppliers and filter
	suppliers, err := sc.dbService.ObtenerProveedores()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": ErrFailedRetrieveSuppliers})
		return
	}

	for _, supplier := range suppliers {
		if supplier.ProvID == uint(supplierID) {
			c.JSON(http.StatusOK, gin.H{"supplier": supplier})
			return
		}
	}

	c.JSON(http.StatusNotFound, gin.H{"error": ErrSupplierNotFound})
}

// CreateSupplier creates a new supplier
func (sc *SupplierController) CreateSupplier(c *gin.Context) {
	var req SupplierRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := sc.dbService.CrearProveedor(
		req.ProvNombre,
		req.ProvTelefono,
		req.ProvCorreo,
		req.ProvDireccion,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": ErrFailedCreateSupplier})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":  "Supplier created successfully",
		"supplier": req,
	})
}

// UpdateSupplier updates an existing supplier
func (sc *SupplierController) UpdateSupplier(c *gin.Context) {
	id := c.Param("id")
	supplierID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": ErrInvalidSupplierID})
		return
	}

	var req SupplierRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err = sc.dbService.ActualizarProveedor(
		uint(supplierID),
		req.ProvNombre,
		req.ProvTelefono,
		req.ProvCorreo,
		req.ProvDireccion,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": ErrFailedUpdateSupplier})
		return
	}

	// Return updated supplier
	updatedSupplier := models.Supplier{
		ProvID:        uint(supplierID),
		ProvNombre:    req.ProvNombre,
		ProvTelefono:  req.ProvTelefono,
		ProvCorreo:    req.ProvCorreo,
		ProvDireccion: req.ProvDireccion,
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  "Supplier updated successfully",
		"supplier": updatedSupplier,
	})
}

// DeleteSupplier deletes a supplier
func (sc *SupplierController) DeleteSupplier(c *gin.Context) {
	id := c.Param("id")
	supplierID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": ErrInvalidSupplierID})
		return
	}

	err = sc.dbService.EliminarProveedor(uint(supplierID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": ErrFailedDeleteSupplier})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Supplier deleted successfully"})
}

// GetSupplierStats returns supplier statistics
func (sc *SupplierController) GetSupplierStats(c *gin.Context) {
	suppliers, err := sc.dbService.ObtenerProveedores()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": ErrFailedRetrieveSuppliers})
		return
	}

	totalSuppliers := len(suppliers)

	// You can add more statistics here based on your business needs
	stats := gin.H{
		"total_suppliers": totalSuppliers,
	}

	c.JSON(http.StatusOK, gin.H{"stats": stats})
}
