package controllers

import (
	"fmt"
	"net/http"
	"salon/services"

	"github.com/gin-gonic/gin"
)

type PromotionController struct {
	dbService *services.DatabaseService
}

func NewPromotionController(dbService *services.DatabaseService) *PromotionController {
	return &PromotionController{
		dbService: dbService,
	}
}

// GetPromotions returns all promotions with service information
func (pc *PromotionController) GetPromotions(c *gin.Context) {
	promotions, err := pc.dbService.ListarPromociones()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve promotions"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"promotions": promotions,
		"total":      len(promotions),
	})
}

// GetPromotionByID returns a single promotion by ID
func (pc *PromotionController) GetPromotionByID(c *gin.Context) {
	id := c.Param("id")

	// Convert string to uint
	var promotionID uint
	if _, err := fmt.Sscanf(id, "%d", &promotionID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid promotion ID"})
		return
	}

	promotion, err := pc.dbService.ObtenerPromocionPorID(promotionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve promotion"})
		return
	}

	if promotion == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Promotion not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"promotion": promotion})
}

// CreatePromotion creates a new promotion
func (pc *PromotionController) CreatePromotion(c *gin.Context) {
	var req struct {
		Nombre      string  `json:"pro_nombre" binding:"required"`
		Descripcion string  `json:"pro_descripcion"`
		FechaInicio string  `json:"pro_fecha_inicio" binding:"required"`
		FechaFin    string  `json:"pro_fecha_fin" binding:"required"`
		Descuento   float64 `json:"pro_descuento_porcentaje" binding:"required"`
		SerID       uint    `json:"ser_id" binding:"required"`
		Usos        int     `json:"pro_usos"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate dates
	if req.FechaInicio >= req.FechaFin {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Start date must be before end date"})
		return
	}

	// Validate discount percentage
	if req.Descuento < 0 || req.Descuento > 100 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Discount percentage must be between 0 and 100"})
		return
	}

	params := services.PromocionParams{
		Nombre:      req.Nombre,
		Descripcion: req.Descripcion,
		FechaInicio: req.FechaInicio,
		FechaFin:    req.FechaFin,
		Descuento:   req.Descuento,
		SerID:       req.SerID,
		Usos:        req.Usos,
	}

	if err := pc.dbService.CrearPromocion(params); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create promotion"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Promotion created successfully"})
}

// UpdatePromotion updates an existing promotion
func (pc *PromotionController) UpdatePromotion(c *gin.Context) {
	id := c.Param("id")

	// Convert string to uint
	var promotionID uint
	if _, err := fmt.Sscanf(id, "%d", &promotionID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid promotion ID"})
		return
	}

	var req struct {
		Nombre      string  `json:"pro_nombre" binding:"required"`
		Descripcion string  `json:"pro_descripcion"`
		FechaInicio string  `json:"pro_fecha_inicio" binding:"required"`
		FechaFin    string  `json:"pro_fecha_fin" binding:"required"`
		Descuento   float64 `json:"pro_descuento_porcentaje" binding:"required"`
		SerID       uint    `json:"ser_id" binding:"required"`
		Usos        int     `json:"pro_usos"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate dates
	if req.FechaInicio >= req.FechaFin {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Start date must be before end date"})
		return
	}

	// Validate discount percentage
	if req.Descuento < 0 || req.Descuento > 100 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Discount percentage must be between 0 and 100"})
		return
	}

	params := services.PromocionParams{
		Nombre:      req.Nombre,
		Descripcion: req.Descripcion,
		FechaInicio: req.FechaInicio,
		FechaFin:    req.FechaFin,
		Descuento:   req.Descuento,
		SerID:       req.SerID,
		Usos:        req.Usos,
	}

	if err := pc.dbService.ActualizarPromocion(promotionID, params); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update promotion"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Promotion updated successfully"})
}

// DeletePromotion deletes a promotion
func (pc *PromotionController) DeletePromotion(c *gin.Context) {
	id := c.Param("id")

	// Convert string to uint
	var promotionID uint
	if _, err := fmt.Sscanf(id, "%d", &promotionID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid promotion ID"})
		return
	}

	if err := pc.dbService.EliminarPromocion(promotionID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete promotion"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Promotion deleted successfully"})
}
