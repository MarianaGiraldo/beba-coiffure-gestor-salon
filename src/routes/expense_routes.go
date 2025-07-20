package routes

import (
	"net/http"
	"salon/controllers"
	"salon/middleware"
	"salon/services"

	"github.com/gin-gonic/gin"
)

// SetupExpenseRoutes configures all expense-related routes
func SetupExpenseRoutes(api *gin.RouterGroup, dbService *services.DatabaseService) {
	// Initialize expense controller
	expenseController := controllers.NewExpenseManagementController(dbService)

	// Test endpoint (no auth required for testing)
	api.GET("/expenses/test", func(ctx *gin.Context) {
		ctx.JSON(http.StatusOK, gin.H{"message": "Test endpoint for expenses"})
	})

	// All expense routes require authentication
	protectedExpenses := api.Group("/expenses")
	protectedExpenses.Use(middleware.AuthMiddleware())
	{
		// General expense routes (accessible to authenticated users)
		protectedExpenses.GET("", expenseController.GetExpenses)     // Get all expenses
		protectedExpenses.GET("/:id", expenseController.GetExpense)  // Get expense by ID

		// Admin only routes for expense management
		adminExpenses := protectedExpenses.Group("")
		adminExpenses.Use(middleware.AdminOnlyMiddleware())
		{
			adminExpenses.POST("", expenseController.CreateExpense)       // Create expense
			adminExpenses.PUT("/:id", expenseController.UpdateExpense)    // Update expense
			adminExpenses.DELETE("/:id", expenseController.DeleteExpense) // Delete expense
		}

		// Employee routes (can view expenses)
		// employeeExpenses := protectedExpenses.Group("/employee")
		// {
		//     // These routes will be accessible to employees
		//     // employeeExpenses.GET("/recent", expenseController.GetRecentExpenses)
		// }
	}
}
