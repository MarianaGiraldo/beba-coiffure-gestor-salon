package controllers

import (
	"net/http"
	"salon/services"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

const (
	ErrFailedRetrievePurchases = "Failed to retrieve purchases"
	ErrFailedCreatePurchase    = "Failed to create purchase"
	ErrFailedUpdatePurchase    = "Failed to update purchase"
	ErrFailedDeletePurchase    = "Failed to delete purchase"
	ErrInvalidPurchaseID       = "Invalid purchase ID"
	ErrPurchaseNotFound        = "Purchase not found"
	ErrInvalidProductID        = "Invalid product ID"
	ErrFailedCreateDetail      = "Failed to create purchase detail"
	ErrFailedUpdateDetail      = "Failed to update purchase detail"
	ErrFailedDeleteDetail      = "Failed to delete purchase detail"
)

type PurchaseManagementController struct {
	dbService *services.DatabaseService
}

func NewPurchaseManagementController(dbService *services.DatabaseService) *PurchaseManagementController {
	return &PurchaseManagementController{
		dbService: dbService,
	}
}

type PurchaseRequest struct {
	CopFechaCompra string  `json:"cop_fecha_compra" binding:"required"`
	CopMetodoPago  string  `json:"cop_metodo_pago" binding:"required"`
	ProvID         uint    `json:"prov_id" binding:"required"`
	GasID          uint    `json:"gas_id" binding:"required"`
	Detalles       []PurchaseDetailRequest `json:"detalles" binding:"required,min=1"`
}

type PurchaseDetailRequest struct {
	ProdID           uint    `json:"prod_id" binding:"required"`
	DecCantidad      int     `json:"dec_cantidad" binding:"required,min=1"`
	DecPrecioUnitario float64 `json:"dec_precio_unitario" binding:"required,min=0"`
}

type UpdatePurchaseRequest struct {
	CopFechaCompra string  `json:"cop_fecha_compra" binding:"required"`
	CopTotalCompra float64 `json:"cop_total_compra" binding:"required,min=0"`
	CopMetodoPago  string  `json:"cop_metodo_pago" binding:"required"`
	ProvID         uint    `json:"prov_id" binding:"required"`
	GasID          uint    `json:"gas_id" binding:"required"`
}

// GetPurchases returns all purchases with their details
func (pmc *PurchaseManagementController) GetPurchases(c *gin.Context) {
	compras, err := pmc.dbService.ListarCompras()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": ErrFailedRetrievePurchases})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"purchases": compras,
		"total":     len(compras),
	})
}

// GetPurchase returns a specific purchase by ID with its details
func (pmc *PurchaseManagementController) GetPurchase(c *gin.Context) {
	id := c.Param("id")
	purchaseID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": ErrInvalidPurchaseID})
		return
	}

	compra, err := pmc.dbService.BuscarCompraPorID(uint(purchaseID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": ErrPurchaseNotFound})
		return
	}

	// Get purchase details
	detalles, err := pmc.dbService.ListarDetallesCompra(uint(purchaseID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get purchase details"})
		return
	}

	compra.Detalles = detalles

	c.JSON(http.StatusOK, gin.H{"purchase": compra})
}

// CreatePurchase creates a new purchase with its details
func (pmc *PurchaseManagementController) CreatePurchase(c *gin.Context) {
	var req PurchaseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Parse the date
	fechaCompra, err := time.Parse("2006-01-02", req.CopFechaCompra)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format. Use YYYY-MM-DD"})
		return
	}

	// Calculate total from details
	var total float64
	for _, detalle := range req.Detalles {
		total += detalle.DecPrecioUnitario * float64(detalle.DecCantidad)
	}

	// Create the purchase first
	err = pmc.dbService.InsertarCompra(
		fechaCompra.Format("2006-01-02"),
		total,
		req.CopMetodoPago,
		req.ProvID,
		req.GasID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": ErrFailedCreatePurchase})
		return
	}

	// Get the last inserted purchase ID
	ultimaCompra, err := pmc.dbService.ObtenerUltimaCompra()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get created purchase"})
		return
	}

	// Insert purchase details
	for _, detalle := range req.Detalles {
		err = pmc.dbService.InsertarDetalleCompra(
			ultimaCompra.ComID,
			detalle.ProdID,
			detalle.DecCantidad,
			detalle.DecPrecioUnitario,
		)
		if err != nil {
			// If detail insertion fails, we should ideally rollback the purchase
			c.JSON(http.StatusInternalServerError, gin.H{"error": ErrFailedCreateDetail})
			return
		}
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":     "Purchase created successfully",
		"purchase_id": ultimaCompra.ComID,
		"total":       total,
	})
}

// UpdatePurchase updates an existing purchase (header only)
func (pmc *PurchaseManagementController) UpdatePurchase(c *gin.Context) {
	id := c.Param("id")
	purchaseID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": ErrInvalidPurchaseID})
		return
	}

	var req UpdatePurchaseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err = pmc.dbService.ActualizarCompra(
		uint(purchaseID),
		req.CopFechaCompra,
		req.CopTotalCompra,
		req.CopMetodoPago,
		req.ProvID,
		req.GasID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": ErrFailedUpdatePurchase})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Purchase updated successfully"})
}

// DeletePurchase deletes a purchase and all its details
func (pmc *PurchaseManagementController) DeletePurchase(c *gin.Context) {
	id := c.Param("id")
	purchaseID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": ErrInvalidPurchaseID})
		return
	}

	err = pmc.dbService.EliminarCompra(uint(purchaseID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": ErrFailedDeletePurchase})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Purchase deleted successfully"})
}

// ============= PURCHASE DETAIL MANAGEMENT =============

// AddPurchaseDetail adds a new detail to an existing purchase
func (pmc *PurchaseManagementController) AddPurchaseDetail(c *gin.Context) {
	id := c.Param("id")
	purchaseID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": ErrInvalidPurchaseID})
		return
	}

	var req PurchaseDetailRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err = pmc.dbService.InsertarDetalleCompra(
		uint(purchaseID),
		req.ProdID,
		req.DecCantidad,
		req.DecPrecioUnitario,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": ErrFailedCreateDetail})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Purchase detail added successfully"})
}

// UpdatePurchaseDetail updates a specific purchase detail
func (pmc *PurchaseManagementController) UpdatePurchaseDetail(c *gin.Context) {
	id := c.Param("id")
	prodID := c.Param("prodId")

	purchaseID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": ErrInvalidPurchaseID})
		return
	}

	productID, err := strconv.ParseUint(prodID, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": ErrInvalidProductID})
		return
	}

	var req PurchaseDetailRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err = pmc.dbService.ActualizarDetalleCompra(
		uint(purchaseID),
		uint(productID),
		req.DecCantidad,
		req.DecPrecioUnitario,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": ErrFailedUpdateDetail})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Purchase detail updated successfully"})
}

// DeletePurchaseDetail deletes a specific purchase detail
func (pmc *PurchaseManagementController) DeletePurchaseDetail(c *gin.Context) {
	id := c.Param("id")
	prodID := c.Param("prodId")

	purchaseID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": ErrInvalidPurchaseID})
		return
	}

	productID, err := strconv.ParseUint(prodID, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": ErrInvalidProductID})
		return
	}

	err = pmc.dbService.EliminarDetalleCompra(uint(purchaseID), uint(productID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": ErrFailedDeleteDetail})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Purchase detail deleted successfully"})
}

// GetPurchaseDetails returns all details for a specific purchase
func (pmc *PurchaseManagementController) GetPurchaseDetails(c *gin.Context) {
	id := c.Param("id")
	purchaseID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": ErrInvalidPurchaseID})
		return
	}

	detalles, err := pmc.dbService.ListarDetallesCompra(uint(purchaseID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve purchase details"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"purchase_id": purchaseID,
		"details":     detalles,
		"total":       len(detalles),
	})
}
