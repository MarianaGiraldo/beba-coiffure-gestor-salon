package main

import (
	"log"
	"os"
	"os/signal"
	"salon/config"
	"salon/routes"
	"salon/services"
	"syscall"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	if err := config.LoadConfig(); err != nil {
		log.Fatal("Failed to load configuration:", err)
	}

	// Initialize UserConnectionService after config is loaded
	userConnService := services.NewUserConnectionService(
		config.AppConfig.DBHost,
		config.AppConfig.DBPort,
		config.AppConfig.DBName,
	)
	config.AppConfig.UserConnectionService = userConnService

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

	// Graceful shutdown handler
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)
	go func() {
		<-c
		log.Println("Shutting down gracefully...")
		if userConnService, ok := config.AppConfig.UserConnectionService.(*services.UserConnectionService); ok {
			userConnService.CloseAllUserConnections()
		}
		os.Exit(0)
	}()

	// Start server
	serverAddr := config.AppConfig.ServerHost + ":" + config.AppConfig.ServerPort
	log.Printf("Server starting on http://%s", serverAddr)
	log.Fatal(r.Run(":" + config.AppConfig.ServerPort))
}
