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
		// Routes accessible by all authenticated users (for creating appointments)
		protectedAppointments.POST("", appointmentController.CreateAppointment) // Create appointment (clients can book their own)

		// Admin and employee routes for appointment management
		adminAppointments := protectedAppointments.Group("")
		adminAppointments.Use(middleware.EmployeeOrAdminMiddleware())
		{
			adminAppointments.GET("", appointmentController.GetAppointments)                            // Get all appointments
			adminAppointments.GET("/:id", appointmentController.GetAppointment)                         // Get appointment by ID
			adminAppointments.PUT("/:id", appointmentController.UpdateAppointment)                      // Update appointment
			adminAppointments.DELETE("/:id", appointmentController.DeleteAppointment)                   // Delete appointment
			adminAppointments.GET("/employee/:emp_id", appointmentController.GetAppointmentsByEmployee) // Get appointments by employee
			adminAppointments.GET("/client/:cli_id", appointmentController.GetAppointmentsByClient)     // Get appointments by client
			adminAppointments.GET("/date/:date", appointmentController.GetAppointmentsByDate)           // Get appointments by date (YYYY-MM-DD)
		}

		// Client routes (for their own appointments)
		clientAppointments := protectedAppointments.Group("/my")
		clientAppointments.Use(middleware.ClientOnlyMiddleware())
		{
			clientAppointments.GET("", appointmentController.GetMyAppointments) // Get client's own appointments
		}

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
