package routes

import (
	"salon/config"
	"salon/controllers"
	"salon/middleware"
	"salon/services"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	// Initialize database service
	dbService := services.NewDatabaseService(config.AppConfig.DB)

	// Initialize controllers
	authController := controllers.NewAuthController(dbService)
	employeeController := controllers.NewSPEmployeeController(dbService)

	// Public routes
	api := r.Group("/api")
	{
		// Health check endpoint
		api.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{"status": "ok", "message": "API is running"})
		})

		// Debug endpoint to test employee controller
		api.GET("/test/employees", func(c *gin.Context) {
			c.JSON(200, gin.H{"status": "ok", "message": "Employee controller accessible"})
		})

		// Authentication routes
		auth := api.Group("/auth")
		{
			auth.POST("/login", authController.Login)
			auth.POST("/register", authController.Register)
		}
		protectedEmployees := api.Group("/employees")
		protectedEmployees.Use(middleware.AuthMiddleware(), middleware.AdminOnlyMiddleware())
		// Employee routes directly in API group
		protectedEmployees.GET("", employeeController.GetEmployees)
		protectedEmployees.POST("", employeeController.CreateEmployee)
		protectedEmployees.PUT("/:id", employeeController.UpdateEmployee)
		protectedEmployees.DELETE("/:id", employeeController.DeleteEmployee)

		// Setup client routes from separate file
		SetupClientRoutes(api, dbService)

		// Setup service routes
		SetupServiceRoutes(api, dbService)

		// Setup supplier routes
		SetupSupplierRoutes(api, dbService)

		// Setup appointment routes
		SetupAppointmentRoutes(api, dbService)

		// Setup payment routes
		SetupPaymentRoutes(api, dbService)

		// Setup promotion routes
		SetupPromotionRoutes(api, dbService)
	}

	// Protected routes
	protected := api.Group("/")
	// protected.Use(middleware.AuthMiddleware())
	{
		// User profile
		protected.GET("/me", authController.Me)

		// Employee management routes moved to public for testing
		// employees := protected.Group("/employees")
		// employees.Use(middleware.AdminOnlyMiddleware())
		// {
		//	employees.GET("/", employeeController.GetEmployees)
		//	employees.GET("/:id", employeeController.GetEmployee)
		//	employees.POST("/", employeeController.CreateEmployee)
		//	employees.PUT("/:id", employeeController.UpdateEmployee)
		//	employees.DELETE("/:id", employeeController.DeleteEmployee)
		// }

		// Employee payments (Admin only)
		payments := protected.Group("/payments")
		payments.Use(middleware.AdminOnlyMiddleware())
		{
			// payments.GET("/", employeeController.GetPayments)
			// payments.POST("/", employeeController.CreatePayment)
		}

		// Add more route groups here for other modules:
		// - services
		// - inventory
		// - suppliers
		// - promotions
		// - financial
		// Note: clients routes are handled in client_routes.go
	}

	// Serve React frontend (for production)
	r.Static("/assets", "./frontend/dist/assets")
	r.StaticFile("/", "./frontend/dist/index.html")
	r.NoRoute(func(c *gin.Context) {
		c.File("./frontend/dist/index.html")
	})
}
