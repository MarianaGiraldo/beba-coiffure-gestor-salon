package services

import (
	"log"
	"salon/config"
	"salon/models"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func InitializeDatabase() error {
	db := config.AppConfig.DB

	// Auto-migrate all models
	// err := db.AutoMigrate(
	// 	&models.Admin{},
	// 	&models.Employee{},
	// 	&models.Client{},
	// 	&models.Service{},
	// 	&models.Product{},
	// 	&models.Inventory{},
	// 	&models.Supplier{},
	// 	&models.Purchase{},
	// 	&models.Payment{},
	// 	&models.ClientPayment{},
	// 	&models.Appointment{},
	// 	&models.Promotion{},
	// )

	// if err != nil {
	// 	return err
	// }

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

	// Seed some initial data if tables are empty
	seedInitialData(db)

	log.Println("Database initialized successfully")
	return nil
}

func seedInitialData(db *gorm.DB) {
	// Seed sample services if none exist
	var serviceCount int64
	db.Model(&models.Service{}).Count(&serviceCount)
	if serviceCount == 0 {
		services := []models.Service{
			{
				SerNombre:           "Corte de Cabello Dama",
				SerDescripcion:      "Corte profesional para dama con lavado incluido",
				SerPrecioUnitario:   25000,
				SerCategoria:        "Cabello",
				SerDuracionEstimada: 45,
			},
			{
				SerNombre:           "Corte de Cabello Caballero",
				SerDescripcion:      "Corte tradicional o moderno para caballero",
				SerPrecioUnitario:   18000,
				SerCategoria:        "Cabello",
				SerDuracionEstimada: 30,
			},
			{
				SerNombre:           "Coloración Completa",
				SerDescripcion:      "Aplicación de color permanente en todo el cabello",
				SerPrecioUnitario:   80000,
				SerCategoria:        "Cabello",
				SerDuracionEstimada: 120,
			},
			{
				SerNombre:           "Manicure Tradicional",
				SerDescripcion:      "Cuidado completo de uñas con esmaltado",
				SerPrecioUnitario:   20000,
				SerCategoria:        "Uñas",
				SerDuracionEstimada: 45,
			},
			{
				SerNombre:           "Tratamiento Facial",
				SerDescripcion:      "Limpieza facial profunda con mascarilla",
				SerPrecioUnitario:   45000,
				SerCategoria:        "Facial",
				SerDuracionEstimada: 75,
			},
		}

		for _, service := range services {
			db.Create(&service)
		}
		log.Println("Sample services created")
	}

	// Seed sample products if none exist
	var productCount int64
	db.Model(&models.Product{}).Count(&productCount)
	if productCount == 0 {
		products := []models.Product{
			{
				ProdNombre:         "Shampoo Nutritivo",
				ProdDescripcion:    "Shampoo para cabello seco y dañado",
				ProdPrecioUnitario: 35000,
			},
			{
				ProdNombre:         "Acondicionador Hidratante",
				ProdDescripcion:    "Acondicionador para todo tipo de cabello",
				ProdPrecioUnitario: 28000,
			},
			{
				ProdNombre:         "Tinte Profesional",
				ProdDescripcion:    "Tinte permanente profesional",
				ProdPrecioUnitario: 45000,
			},
			{
				ProdNombre:         "Esmalte Premium",
				ProdDescripcion:    "Esmalte de larga duración",
				ProdPrecioUnitario: 15000,
			},
		}

		for _, product := range products {
			db.Create(&product)
			// Create initial inventory entry
			inventory := models.Inventory{
				ProdID:            product.ProdID,
				InvCantidadActual: 10,
				InvObservaciones:  "Stock inicial",
			}
			db.Create(&inventory)
		}
		log.Println("Sample products and inventory created")
	}
}
