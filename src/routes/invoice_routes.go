package routes

import (
	"net/http"
	"salon/controllers"
	"salon/middleware"
	"salon/services"

	"github.com/gin-gonic/gin"
)

// SetupInvoiceRoutes configures all invoice-related routes
func SetupInvoiceRoutes(api *gin.RouterGroup, dbService *services.DatabaseService) {
	// Initialize invoice controller
	invoiceController := controllers.NewInvoiceController(dbService)

	// Test endpoint
	api.GET("/invoices/test", func(ctx *gin.Context) {
		ctx.JSON(http.StatusOK, gin.H{"message": "Invoice routes are working"})
	})

	// Protected invoice routes
	protectedInvoices := api.Group("/invoices")
	protectedInvoices.Use(middleware.AuthMiddleware())
	{
		// Admin and employee routes for invoice management
		adminInvoices := protectedInvoices.Group("")
		adminInvoices.Use(middleware.AdminOnlyMiddleware())
		{
			// Basic invoice CRUD operations
			adminInvoices.GET("", invoiceController.GetInvoices)          // Get all invoices (basic info)
			adminInvoices.POST("", invoiceController.CreateInvoice)       // Create new invoice with services
			adminInvoices.GET("/:id", invoiceController.GetInvoiceByID)   // Get specific invoice (basic info)
			adminInvoices.PUT("/:id", invoiceController.UpdateInvoice)    // Update invoice
			adminInvoices.DELETE("/:id", invoiceController.DeleteInvoice) // Delete invoice

			// Invoice details management
			adminInvoices.GET("/:id/details", invoiceController.GetInvoiceDetails)            // Get invoice with full details
			adminInvoices.POST("/:id/services", invoiceController.AddServiceToInvoice)        // Add service to existing invoice
			adminInvoices.DELETE("/:id/services", invoiceController.RemoveServiceFromInvoice) // Remove service from invoice

			// Full invoice listing with details (main endpoint for frontend)
			adminInvoices.GET("/details", invoiceController.GetAllInvoicesWithDetails) // Get all invoices with full details
		}

		// Employee routes (read-only access to invoices)
		employeeInvoices := protectedInvoices.Group("/employee")
		{
			employeeInvoices.GET("", invoiceController.GetInvoices)                       // View all invoices
			employeeInvoices.GET("/:id", invoiceController.GetInvoiceByID)                // View specific invoice
			employeeInvoices.GET("/:id/details", invoiceController.GetInvoiceDetails)     // View invoice details
			employeeInvoices.GET("/details", invoiceController.GetAllInvoicesWithDetails) // View all invoices with details
		}
	}
}
