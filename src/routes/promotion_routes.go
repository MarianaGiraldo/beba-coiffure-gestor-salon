package routes

import (
	"salon/controllers"
	"salon/middleware"
	"salon/services"

	"github.com/gin-gonic/gin"
)

// SetupPromotionRoutes configures all promotion-related routes
func SetupPromotionRoutes(api *gin.RouterGroup, dbService *services.DatabaseService) {
	// Initialize promotion controller
	promotionController := controllers.NewPromotionController(dbService)

	// Protected promotion routes (authentication required)
	protectedPromotions := api.Group("/promotions")
	protectedPromotions.Use(middleware.AuthMiddleware())
	{
		protectedPromotions.GET("", promotionController.GetPromotions)          // Get all promotions
		// Admin only routes for promotion management
		adminPromotions := protectedPromotions.Group("")
		adminPromotions.Use(middleware.AdminOnlyMiddleware())
		{
			adminPromotions.GET("/:id", promotionController.GetPromotionByID)   // Get promotion by ID
			adminPromotions.POST("", promotionController.CreatePromotion)       // Create promotion
			adminPromotions.PUT("/:id", promotionController.UpdatePromotion)    // Update promotion
			adminPromotions.DELETE("/:id", promotionController.DeletePromotion) // Delete promotion
		}
	}
}
