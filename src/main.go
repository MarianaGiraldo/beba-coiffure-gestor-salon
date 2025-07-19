package main

import (
	"log"
	"salon/config"
	"salon/routes"
	"salon/services"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	if err := config.LoadConfig(); err != nil {
		log.Fatal("Failed to load configuration:", err)
	}

	// Initialize database
	if err := services.InitializeDatabase(); err != nil {
		log.Fatal("Failed to initialize database:", err)
	}

	// Create Gin router
	r := gin.Default()

	// CORS middleware - temporarily allow all origins for debugging
	corsConfig := cors.Config{
		AllowOrigins:     []string{"http://localhost:5174"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: false, // still false, since you're not using cookies
	}
	r.Use(cors.New(corsConfig))

	// Debug middleware to log requests
	r.Use(gin.Logger())

	// Setup routes
	routes.SetupRoutes(r)

	// Start server
	serverAddr := config.AppConfig.ServerHost + ":" + config.AppConfig.ServerPort
	log.Printf("Server starting on http://%s", serverAddr)
	log.Fatal(r.Run(":" + config.AppConfig.ServerPort))
}
