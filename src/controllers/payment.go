package controllers

import (
	"net/http"
	"salon/services"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type PaymentController struct {
	dbService *services.DatabaseService
}

func NewPaymentController(dbService *services.DatabaseService) *PaymentController {
	return &PaymentController{
		dbService: dbService,
	}
}

type CreatePaymentRequest struct {
	Fecha  string  `json:"pag_fecha" binding:"required"`
	Monto  float64 `json:"pag_monto" binding:"required,gt=0"`
	Metodo string  `json:"pag_metodo" binding:"required"`
	GasID  uint    `json:"gas_id" binding:"required"`
	EmpID  uint    `json:"emp_id" binding:"required"`
}

type UpdatePaymentRequest struct {
	Fecha  string  `json:"pag_fecha" binding:"required"`
	Monto  float64 `json:"pag_monto" binding:"required,gt=0"`
	Metodo string  `json:"pag_metodo" binding:"required"`
	GasID  uint    `json:"gas_id" binding:"required"`
	EmpID  uint    `json:"emp_id" binding:"required"`
}

// GetPayments retrieves all payments
func (pc *PaymentController) GetPayments(c *gin.Context) {
	payments, err := pc.dbService.ObtenerPagos()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to retrieve payments",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"payments": payments,
		"total":    len(payments),
	})
}

// GetPaymentsWithEmployee retrieves all payments with employee information
func (pc *PaymentController) GetPaymentsWithEmployee(c *gin.Context) {
	payments, err := pc.dbService.ObtenerTodosLosPagosConEmpleado()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to retrieve payments with employee information",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"payments": payments,
		"total":    len(payments),
	})
}

// GetPaymentsByEmployee retrieves payments for a specific employee
func (pc *PaymentController) GetPaymentsByEmployee(c *gin.Context) {
	empIDStr := c.Param("empId")
	empID, err := strconv.ParseUint(empIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid employee ID",
		})
		return
	}

	payments, err := pc.dbService.ObtenerPagosPorEmpleado(uint(empID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to retrieve payments for employee",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"payments": payments,
		"total":    len(payments),
		"emp_id":   empID,
	})
}

// CreatePayment creates a new payment
func (pc *PaymentController) CreatePayment(c *gin.Context) {
	var req CreatePaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request data",
			"details": err.Error(),
		})
		return
	}

	// Validate date format
	_, err := time.Parse("2006-01-02", req.Fecha)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid date format. Expected YYYY-MM-DD",
		})
		return
	}

	// Create payment using stored procedure
	err = pc.dbService.CrearPago(req.Fecha, req.Monto, req.Metodo, req.GasID, req.EmpID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to create payment",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Payment created successfully",
		"payment": req,
	})
}

// UpdatePayment updates an existing payment
func (pc *PaymentController) UpdatePayment(c *gin.Context) {
	paymentIDStr := c.Param("id")
	paymentID, err := strconv.ParseUint(paymentIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid payment ID",
		})
		return
	}

	var req UpdatePaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request data",
			"details": err.Error(),
		})
		return
	}

	// Validate date format
	_, err = time.Parse("2006-01-02", req.Fecha)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid date format. Expected YYYY-MM-DD",
		})
		return
	}

	// Update payment using stored procedure
	err = pc.dbService.ActualizarPago(uint(paymentID), req.Fecha, req.Monto, req.Metodo, req.GasID, req.EmpID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to update payment",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":    "Payment updated successfully",
		"payment_id": paymentID,
		"payment":    req,
	})
}

// DeletePayment deletes a payment
func (pc *PaymentController) DeletePayment(c *gin.Context) {
	paymentIDStr := c.Param("id")
	paymentID, err := strconv.ParseUint(paymentIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid payment ID",
		})
		return
	}

	// Delete payment using stored procedure
	err = pc.dbService.EliminarPago(uint(paymentID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to delete payment",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":    "Payment deleted successfully",
		"payment_id": paymentID,
	})
}
