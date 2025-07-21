package controllers

import (
	"net/http"
	"salon/services"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

const (
	DateFormat = "2006-01-02"
	TimeFormat = "15:04"
)

const (
	ErrFailedRetrieveAppointments = "Failed to retrieve appointments"
	ErrFailedCreateAppointment    = "Failed to create appointment"
	ErrFailedUpdateAppointment    = "Failed to update appointment"
	ErrFailedDeleteAppointment    = "Failed to delete appointment"
	ErrInvalidAppointmentID       = "Invalid appointment ID"
	ErrAppointmentNotFound        = "Appointment not found"
	ErrInvalidDateFormat          = "Invalid date format. Use YYYY-MM-DD"
	ErrInvalidTimeFormat          = "Invalid time format. Use HH:MM"
)

type AppointmentController struct {
	dbService *services.DatabaseService
}

func NewAppointmentController(dbService *services.DatabaseService) *AppointmentController {
	return &AppointmentController{
		dbService: dbService,
	}
}

type AppointmentRequest struct {
	CitFecha string `json:"cit_fecha" binding:"required"` // Format: YYYY-MM-DD
	CitHora  string `json:"cit_hora" binding:"required"`  // Format: HH:MM
	EmpID    uint   `json:"emp_id" binding:"required"`
	SerID    uint   `json:"ser_id" binding:"required"`
	CliID    uint   `json:"cli_id"` // Optional - will be resolved from JWT if not provided
}

type AppointmentResponse struct {
	CitID    uint   `json:"cit_id"`
	CitFecha string `json:"cit_fecha"`
	CitHora  string `json:"cit_hora"`
	EmpID    uint   `json:"emp_id"`
	SerID    uint   `json:"ser_id"`
	CliID    uint   `json:"cli_id"`
	Estado   string `json:"estado"`
}

// GetAppointments returns all appointments
func (ac *AppointmentController) GetAppointments(c *gin.Context) {
	citas, err := ac.dbService.ListarCitas()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": ErrFailedRetrieveAppointments})
		return
	}

	// Convert to response format with default status
	var appointments []AppointmentResponse
	for _, cita := range citas {
		appointment := AppointmentResponse{
			CitID:    cita.CitID,
			CitFecha: cita.CitFecha.Format(DateFormat),
			CitHora:  cita.CitHora,
			EmpID:    cita.EmpID,
			SerID:    cita.SerID,
			CliID:    cita.CliID,
			Estado:   "Programada", // Default status since it's not in the database
		}
		appointments = append(appointments, appointment)
	}

	c.JSON(http.StatusOK, gin.H{
		"appointments": appointments,
		"total":        len(appointments),
	})
}

// GetAppointment returns a specific appointment by ID
func (ac *AppointmentController) GetAppointment(c *gin.Context) {
	id := c.Param("id")
	appointmentID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": ErrInvalidAppointmentID})
		return
	}

	cita, err := ac.dbService.BuscarCitaPorID(uint(appointmentID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": ErrAppointmentNotFound})
		return
	}

	appointment := AppointmentResponse{
		CitID:    cita.CitID,
		CitFecha: cita.CitFecha.Format(DateFormat),
		CitHora:  cita.CitHora,
		EmpID:    cita.EmpID,
		SerID:    cita.SerID,
		CliID:    cita.CliID,
		Estado:   "Programada",
	}

	c.JSON(http.StatusOK, gin.H{"appointment": appointment})
}

// CreateAppointment creates a new appointment
func (ac *AppointmentController) CreateAppointment(c *gin.Context) {
	var req AppointmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// If cli_id is not provided, resolve it from JWT token (for client users)
	if req.CliID == 0 {
		userEmail, exists := c.Get("user_email")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			return
		}

		userType, _ := c.Get("user_type")
		if userType == "client" || userType == "cliente" {
			// Find client by email
			client, err := ac.dbService.BuscarClientePorCorreo(userEmail.(string))
			if err != nil {
				c.JSON(http.StatusNotFound, gin.H{"error": "Client profile not found"})
				return
			}
			req.CliID = client.CliID
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Client ID is required for non-client users"})
			return
		}
	}

	// Validate date format
	_, err := time.Parse(DateFormat, req.CitFecha)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": ErrInvalidDateFormat})
		return
	}

	// Validate time format
	_, err = time.Parse(TimeFormat, req.CitHora)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": ErrInvalidTimeFormat})
		return
	}

	err = ac.dbService.InsertarCita(req.CitFecha, req.CitHora, req.EmpID, req.SerID, req.CliID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": ErrFailedCreateAppointment})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Appointment created successfully",
		"appointment": AppointmentResponse{
			CitFecha: req.CitFecha,
			CitHora:  req.CitHora,
			EmpID:    req.EmpID,
			SerID:    req.SerID,
			CliID:    req.CliID,
			Estado:   "Programada",
		},
	})
}

// UpdateAppointment updates an existing appointment
func (ac *AppointmentController) UpdateAppointment(c *gin.Context) {
	id := c.Param("id")
	appointmentID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": ErrInvalidAppointmentID})
		return
	}

	var req AppointmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate date format
	_, err = time.Parse(DateFormat, req.CitFecha)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": ErrInvalidDateFormat})
		return
	}

	// Validate time format
	_, err = time.Parse(TimeFormat, req.CitHora)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": ErrInvalidTimeFormat})
		return
	}

	err = ac.dbService.ActualizarCita(uint(appointmentID), req.CitFecha, req.CitHora, req.EmpID, req.SerID, req.CliID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": ErrFailedUpdateAppointment})
		return
	}

	updatedAppointment := AppointmentResponse{
		CitID:    uint(appointmentID),
		CitFecha: req.CitFecha,
		CitHora:  req.CitHora,
		EmpID:    req.EmpID,
		SerID:    req.SerID,
		CliID:    req.CliID,
		Estado:   "Programada",
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "Appointment updated successfully",
		"appointment": updatedAppointment,
	})
}

// DeleteAppointment deletes an appointment
func (ac *AppointmentController) DeleteAppointment(c *gin.Context) {
	id := c.Param("id")
	appointmentID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": ErrInvalidAppointmentID})
		return
	}

	err = ac.dbService.EliminarCita(uint(appointmentID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": ErrFailedDeleteAppointment})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Appointment deleted successfully"})
}

// GetAppointmentsByEmployee returns appointments for a specific employee
func (ac *AppointmentController) GetAppointmentsByEmployee(c *gin.Context) {
	id := c.Param("emp_id")
	empID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid employee ID"})
		return
	}

	citas, err := ac.dbService.VerCitasEmpleado(uint(empID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": ErrFailedRetrieveAppointments})
		return
	}

	// Convert to response format
	var appointments []AppointmentResponse
	for _, cita := range citas {
		appointment := AppointmentResponse{
			CitID:    cita.CitID,
			CitFecha: cita.CitFecha.Format(DateFormat),
			CitHora:  cita.CitHora,
			EmpID:    cita.EmpID,
			SerID:    cita.SerID,
			CliID:    cita.CliID,
			Estado:   "Programada",
		}
		appointments = append(appointments, appointment)
	}

	c.JSON(http.StatusOK, gin.H{
		"appointments": appointments,
		"total":        len(appointments),
		"employee_id":  empID,
	})
}

// GetAppointmentsByClient returns appointments for a specific client
func (ac *AppointmentController) GetAppointmentsByClient(c *gin.Context) {
	id := c.Param("cli_id")
	cliID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid client ID"})
		return
	}

	// Get all appointments and filter by client
	citas, err := ac.dbService.ListarCitas()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": ErrFailedRetrieveAppointments})
		return
	}

	// Filter by client ID
	var appointments []AppointmentResponse
	for _, cita := range citas {
		if cita.CliID == uint(cliID) {
			appointment := AppointmentResponse{
				CitID:    cita.CitID,
				CitFecha: cita.CitFecha.Format(DateFormat),
				CitHora:  cita.CitHora,
				EmpID:    cita.EmpID,
				SerID:    cita.SerID,
				CliID:    cita.CliID,
				Estado:   "Programada",
			}
			appointments = append(appointments, appointment)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"appointments": appointments,
		"total":        len(appointments),
		"client_id":    cliID,
	})
}

// GetMyAppointments returns appointments for the authenticated client
func (ac *AppointmentController) GetMyAppointments(c *gin.Context) {
	// Get user information from context (set by AuthMiddleware)
	userEmail, exists := c.Get("user_email")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	userType, _ := c.Get("user_type")
	if userType != "client" && userType != "cliente" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only clients can access their appointments"})
		return
	}

	// Get client by email
	client, err := ac.dbService.BuscarClientePorCorreo(userEmail.(string))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Client profile not found"})
		return
	}

	// Get client's appointments with details
	citas, err := ac.dbService.VerCitasCliente(client.CliID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": ErrFailedRetrieveAppointments})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"appointments": citas,
		"total":        len(citas),
		"client_id":    client.CliID,
	})
}

// GetAppointmentsByDate returns appointments for a specific date
func (ac *AppointmentController) GetAppointmentsByDate(c *gin.Context) {
	dateStr := c.Param("date")

	// Validate date format
	targetDate, err := time.Parse(DateFormat, dateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": ErrInvalidDateFormat})
		return
	}

	// Get all appointments and filter by date
	citas, err := ac.dbService.ListarCitas()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": ErrFailedRetrieveAppointments})
		return
	}

	// Filter by date
	var appointments []AppointmentResponse
	for _, cita := range citas {
		if cita.CitFecha.Format(DateFormat) == targetDate.Format(DateFormat) {
			appointment := AppointmentResponse{
				CitID:    cita.CitID,
				CitFecha: cita.CitFecha.Format(DateFormat),
				CitHora:  cita.CitHora,
				EmpID:    cita.EmpID,
				SerID:    cita.SerID,
				CliID:    cita.CliID,
				Estado:   "Programada",
			}
			appointments = append(appointments, appointment)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"appointments": appointments,
		"total":        len(appointments),
		"date":         dateStr,
	})
}
