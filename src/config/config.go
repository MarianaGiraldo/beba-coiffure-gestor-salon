package config

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type Config struct {
	DB                    *gorm.DB
	UserConnectionService interface{} // Use interface{} to avoid circular import
	ServerPort            string
	ServerHost            string
	JWTSecret             string
	JWTExpires            string
	AdminEmail            string
	AdminPass             string
	FrontendURL           string
	DBHost                string
	DBPort                string
	DBName                string
	DBUser                string
	DBPassword            string
}

var AppConfig *Config

func LoadConfig() error {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	// Database connection details
	dbHost := getEnv("DB_HOST", "localhost")
	dbPort := getEnv("DB_PORT", "3306")
	dbUser := getEnv("DB_USER", "salon_user")
	dbPassword := getEnv("DB_PASSWORD", "salon_password_456")
	dbName := getEnv("DB_NAME", "salondb")

	log.Printf("Connecting to database %s at %s:%s as user %s", dbName, dbHost, dbPort, dbUser)

	// Create DSN (Data Source Name) for admin connection
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		dbUser, dbPassword, dbHost, dbPort, dbName)

	// Connect to database with admin credentials
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return fmt.Errorf("failed to connect to database: %v", err)
	}

	// Set admin role for the default connection
	db.Exec("SET ROLE 'rol_admin'@'%'")

	// Initialize config (UserConnectionService will be set separately to avoid circular import)
	AppConfig = &Config{
		DB:                    db,
		UserConnectionService: nil, // Will be set in main
		ServerPort:            getEnv("SERVER_PORT", "8080"),
		ServerHost:            getEnv("SERVER_HOST", "localhost"),
		JWTSecret:             getEnv("JWT_SECRET", "default_secret_key"),
		JWTExpires:            getEnv("JWT_EXPIRES_IN", "24h"),
		AdminEmail:            getEnv("ADMIN_EMAIL", "admin@bebacoiffure.com"),
		AdminPass:             getEnv("ADMIN_PASSWORD", "admin123"),
		FrontendURL:           getEnv("FRONTEND_URL", "http://localhost:5173"),
		DBHost:                dbHost,
		DBPort:                dbPort,
		DBName:                dbName,
		DBUser:                dbUser,
		DBPassword:            dbPassword,
	}

	return nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
