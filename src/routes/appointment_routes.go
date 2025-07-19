package routes

import (
	"net/http"
	"salon/controllers"
	"salon/middleware"
	"salon/services"

	"github.com/gin-gonic/gin"
)

// SetupAppointmentRoutes configures all appointment-related routes
func SetupAppointmentRoutes(api *gin.RouterGroup, dbService *services.DatabaseService) {
	// Initialize appointment controller
	appointmentController := controllers.NewAppointmentController(dbService)

	// Test endpoint
	api.GET("/appointments/test", func(ctx *gin.Context) {
		ctx.JSON(http.StatusOK, gin.H{"message": "Test endpoint for appointments"})
	})

	// Protected appointment routes (authentication required)
	protectedAppointments := api.Group("/appointments")
	protectedAppointments.Use(middleware.AuthMiddleware())
	{
		// Admin and employee routes for appointment management
		adminAppointments := protectedAppointments.Group("")
		adminAppointments.Use(middleware.AdminOnlyMiddleware())
		{
			adminAppointments.GET("", appointmentController.GetAppointments)                            // Get all appointments
			adminAppointments.GET("/:id", appointmentController.GetAppointment)                         // Get appointment by ID
			adminAppointments.POST("", appointmentController.CreateAppointment)                         // Create appointment
			adminAppointments.PUT("/:id", appointmentController.UpdateAppointment)                      // Update appointment
			adminAppointments.DELETE("/:id", appointmentController.DeleteAppointment)                   // Delete appointment
			adminAppointments.GET("/employee/:emp_id", appointmentController.GetAppointmentsByEmployee) // Get appointments by employee
			adminAppointments.GET("/client/:cli_id", appointmentController.GetAppointmentsByClient)     // Get appointments by client
			adminAppointments.GET("/date/:date", appointmentController.GetAppointmentsByDate)           // Get appointments by date (YYYY-MM-DD)
		}

		// Client routes (for their own appointments) - Future implementation
		// clientAppointments := protectedAppointments.Group("/my")
		// {
		//     // These routes will be accessible to clients for their own appointments
		//     // clientAppointments.GET("", appointmentController.GetMyAppointments)      // Get client's own appointments
		//     // clientAppointments.POST("", appointmentController.BookAppointment)      // Book new appointment
		//     // clientAppointments.PUT("/:id", appointmentController.UpdateMyAppointment) // Update own appointment
		//     // clientAppointments.DELETE("/:id", appointmentController.CancelMyAppointment) // Cancel own appointment
		// }

		// Employee routes (for their assigned appointments) - Future implementation
		// employeeAppointments := protectedAppointments.Group("/employee")
		// {
		//     // These routes will be accessible to employees for their assigned appointments
		//     // employeeAppointments.GET("/my", appointmentController.GetMyAppointments)     // Get employee's appointments
		//     // employeeAppointments.PUT("/:id/status", appointmentController.UpdateAppointmentStatus) // Update appointment status
		//     // employeeAppointments.GET("/today", appointmentController.GetTodayAppointments) // Get today's appointments
		// }
	}
}
