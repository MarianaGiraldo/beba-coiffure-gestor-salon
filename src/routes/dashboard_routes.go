package routes

import (
	"salon/controllers"
	"salon/middleware"
	"salon/services"

	"github.com/gin-gonic/gin"
)

// SetupDashboardRoutes configures all dashboard-related routes
func SetupDashboardRoutes(api *gin.RouterGroup, dbService *services.DatabaseService) {
	// Initialize dashboard controller
	dashboardController := controllers.NewDashboardController(dbService)

	// Protected dashboard routes (authenticated admins or employees only)
	protectedDashboard := api.Group("/dashboard")
	protectedDashboard.Use(middleware.AuthMiddleware(), middleware.EmployeeOrAdminMiddleware())
	{
		// Dashboard metrics endpoints
		protectedDashboard.GET("", dashboardController.GetDashboardMetrics)         // All metrics
		protectedDashboard.GET("/employees", dashboardController.GetEmployeesMetrics)       // Employee metrics
		protectedDashboard.GET("/appointments", dashboardController.GetAppointmentsMetrics) // Appointment metrics
		protectedDashboard.GET("/financial", dashboardController.GetFinancialMetrics)       // Financial metrics
		protectedDashboard.GET("/inventory", dashboardController.GetInventoryMetrics)       // Inventory metrics
		protectedDashboard.GET("/services", dashboardController.GetServicesMetrics)         // Service metrics
		protectedDashboard.GET("/suppliers", dashboardController.GetSuppliersMetrics)       // Supplier metrics
	}
}
