package routes

import (
	"salon/controllers"
	"salon/middleware"
	"salon/services"

	"github.com/gin-gonic/gin"
)

// SetupPaymentRoutes configures all payment-related routes
func SetupPaymentRoutes(api *gin.RouterGroup, dbService *services.DatabaseService) {
	// Initialize payment controller
	paymentController := controllers.NewPaymentController(dbService)

	// Protected payment routes (require authentication)
	protectedPayments := api.Group("/payments")
	protectedPayments.Use(middleware.AuthMiddleware())
	{
		// Admin only routes for payment management
		adminPayments := protectedPayments.Group("")
		adminPayments.Use(middleware.AdminOnlyMiddleware())
		{
			// Get all payments
			adminPayments.GET("", paymentController.GetPayments)

			// Get all payments with employee information
			adminPayments.GET("/with-employee", paymentController.GetPaymentsWithEmployee)

			// Get payments by specific employee
			adminPayments.GET("/employee/:empId", paymentController.GetPaymentsByEmployee)

			// Create new payment
			adminPayments.POST("", paymentController.CreatePayment)

			// Update existing payment
			adminPayments.PUT("/:id", paymentController.UpdatePayment)

			// Delete payment
			adminPayments.DELETE("/:id", paymentController.DeletePayment)
		}
	}
}
