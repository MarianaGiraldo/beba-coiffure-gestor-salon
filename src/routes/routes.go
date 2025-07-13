package routes

import (
	"salon/controllers"
	"salon/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	// Initialize controllers
	authController := &controllers.AuthController{}
	employeeController := &controllers.EmployeeController{}

	// Public routes
	api := r.Group("/api")
	{
		// Authentication routes
		auth := api.Group("/auth")
		{
			auth.POST("/login", authController.Login)
			auth.POST("/register", authController.Register)
		}
	}

	// Protected routes
	protected := api.Group("/")
	protected.Use(middleware.AuthMiddleware())
	{
		// User profile
		protected.GET("/me", authController.Me)

		// Employee management (Admin only)
		employees := protected.Group("/employees")
		employees.Use(middleware.AdminOnlyMiddleware())
		{
			employees.GET("/", employeeController.GetEmployees)
			employees.GET("/:id", employeeController.GetEmployee)
			employees.POST("/", employeeController.CreateEmployee)
			employees.PUT("/:id", employeeController.UpdateEmployee)
			employees.DELETE("/:id", employeeController.DeleteEmployee)
		}

		// Employee payments (Admin only)
		payments := protected.Group("/payments")
		payments.Use(middleware.AdminOnlyMiddleware())
		{
			payments.GET("/", employeeController.GetPayments)
			payments.POST("/", employeeController.CreatePayment)
		}

		// Add more route groups here for other modules:
		// - clients
		// - services
		// - inventory
		// - suppliers
		// - promotions
		// - financial
	}

	// Serve React frontend (for production)
	r.Static("/assets", "./frontend/dist/assets")
	r.StaticFile("/", "./frontend/dist/index.html")
	r.NoRoute(func(c *gin.Context) {
		c.File("./frontend/dist/index.html")
	})
}
