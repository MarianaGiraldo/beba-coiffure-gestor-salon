package routes

import (
	"net/http"
	"salon/controllers"
	"salon/middleware"
	"salon/services"

	"github.com/gin-gonic/gin"
)

// SetupPurchaseRoutes configures all purchase-related routes
func SetupPurchaseRoutes(api *gin.RouterGroup, dbService *services.DatabaseService) {
	// Initialize purchase controller
	purchaseController := controllers.NewPurchaseManagementController(dbService)

	// Test endpoint (no auth required for testing)
	api.GET("/purchases/test", func(ctx *gin.Context) {
		ctx.JSON(http.StatusOK, gin.H{"message": "Test endpoint for purchases"})
	})

	// All purchase routes require authentication
	protectedPurchases := api.Group("/purchases")
	protectedPurchases.Use(middleware.AuthMiddleware())
	{
		// General purchase routes (accessible to authenticated users)
		protectedPurchases.GET("", purchaseController.GetPurchases)     // Get all purchases
		protectedPurchases.GET("/:id", purchaseController.GetPurchase)  // Get purchase by ID

		// Admin only routes for purchase management
		adminPurchases := protectedPurchases.Group("")
		adminPurchases.Use(middleware.AdminOnlyMiddleware())
		{
			adminPurchases.POST("", purchaseController.CreatePurchase)       // Create purchase
			adminPurchases.PUT("/:id", purchaseController.UpdatePurchase)    // Update purchase
			adminPurchases.DELETE("/:id", purchaseController.DeletePurchase) // Delete purchase

			// Purchase detail management routes
			adminPurchases.GET("/:id/details", purchaseController.GetPurchaseDetails)            // Get purchase details
			adminPurchases.POST("/:id/details", purchaseController.AddPurchaseDetail)            // Add detail to purchase
			adminPurchases.PUT("/:id/details/:prodId", purchaseController.UpdatePurchaseDetail)  // Update purchase detail
			adminPurchases.DELETE("/:id/details/:prodId", purchaseController.DeletePurchaseDetail) // Delete purchase detail
		}

		// Employee routes (can view purchases)
		// employeePurchases := protectedPurchases.Group("/employee")
		// {
		//     // These routes will be accessible to employees
		//     // employeePurchases.GET("/recent", purchaseController.GetRecentPurchases)
		// }
	}
}
