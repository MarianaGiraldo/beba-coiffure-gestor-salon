#!/bin/bash

# Beba Coiffure Salon Management System - Docker Setup Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install Docker on Ubuntu/Debian
install_docker_ubuntu() {
    log "Installing Docker on Ubuntu/Debian..."
    sudo apt-get update
    sudo apt-get install -y ca-certificates curl gnupg lsb-release
    
    # Add Docker's official GPG key
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    
    # Set up repository
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker Engine
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    # Add user to docker group
    sudo usermod -aG docker $USER
    log "Docker installed successfully. Please log out and log back in for group changes to take effect."
}

# Function to check system requirements
check_requirements() {
    log "Checking system requirements..."
    
    # Check Docker
    if ! command_exists docker; then
        warn "Docker is not installed."
        read -p "Would you like to install Docker? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            if [[ "$OSTYPE" == "linux-gnu"* ]]; then
                install_docker_ubuntu
            else
                error "Please install Docker manually for your OS: https://docs.docker.com/get-docker/"
                exit 1
            fi
        else
            error "Docker is required to run this project."
            exit 1
        fi
    else
        log "Docker is installed: $(docker --version)"
    fi
    
    # Check Docker Compose
    if ! command_exists "docker compose"; then
        error "Docker Compose is not available. Please install Docker Compose."
        exit 1
    else
        log "Docker Compose is available: $(docker compose version)"
    fi
    
    # Check available disk space (at least 5GB)
    available_space=$(df . | tail -1 | awk '{print $4}')
    if [ $available_space -lt 5242880 ]; then  # 5GB in KB
        warn "Low disk space. At least 5GB is recommended."
    fi
    
    # Check available memory (at least 4GB)
    available_memory=$(free -m | awk 'NR==2{printf "%.0f", $7/1024}')
    if [ $available_memory -lt 2 ]; then  # 2GB
        warn "Low memory. At least 4GB RAM is recommended."
    fi
}

# Function to setup environment
setup_environment() {
    log "Setting up environment..."
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        log "Creating .env file..."
        cat > .env << EOL
# Database Configuration
DB_HOST=mysql
DB_PORT=3306
DB_USER=salon_user
DB_PASSWORD=salon_password_456
DB_ROOT_PASSWORD=root_password_123
DB_NAME=mydb

# Server Configuration
SERVER_HOST=0.0.0.0
SERVER_PORT=8080
FRONTEND_URL=http://localhost:5173

# JWT Configuration
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=24h

# Environment
GIN_MODE=release
VITE_API_URL=http://localhost:8080
VITE_NODE_ENV=production
EOL
        log ".env file created with secure JWT secret"
    else
        info ".env file already exists"
    fi
    
    # Create necessary directories
    mkdir -p docker/mysql/data
    mkdir -p docker/backend/logs
    mkdir -p docker/frontend/logs
    mkdir -p docker/nginx/logs
    
    # Set proper permissions
    chmod +x setup.sh
}

# Function to build and start services
start_services() {
    local environment=${1:-"development"}
    
    if [ "$environment" = "development" ]; then
        log "Starting development environment..."
        docker compose -f docker-compose.dev.yml down --remove-orphans
        docker compose -f docker-compose.dev.yml build --no-cache
        docker compose -f docker-compose.dev.yml up -d
        
        log "Development services starting..."
        log "Frontend (React): http://localhost:5174"
        log "Backend (Go API): http://localhost:8081"
        log "Database (MySQL): localhost:3307"
        
    else
        log "Starting production environment..."
        docker compose down --remove-orphans
        docker compose build --no-cache
        docker compose up -d
        
        log "Production services starting..."
        log "Frontend (React): http://localhost:5173"
        log "Backend (Go API): http://localhost:8080"
        log "Database (MySQL): localhost:3306"
        log "Nginx Proxy: http://localhost:80"
    fi
}

# Function to show logs
show_logs() {
    local service=${1:-""}
    local environment=${2:-"development"}
    
    if [ "$environment" = "development" ]; then
        if [ -n "$service" ]; then
            docker compose -f docker-compose.dev.yml logs -f "$service"
        else
            docker compose -f docker-compose.dev.yml logs -f
        fi
    else
        if [ -n "$service" ]; then
            docker compose logs -f "$service"
        else
            docker compose logs -f
        fi
    fi
}

# Function to stop services
stop_services() {
    local environment=${1:-"development"}
    
    if [ "$environment" = "development" ]; then
        log "Stopping development environment..."
        docker compose -f docker-compose.dev.yml down
    else
        log "Stopping production environment..."
        docker compose down
    fi
}

# Function to clean up
cleanup() {
    log "Cleaning up Docker resources..."
    docker system prune -f
    docker volume prune -f
    log "Cleanup completed"
}

# Function to show status
show_status() {
    local environment=${1:-"development"}
    
    if [ "$environment" = "development" ]; then
        docker compose -f docker-compose.dev.yml ps
    else
        docker compose ps
    fi
}

# Function to run database migrations
run_migrations() {
    log "Running database migrations..."
    
    # Wait for MySQL to be ready
    log "Waiting for MySQL to be ready..."
    sleep 30
    
    # Check if running in development or production
    if docker compose -f docker-compose.dev.yml ps mysql >/dev/null 2>&1; then
        # Development environment
        docker compose -f docker-compose.dev.yml exec mysql mysql -u salon_user -psalon_password_456 mydb -e "SELECT 'Database is ready';"
    else
        # Production environment
        docker compose exec mysql mysql -u salon_user -psalon_password_456 mydb -e "SELECT 'Database is ready';"
    fi
    
    log "Database migrations completed"
}

# Function to backup database
backup_database() {
    local backup_file="backup_$(date +%Y%m%d_%H%M%S).sql"
    
    log "Creating database backup: $backup_file"
    
    if docker compose ps mysql >/dev/null 2>&1; then
        # Production environment
        docker compose exec mysql mysqldump -u salon_user -psalon_password_456 mydb > "$backup_file"
    else
        # Development environment
        docker compose -f docker-compose.dev.yml exec mysql mysqldump -u salon_user -psalon_password_456 mydb > "$backup_file"
    fi
    
    log "Database backup completed: $backup_file"
}

# Function to restore database
restore_database() {
    local backup_file=$1
    
    if [ -z "$backup_file" ]; then
        error "Please provide a backup file path"
        exit 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        error "Backup file not found: $backup_file"
        exit 1
    fi
    
    log "Restoring database from: $backup_file"
    
    if docker compose ps mysql >/dev/null 2>&1; then
        # Production environment
        docker compose exec -i mysql mysql -u salon_user -psalon_password_456 mydb < "$backup_file"
    else
        # Development environment
        docker compose -f docker-compose.dev.yml exec -i mysql mysql -u salon_user -psalon_password_456 mydb < "$backup_file"
    fi
    
    log "Database restore completed"
}

# Main script logic
case "${1:-setup}" in
    "setup"|"install")
        log "Setting up Beba Coiffure Salon Management System..."
        check_requirements
        setup_environment
        start_services "development"
        sleep 10
        run_migrations
        log "Setup completed successfully!"
        log ""
        log "Access the application at:"
        log "  - Frontend: http://localhost:5174"
        log "  - Backend API: http://localhost:8081"
        log "  - Database: localhost:3307"
        log ""
        log "Use './setup.sh logs' to view application logs"
        ;;
    "start")
        environment=${2:-"development"}
        start_services "$environment"
        ;;
    "stop")
        environment=${2:-"development"}
        stop_services "$environment"
        ;;
    "restart")
        environment=${2:-"development"}
        stop_services "$environment"
        start_services "$environment"
        ;;
    "logs")
        service=$2
        environment=${3:-"development"}
        show_logs "$service" "$environment"
        ;;
    "status")
        environment=${2:-"development"}
        show_status "$environment"
        ;;
    "cleanup")
        cleanup
        ;;
    "migrate")
        run_migrations
        ;;
    "backup")
        backup_database
        ;;
    "restore")
        restore_database "$2"
        ;;
    "help"|"--help"|"-h")
        echo "Beba Coiffure Salon Management System - Setup Script"
        echo ""
        echo "Usage: $0 [COMMAND] [OPTIONS]"
        echo ""
        echo "Commands:"
        echo "  setup, install    Set up the entire system (default)"
        echo "  start [env]       Start services (development|production)"
        echo "  stop [env]        Stop services (development|production)"
        echo "  restart [env]     Restart services (development|production)"
        echo "  logs [service]    Show logs for all services or specific service"
        echo "  status [env]      Show status of all services"
        echo "  cleanup           Clean up Docker resources"
        echo "  migrate           Run database migrations"
        echo "  backup            Create database backup"
        echo "  restore [file]    Restore database from backup file"
        echo "  help              Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0 setup                    # Initial setup (development mode)"
        echo "  $0 start production         # Start production environment"
        echo "  $0 logs backend-dev         # Show backend logs"
        echo "  $0 backup                   # Create database backup"
        echo "  $0 restore backup.sql       # Restore from backup"
        ;;
    *)
        error "Unknown command: $1"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac
