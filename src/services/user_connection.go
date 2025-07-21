package services

import (
	"fmt"
	"log"
	"sync"
	"time"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type UserConnectionService struct {
	userConnections map[string]*gorm.DB
	connectionTimes map[string]time.Time // Track when connections were created
	mutex           sync.RWMutex
	dbHost          string
	dbPort          string
	dbName          string
}

func NewUserConnectionService(dbHost, dbPort, dbName string) *UserConnectionService {
	log.Printf("[CONNECTION] Initializing UserConnectionService for %s:%s/%s", dbHost, dbPort, dbName)
	return &UserConnectionService{
		userConnections: make(map[string]*gorm.DB),
		connectionTimes: make(map[string]time.Time),
		dbHost:          dbHost,
		dbPort:          dbPort,
		dbName:          dbName,
	}
}

func (s *UserConnectionService) GetUserConnection(email, password, role string) (*gorm.DB, error) {
	s.mutex.RLock()
	if conn, exists := s.userConnections[email]; exists {
		s.mutex.RUnlock()
		log.Printf("[CONNECTION] Reusing existing connection for user: %s (role: %s)", email, role)
		return conn, nil
	}
	s.mutex.RUnlock()

	log.Printf("[CONNECTION] Creating new connection for user: %s (role: %s)", email, role)

	// Create DSN with user credentials
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		email, password, s.dbHost, s.dbPort, s.dbName)

	// Connect to database with user credentials
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Printf("[CONNECTION] Failed to connect for user %s: %v", email, err)
		return nil, fmt.Errorf("failed to connect with user credentials: %v", err)
	}

	// Set the appropriate role based on user type
	var mysqlRole string
	switch role {
	case "admin":
		mysqlRole = "rol_admin"
	case "empleado":
		mysqlRole = "rol_empleado"
	case "cliente":
		mysqlRole = "rol_cliente"
	default:
		log.Printf("[CONNECTION] Invalid role specified: %s for user: %s", role, email)
		return nil, fmt.Errorf("invalid role: %s", role)
	}

	// Set the user's role for this connection
	log.Printf("[CONNECTION] Setting role %s for user: %s", mysqlRole, email)
	if err := db.Exec(fmt.Sprintf("SET ROLE '%s'@'%%'", mysqlRole)).Error; err != nil {
		log.Printf("[CONNECTION] Failed to set role %s for user %s: %v", mysqlRole, email, err)
		return nil, fmt.Errorf("failed to set role %s: %v", mysqlRole, err)
	}

	s.mutex.Lock()
	s.userConnections[email] = db
	s.connectionTimes[email] = time.Now()
	s.mutex.Unlock()

	log.Printf("[CONNECTION] Successfully created and stored connection for user: %s with role: %s", email, mysqlRole)
	log.Printf("[CONNECTION] Active connections count: %d", len(s.userConnections))

	return db, nil
}

func (s *UserConnectionService) CloseUserConnection(email string) error {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	if conn, exists := s.userConnections[email]; exists {
		connectionDuration := time.Since(s.connectionTimes[email])
		log.Printf("[CONNECTION] Closing connection for user: %s (duration: %v)", email, connectionDuration)

		sqlDB, err := conn.DB()
		if err == nil {
			sqlDB.Close()
		}
		delete(s.userConnections, email)
		delete(s.connectionTimes, email)

		log.Printf("[CONNECTION] Connection closed for user: %s. Active connections: %d", email, len(s.userConnections))
	} else {
		log.Printf("[CONNECTION] No connection found to close for user: %s", email)
	}
	return nil
}

func (s *UserConnectionService) CloseAllUserConnections() {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	log.Printf("[CONNECTION] Closing all user connections. Current count: %d", len(s.userConnections))

	for email, conn := range s.userConnections {
		if email != "admin" { // Don't close admin connection
			connectionDuration := time.Since(s.connectionTimes[email])
			log.Printf("[CONNECTION] Closing connection for user: %s (duration: %v)", email, connectionDuration)

			if sqlDB, err := conn.DB(); err == nil {
				sqlDB.Close()
			}
			delete(s.userConnections, email)
			delete(s.connectionTimes, email)
		}
	}

	log.Printf("[CONNECTION] All user connections closed. Remaining connections: %d", len(s.userConnections))
}

func (s *UserConnectionService) GetActiveConnections() []string {
	s.mutex.RLock()
	defer s.mutex.RUnlock()

	var connections []string
	for email := range s.userConnections {
		connections = append(connections, email)
	}
	return connections
}

// GetConnectionsInfo returns detailed information about active connections
func (s *UserConnectionService) GetConnectionsInfo() map[string]interface{} {
	s.mutex.RLock()
	defer s.mutex.RUnlock()

	connectionsInfo := make(map[string]interface{})
	connectionsInfo["total_count"] = len(s.userConnections)
	connectionsInfo["connections"] = make([]map[string]interface{}, 0)

	for email, _ := range s.userConnections {
		connectionInfo := map[string]interface{}{
			"user":      email,
			"connected": s.connectionTimes[email].Format("2006-01-02 15:04:05"),
			"duration":  time.Since(s.connectionTimes[email]).String(),
		}
		connectionsInfo["connections"] = append(connectionsInfo["connections"].([]map[string]interface{}), connectionInfo)
	}

	return connectionsInfo
}

// LogConnectionsStatus logs the current status of all connections
func (s *UserConnectionService) LogConnectionsStatus() {
	s.mutex.RLock()
	defer s.mutex.RUnlock()

	log.Printf("[CONNECTION] === Connection Status Report ===")
	log.Printf("[CONNECTION] Total active connections: %d", len(s.userConnections))

	if len(s.userConnections) == 0 {
		log.Printf("[CONNECTION] No active connections")
		return
	}

	for email, _ := range s.userConnections {
		duration := time.Since(s.connectionTimes[email])
		log.Printf("[CONNECTION] User: %s | Connected: %s | Duration: %v",
			email,
			s.connectionTimes[email].Format("15:04:05"),
			duration)
	}
	log.Printf("[CONNECTION] === End Connection Report ===")
}
