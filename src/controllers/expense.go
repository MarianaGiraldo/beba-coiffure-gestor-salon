package controllers

import (
	"net/http"
	"salon/services"
	"strconv"

	"github.com/gin-gonic/gin"
)

const (
	ErrFailedRetrieveExpenses = "Failed to retrieve expenses"
	ErrFailedCreateExpense    = "Failed to create expense"
	ErrFailedUpdateExpense    = "Failed to update expense"
	ErrFailedDeleteExpense    = "Failed to delete expense"
	ErrInvalidExpenseID       = "Invalid expense ID"
	ErrExpenseNotFound        = "Expense not found"
)

type ExpenseManagementController struct {
	dbService *services.DatabaseService
}

func NewExpenseManagementController(dbService *services.DatabaseService) *ExpenseManagementController {
	return &ExpenseManagementController{
		dbService: dbService,
	}
}

type ExpenseRequest struct {
	GasDescripcion string  `json:"gas_descripcion"`
	GasFecha       string  `json:"gas_fecha" binding:"required"`
	GasMonto       float64 `json:"gas_monto" binding:"required,min=0"`
	GasTipo        string  `json:"gas_tipo" binding:"required"`
}

// GetExpenses returns all expenses
func (emc *ExpenseManagementController) GetExpenses(c *gin.Context) {
	gastos, err := emc.dbService.ListarGastos()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": ErrFailedRetrieveExpenses})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"expenses": gastos,
		"total":    len(gastos),
	})
}

// GetExpense returns a specific expense by ID
func (emc *ExpenseManagementController) GetExpense(c *gin.Context) {
	id := c.Param("id")
	expenseID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": ErrInvalidExpenseID})
		return
	}

	gasto, err := emc.dbService.BuscarGastoPorID(uint(expenseID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": ErrExpenseNotFound})
		return
	}

	c.JSON(http.StatusOK, gin.H{"expense": gasto})
}

// CreateExpense creates a new expense
func (emc *ExpenseManagementController) CreateExpense(c *gin.Context) {
	var req ExpenseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := emc.dbService.InsertarGasto(
		req.GasDescripcion,
		req.GasFecha,
		req.GasMonto,
		req.GasTipo,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": ErrFailedCreateExpense})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Expense created successfully",
		"expense": req,
	})
}

// UpdateExpense updates an existing expense
func (emc *ExpenseManagementController) UpdateExpense(c *gin.Context) {
	id := c.Param("id")
	expenseID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": ErrInvalidExpenseID})
		return
	}

	var req ExpenseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err = emc.dbService.ActualizarGasto(
		uint(expenseID),
		req.GasDescripcion,
		req.GasFecha,
		req.GasMonto,
		req.GasTipo,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": ErrFailedUpdateExpense})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Expense updated successfully",
		"expense": req,
	})
}

// DeleteExpense deletes an expense
func (emc *ExpenseManagementController) DeleteExpense(c *gin.Context) {
	id := c.Param("id")
	expenseID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": ErrInvalidExpenseID})
		return
	}

	err = emc.dbService.EliminarGasto(uint(expenseID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": ErrFailedDeleteExpense})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Expense deleted successfully"})
}
