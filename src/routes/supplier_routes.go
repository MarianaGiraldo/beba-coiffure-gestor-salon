package routes

import (
	"net/http"
	"salon/controllers"
	"salon/middleware"
	"salon/services"

	"github.com/gin-gonic/gin"
)

// SetupSupplierRoutes configures all supplier-related routes
func SetupSupplierRoutes(api *gin.RouterGroup, dbService *services.DatabaseService) {
	// Initialize supplier controller
	supplierController := controllers.NewSupplierController(dbService)

	// Test endpoint (no auth required for testing)
	api.GET("/suppliers/test", func(ctx *gin.Context) {
		ctx.JSON(http.StatusOK, gin.H{"message": "Test endpoint for suppliers"})
	})

	// All supplier routes require authentication
	protectedSuppliers := api.Group("/suppliers")
	protectedSuppliers.Use(middleware.AuthMiddleware())
	{
		// General supplier routes (accessible to authenticated users)
		protectedSuppliers.GET("", supplierController.GetSuppliers)           // Get all suppliers
		protectedSuppliers.GET("/:id", supplierController.GetSupplier)        // Get supplier by ID
		protectedSuppliers.GET("/stats", supplierController.GetSupplierStats) // Get supplier statistics

		// Admin only routes for supplier management
		adminSuppliers := protectedSuppliers.Group("")
		adminSuppliers.Use(middleware.AdminOnlyMiddleware())
		{
			adminSuppliers.POST("", supplierController.CreateSupplier)       // Create supplier
			adminSuppliers.PUT("/:id", supplierController.UpdateSupplier)    // Update supplier
			adminSuppliers.DELETE("/:id", supplierController.DeleteSupplier) // Delete supplier
		}

		// Employee routes (can view suppliers)
		// employeeSuppliers := protectedSuppliers.Group("/employee")
		// {
		//     // These routes will be accessible to employees
		//     // employeeSuppliers.GET("/", supplierController.GetSuppliers)
		// }
	}
}
