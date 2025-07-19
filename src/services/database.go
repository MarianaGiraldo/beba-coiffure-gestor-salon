package services

import (
	"log"
	"salon/config"
	"salon/models"

	"golang.org/x/crypto/bcrypt"
)

func InitializeDatabase() error {
	db := config.AppConfig.DB

	// Auto-migrate all models
	err := db.AutoMigrate(
		&models.Admin{},
		// &models.Employee{},
		// &models.Client{},
		// &models.Service{},
		// &models.Product{},
		// &models.Inventory{},
		// &models.Supplier{},
		// &models.Purchase{},
		// &models.Payment{},
		// &models.ClientPayment{},
		// &models.Appointment{},
		// &models.Promotion{},
	)

	if err != nil {
		return err
	}

	// Create default admin user if not exists
	var admin models.Admin
	if err := db.Where("email = ?", config.AppConfig.AdminEmail).First(&admin).Error; err != nil {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(config.AppConfig.AdminPass), bcrypt.DefaultCost)
		if err != nil {
			return err
		}

		admin = models.Admin{
			Email:    config.AppConfig.AdminEmail,
			Password: string(hashedPassword),
			Role:     "admin",
		}

		if err := db.Create(&admin).Error; err != nil {
			return err
		}

		log.Println("Default admin user created")
	}

	log.Println("Database initialized successfully")
	return nil
}
