package controllers

import (
	"net/http"
	"salon/models"
	"salon/services"
	"strconv"

	"github.com/gin-gonic/gin"
)

type SPEmployeeController struct {
	dbService *services.DatabaseService
}

func NewSPEmployeeController(dbService *services.DatabaseService) *SPEmployeeController {
	return &SPEmployeeController{dbService: dbService}
}

// GetEmployees handles GET /employees - uses stored procedure
func (ec *SPEmployeeController) GetEmployees(c *gin.Context) {
	employees, err := ec.dbService.GetEmpleados()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to retrieve employees",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    employees,
	})
}

// CreateEmployee handles POST /employees - uses stored procedure
func (ec *SPEmployeeController) CreateEmployee(c *gin.Context) {
	var employee models.Employee
	if err := c.ShouldBindJSON(&employee); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request data",
			"details": err.Error(),
		})
		return
	}

	// Validate required fields
	if employee.EmpNombre == "" || employee.EmpApellido == "" ||
		employee.EmpCorreo == "" || employee.EmpPuesto == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Missing required fields: nombre, apellido, correo, puesto",
		})
		return
	}

	if employee.EmpSalario <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Salary must be greater than 0",
		})
		return
	}

	err := ec.dbService.InsertEmpleado(employee)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to create employee",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Employee created successfully",
	})
}

// UpdateEmployee handles PUT /employees/:id - uses stored procedure
func (ec *SPEmployeeController) UpdateEmployee(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid employee ID",
		})
		return
	}

	var employee models.Employee
	if err := c.ShouldBindJSON(&employee); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request data",
			"details": err.Error(),
		})
		return
	}

	employee.EmpID = uint(id)

	// Validate required fields
	if employee.EmpNombre == "" || employee.EmpApellido == "" ||
		employee.EmpCorreo == "" || employee.EmpPuesto == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Missing required fields: nombre, apellido, correo, puesto",
		})
		return
	}

	if employee.EmpSalario <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Salary must be greater than 0",
		})
		return
	}

	err = ec.dbService.UpdateEmpleado(employee)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to update employee",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Employee updated successfully",
	})
}

// DeleteEmployee handles DELETE /employees/:id - uses stored procedure
func (ec *SPEmployeeController) DeleteEmployee(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid employee ID",
		})
		return
	}

	err = ec.dbService.DeleteEmpleado(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to delete employee",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Employee deleted successfully",
	})
}
