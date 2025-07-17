#!/bin/bash

# Development Environment Startup Script
# This script starts the development environment and performs necessary checks

set -e  # Exit on any error

PROJECT_NAME="beba-coiffure-gestor-salon"
COMPOSE_FILE="docker-compose.dev.yml"

echo "🚀 Starting $PROJECT_NAME development environment..."

# Function to wait for a service to be healthy
wait_for_service() {
    local service_name=$1
    local max_attempts=${2:-30}
    local attempt=1
    
    echo "⏳ Waiting for $service_name to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if sg docker -c "docker-compose -f $COMPOSE_FILE ps $service_name" | grep -q "healthy\|Up"; then
            echo "✅ $service_name is ready!"
            return 0
        fi
        
        echo "   Attempt $attempt/$max_attempts - waiting for $service_name..."
        sleep 2
        ((attempt++))
    done
    
    echo "❌ $service_name failed to start within expected time"
    return 1
}

# Function to check if containers are running
check_containers() {
    echo "📋 Checking container status..."
    sg docker -c "docker-compose -f $COMPOSE_FILE ps"
}

# Function to show logs if there are issues
show_logs() {
    echo "📄 Recent logs from all services:"
    echo "--- MySQL Logs ---"
    sg docker -c "docker-compose -f $COMPOSE_FILE logs --tail=10 mysql" || true
    echo "--- Backend Logs ---"
    sg docker -c "docker-compose -f $COMPOSE_FILE logs --tail=10 backend-dev" || true
    echo "--- Frontend Logs ---"
    sg docker -c "docker-compose -f $COMPOSE_FILE logs --tail=10 frontend-dev" || true
}

# Main startup sequence
main() {
    # Start containers
    echo "🐳 Starting Docker containers..."
    sg docker -c "docker-compose -f $COMPOSE_FILE up -d"
    
    # Wait for MySQL to be healthy
    if wait_for_service "mysql"; then
        # Wait a bit more for MySQL to be fully ready
        sleep 5
        
        # Check database initialization
        echo "🔍 Checking database initialization..."
        if ./scripts/check-db-init.sh check; then
            echo "✅ Database is properly initialized"
        else
            echo "⚠️  Database initialization issues detected"
            echo "💡 You might need to reset the database: ./scripts/reset-dev-db.sh"
        fi
    else
        echo "❌ MySQL failed to start properly"
        show_logs
        exit 1
    fi
    
    # Wait for backend
    echo "⏳ Waiting for backend service..."
    sleep 10  # Give backend time to connect to DB
    
    # Wait for frontend
    echo "⏳ Waiting for frontend service..."
    sleep 5
    
    # Final status check
    check_containers
    
    echo ""
    echo "🎉 Development environment is ready!"
    echo ""
    echo "📍 Available services:"
    echo "   Frontend: http://localhost:5174"
    echo "   Backend:  http://localhost:8081"
    echo "   MySQL:    localhost:3307"
    echo ""
    echo "🔧 Useful commands:"
    echo "   Check status:     ./scripts/start-dev.sh status"
    echo "   Check database:   ./scripts/check-db-init.sh"
    echo "   Reset database:   ./scripts/reset-dev-db.sh"
    echo "   Stop services:    sg docker -c 'docker-compose -f $COMPOSE_FILE down'"
    echo "   View logs:        sg docker -c 'docker-compose -f $COMPOSE_FILE logs -f [service]'"
}

# Handle different commands
case "${1:-start}" in
    "start")
        main
        ;;
    "status")
        echo "📋 Current status:"
        check_containers
        echo ""
        ./scripts/check-db-init.sh check
        ;;
    "logs")
        show_logs
        ;;
    "stop")
        echo "🛑 Stopping development environment..."
        sg docker -c "docker-compose -f $COMPOSE_FILE down"
        echo "✅ Stopped!"
        ;;
    *)
        echo "Usage: $0 [start|status|logs|stop]"
        echo "  start  - Start the development environment (default)"
        echo "  status - Check current status"
        echo "  logs   - Show recent logs"
        echo "  stop   - Stop all services"
        exit 1
        ;;
esac
