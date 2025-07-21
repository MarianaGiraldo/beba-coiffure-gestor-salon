package routes

import (
	"salon/controllers"
	"salon/middleware"
	"salon/services"

	"github.com/gin-gonic/gin"
)

// SetupInventoryRoutes configures all inventory-related routes
func SetupInventoryRoutes(api *gin.RouterGroup, dbService *services.DatabaseService) {
	// Initialize inventory controller
	inventoryController := controllers.NewInventoryController(dbService)

	// Protected inventory routes (admin/employee only)
	protectedInventory := api.Group("/inventory")
	protectedInventory.Use(middleware.AuthMiddleware())
	{
		// Admin only routes for inventory management
		adminInventory := protectedInventory.Group("")
		adminInventory.Use(middleware.EmployeeOrAdminMiddleware())
		{
			// Inventory endpoints
			adminInventory.GET("", inventoryController.GetInventoryComplete)   // Get all inventory with product info
			adminInventory.POST("", inventoryController.CreateInventory)       // Create inventory entry
			adminInventory.PUT("/:id", inventoryController.UpdateInventory)    // Update inventory entry
			adminInventory.DELETE("/:id", inventoryController.DeleteInventory) // Delete inventory entry

			// Product endpoints
			adminInventory.GET("/products", inventoryController.GetProducts)          // Get all products
			adminInventory.POST("/products", inventoryController.CreateProduct)       // Create product
			adminInventory.PUT("/products/:id", inventoryController.UpdateProduct)    // Update product
			adminInventory.DELETE("/products/:id", inventoryController.DeleteProduct) // Delete product
		}
	}
}
