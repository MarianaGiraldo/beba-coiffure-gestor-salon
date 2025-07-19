package routes

import (
	"net/http"
	"salon/controllers"
	"salon/middleware"
	"salon/services"

	"github.com/gin-gonic/gin"
)

// SetupServiceRoutes configures all service-related routes
func SetupServiceRoutes(api *gin.RouterGroup, dbService *services.DatabaseService) {
	// Initialize service controller
	serviceController := controllers.NewServiceManagementController(dbService)

	// Test endpoint (no auth required for testing)
	api.GET("/services/test", func(ctx *gin.Context) {
		ctx.JSON(http.StatusOK, gin.H{"message": "Test endpoint for services"})
	})

	// All service routes require authentication
	protectedServices := api.Group("/services")
	protectedServices.Use(middleware.AuthMiddleware())
	{
		// General service routes (accessible to authenticated users)
		protectedServices.GET("", serviceController.GetServices)                              // Get all services
		protectedServices.GET("/:id", serviceController.GetService)                           // Get service by ID
		protectedServices.GET("/category/:category", serviceController.GetServicesByCategory) // Get services by category
		protectedServices.GET("/stats", serviceController.GetServiceStats)                    // Get service statistics

		// Admin only routes for service management
		adminServices := protectedServices.Group("")
		adminServices.Use(middleware.AdminOnlyMiddleware())
		{
			adminServices.POST("", serviceController.CreateService)       // Create service
			adminServices.PUT("/:id", serviceController.UpdateService)    // Update service
			adminServices.DELETE("/:id", serviceController.DeleteService) // Delete service
		}

		// Employee routes (can view and manage services they offer)
		// employeeServices := protectedServices.Group("/employee")
		// {
		//     // These routes will be accessible to employees
		//     // employeeServices.GET("/my-services", serviceController.GetEmployeeServices)
		// }
	}
}
