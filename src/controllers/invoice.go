package controllers

import (
	"fmt"
	"net/http"
	"salon/models"
	"salon/services"
	"strconv"

	"github.com/gin-gonic/gin"
)

const (
	ErrInvalidInvoiceID             = "Invalid invoice ID"
	ErrFailedCreateInvoice          = "Failed to create invoice"
	ErrFailedRetrieveInvoice        = "Failed to retrieve invoice"
	ErrFailedRetrieveInvoices       = "Failed to retrieve invoices"
	ErrFailedUpdateInvoice          = "Failed to update invoice"
	ErrFailedDeleteInvoice          = "Failed to delete invoice"
	ErrInvoiceNotFound              = "Invoice not found"
	ErrFailedRetrieveClientForInv   = "Failed to retrieve client information"
	ErrFailedRetrieveServicesForInv = "Failed to retrieve services information"
	ErrFailedRetrieveDetails        = "Failed to retrieve invoice details"
	ErrFailedAddService             = "Failed to add service to invoice"
	ErrFailedRemoveService          = "Failed to remove service from invoice"
)

type InvoiceController struct {
	dbService *services.DatabaseService
}

func NewInvoiceController(dbService *services.DatabaseService) *InvoiceController {
	return &InvoiceController{
		dbService: dbService,
	}
}

// CreateInvoiceRequest represents the request to create a new invoice
type CreateInvoiceRequest struct {
	CliID     uint   `json:"cli_id" binding:"required"`
	Fecha     string `json:"fecha" binding:"required"`
	Hora      string `json:"hora" binding:"required"`
	Servicios []uint `json:"servicios" binding:"required,min=1"` // List of service IDs
}

// InvoiceDetailResponse represents the complete invoice with details
type InvoiceDetailResponse struct {
	FacID     uint    `json:"fac_id"`
	FacTotal  float64 `json:"fac_total"`
	FacFecha  string  `json:"fac_fecha"`
	FacHora   string  `json:"fac_hora"`
	CliID     uint    `json:"cli_id"`
	CliNombre string  `json:"cli_nombre"`
	Servicios string  `json:"servicios"` // Comma-separated service names
}

// CreateInvoice creates a new invoice with its details
func (ic *InvoiceController) CreateInvoice(c *gin.Context) {
	var req CreateInvoiceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// First, create the invoice with initial total of 0 (will be updated by stored procedure)
	err := ic.dbService.InsertarFacturaSinTotal(req.Fecha, req.Hora, req.CliID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": ErrFailedCreateInvoice})
		return
	}

	// Get the created invoice to get its ID
	createdInvoice, err := ic.dbService.ObtenerUltimaFactura()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": ErrFailedRetrieveInvoice})
		return
	}

	// Add each service to the invoice details (stored procedure will calculate total)
	for _, servicioID := range req.Servicios {
		err = ic.dbService.InsertarDetalleFactura(createdInvoice.FacID, servicioID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": fmt.Sprintf("Failed to add service %d to invoice", servicioID),
			})
			return
		}
	}

	// Get the updated invoice (total should be calculated by stored procedure)
	updatedInvoice, err := ic.dbService.BuscarFacturaPorID(createdInvoice.FacID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": ErrFailedRetrieveInvoice})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Invoice created successfully",
		"invoice": updatedInvoice,
	})
}

// GetInvoices returns all invoices with basic information
func (ic *InvoiceController) GetInvoices(c *gin.Context) {
	facturas, err := ic.dbService.ListarFacturas()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": ErrFailedRetrieveInvoices})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"invoices": facturas,
		"total":    len(facturas),
	})
}

// GetInvoiceByID returns a specific invoice by ID
func (ic *InvoiceController) GetInvoiceByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": ErrInvalidInvoiceID})
		return
	}

	factura, err := ic.dbService.BuscarFacturaPorID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": ErrInvoiceNotFound})
		return
	}

	c.JSON(http.StatusOK, gin.H{"invoice": factura})
}

// GetInvoiceDetails returns complete invoice information with client name and services
func (ic *InvoiceController) GetInvoiceDetails(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": ErrInvalidInvoiceID})
		return
	}

	// Get the invoice
	factura, err := ic.dbService.BuscarFacturaPorID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": ErrInvoiceNotFound})
		return
	}

	response, err := ic.buildInvoiceDetailResponse(factura)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"invoice_details": response})
}

// Helper method to build invoice detail response
func (ic *InvoiceController) buildInvoiceDetailResponse(factura *models.FacturaServicio) (*InvoiceDetailResponse, error) {
	// Get client information
	clientes, err := ic.dbService.GetClientes()
	if err != nil {
		return nil, fmt.Errorf(ErrFailedRetrieveClientForInv)
	}

	var clienteName string
	for _, cliente := range clientes {
		if cliente.CliID == factura.CliID {
			clienteName = cliente.CliNombre + " " + cliente.CliApellido
			break
		}
	}

	// Get invoice details (services)
	detalles, err := ic.dbService.BuscarDetallePorFactura(factura.FacID)
	if err != nil {
		return nil, fmt.Errorf(ErrFailedRetrieveDetails)
	}

	// Get service information
	servicios, err := ic.dbService.ListarServicios()
	if err != nil {
		return nil, fmt.Errorf(ErrFailedRetrieveServicesForInv)
	}

	// Build services string
	serviciosStr := ic.buildServicesString(detalles, servicios)

	response := &InvoiceDetailResponse{
		FacID:     factura.FacID,
		FacTotal:  factura.FacTotal,
		FacFecha:  factura.FacFecha.Format("2006-01-02"),
		FacHora:   factura.FacHora,
		CliID:     factura.CliID,
		CliNombre: clienteName,
		Servicios: serviciosStr,
	}

	return response, nil
}

// Helper method to build services string
func (ic *InvoiceController) buildServicesString(detalles []models.DetalleFacturaServicio, servicios []models.Service) string {
	var serviceNames []string
	for _, detalle := range detalles {
		for _, servicio := range servicios {
			if servicio.SerID == detalle.SerID {
				serviceNames = append(serviceNames, servicio.SerNombre)
				break
			}
		}
	}

	serviciosStr := ""
	for i, name := range serviceNames {
		if i > 0 {
			serviciosStr += ", "
		}
		serviciosStr += name
	}
	return serviciosStr
}

// GetAllInvoicesWithDetails returns all invoices with complete information
func (ic *InvoiceController) GetAllInvoicesWithDetails(c *gin.Context) {
	// Get all required data
	facturas, clientes, servicios, err := ic.getAllRequiredData()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var invoicesWithDetails []InvoiceDetailResponse

	for _, factura := range facturas {
		invoiceDetail := ic.processInvoiceWithDetails(factura, clientes, servicios)
		if invoiceDetail != nil {
			invoicesWithDetails = append(invoicesWithDetails, *invoiceDetail)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"invoices": invoicesWithDetails,
		"total":    len(invoicesWithDetails),
	})
}

// Helper method to get all required data
func (ic *InvoiceController) getAllRequiredData() ([]models.FacturaServicio, []models.Client, []models.Service, error) {
	// Get all invoices
	facturas, err := ic.dbService.ListarFacturas()
	if err != nil {
		return nil, nil, nil, fmt.Errorf(ErrFailedRetrieveInvoices)
	}

	// Get all clients
	clientes, err := ic.dbService.GetClientes()
	if err != nil {
		return nil, nil, nil, fmt.Errorf(ErrFailedRetrieveClientForInv)
	}

	// Get all services
	servicios, err := ic.dbService.ListarServicios()
	if err != nil {
		return nil, nil, nil, fmt.Errorf(ErrFailedRetrieveServicesForInv)
	}

	return facturas, clientes, servicios, nil
}

// Helper method to process a single invoice with details
func (ic *InvoiceController) processInvoiceWithDetails(factura models.FacturaServicio, clientes []models.Client, servicios []models.Service) *InvoiceDetailResponse {
	// Find client name
	clienteName := ic.findClientName(factura.CliID, clientes)

	// Get invoice details
	detalles, err := ic.dbService.BuscarDetallePorFactura(factura.FacID)
	if err != nil {
		return nil // Skip this invoice if we can't get details
	}

	// Build services string
	serviciosStr := ic.buildServicesString(detalles, servicios)

	return &InvoiceDetailResponse{
		FacID:     factura.FacID,
		FacTotal:  factura.FacTotal,
		FacFecha:  factura.FacFecha.Format("2006-01-02"),
		FacHora:   factura.FacHora,
		CliID:     factura.CliID,
		CliNombre: clienteName,
		Servicios: serviciosStr,
	}
}

// Helper method to find client name
func (ic *InvoiceController) findClientName(cliID uint, clientes []models.Client) string {
	for _, cliente := range clientes {
		if cliente.CliID == cliID {
			return cliente.CliNombre + " " + cliente.CliApellido
		}
	}
	return ""
}

// AddServiceToInvoice adds a single service to an existing invoice
func (ic *InvoiceController) AddServiceToInvoice(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": ErrInvalidInvoiceID})
		return
	}

	var req struct {
		SerID uint `json:"ser_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// The stored procedure will automatically calculate the new total
	err = ic.dbService.InsertarDetalleFactura(uint(id), req.SerID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": ErrFailedAddService})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Service added to invoice successfully"})
}

// UpdateInvoice updates an existing invoice
func (ic *InvoiceController) UpdateInvoice(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": ErrInvalidInvoiceID})
		return
	}

	var req struct {
		FacTotal float64 `json:"fac_total" binding:"required"`
		FacFecha string  `json:"fac_fecha" binding:"required"`
		FacHora  string  `json:"fac_hora" binding:"required"`
		CliID    uint    `json:"cli_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err = ic.dbService.ActualizarFactura(uint(id), req.FacTotal, req.FacFecha, req.FacHora, req.CliID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": ErrFailedUpdateInvoice})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Invoice updated successfully"})
}

// DeleteInvoice deletes an invoice and its details
func (ic *InvoiceController) DeleteInvoice(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": ErrInvalidInvoiceID})
		return
	}

	err = ic.dbService.EliminarFactura(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": ErrFailedDeleteInvoice})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Invoice deleted successfully"})
}

// RemoveServiceFromInvoice removes a service from an invoice
func (ic *InvoiceController) RemoveServiceFromInvoice(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": ErrInvalidInvoiceID})
		return
	}

	// The stored procedure will automatically recalculate the total
	err = ic.dbService.EliminarDetalleFactura(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": ErrFailedRemoveService})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Service removed from invoice successfully"})
}

// GetMyInvoices returns invoices for the authenticated client user
func (ic *InvoiceController) GetMyInvoices(c *gin.Context) {
	// Get client ID from JWT token
	clientID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Client ID not found in token"})
		return
	}

	cliID, ok := clientID.(uint)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid client ID format"})
		return
	}

	// Get client invoices using the new stored procedure
	invoices, err := ic.dbService.ListarFacturasCliente(cliID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": ErrFailedRetrieveInvoices})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"invoices": invoices,
		"total":    len(invoices),
	})
}
