package routes

import (
	"net/http"
	"salon/controllers"
	"salon/middleware"
	"salon/services"

	"github.com/gin-gonic/gin"
)

// SetupClientRoutes configures all client-related routes
func SetupClientRoutes(api *gin.RouterGroup, dbService *services.DatabaseService) {
	// Initialize client controller
	clientController := controllers.NewClientController(dbService)
	api.GET("/clients/test", func(ctx *gin.Context) {
		ctx.JSON(http.StatusOK, gin.H{"message": "Test endpoint for clients"})
	})

	// Protected client routes (for admin/employee management)
	protectedClients := api.Group("/clients")
	protectedClients.Use(middleware.AuthMiddleware())
	{
		// Admin only routes for client management
		adminClients := protectedClients.Group("")
		adminClients.Use(middleware.AdminOnlyMiddleware())
		{
			adminClients.GET("", clientController.GetClients)         // Get all clients
			adminClients.POST("", clientController.CreateClient)      // Create client (admin)
			adminClients.PUT("/:id", clientController.UpdateClient)    // Update client
			adminClients.DELETE("/:id", clientController.DeleteClient) // Delete client
		}

		// Client profile routes (for authenticated clients) - TODO: Implement
		// profileClients := protectedClients.Group("/profile")
		// {
		//     // These routes will be accessible to the client themselves
		//     // profileClients.GET("/", clientController.GetProfile)     // Get own profile
		//     // profileClients.PUT("/", clientController.UpdateProfile)  // Update own profile
		//     // profileClients.DELETE("/", clientController.DeleteProfile) // Delete own account
		// }
	}
}
