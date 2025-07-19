#!/bin/bash

# Force Database Re-initialization Script
# This script forces the database to re-initialize by removing the MySQL data volume

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

# Function to execute docker compose commands with fallback
docker_compose_cmd() {
    local compose_file=""
    local cmd_args="$@"
    
    # Check if we're using development environment
    if echo "$cmd_args" | grep -q "docker-compose.dev.yml"; then
        compose_file="-f docker-compose.dev.yml"
        cmd_args=$(echo "$cmd_args" | sed 's/-f docker-compose\.dev\.yml//g')
    fi
    
    # Try docker compose first (newer syntax)
    if command -v "docker compose" >/dev/null 2>&1; then
        docker compose $compose_file $cmd_args
    elif command -v "docker-compose" >/dev/null 2>&1; then
        if [ -n "$compose_file" ]; then
            docker-compose $compose_file $cmd_args
        else
            docker-compose $cmd_args
        fi
    else
        error "Neither 'docker compose' nor 'docker-compose' is available"
        exit 1
    fi
}

# Main function
force_reinit() {
    local environment=${1:-"development"}
    
    if [ "$environment" = "production" ]; then
        error "🚫 PRODUCTION DATABASE RE-INITIALIZATION IS NOT ALLOWED!"
        error "This would destroy all production data!"
        exit 1
    fi
    
    warn "⚠️  This will DESTROY all data in the development database!"
    warn "All tables, data, and initialization history will be lost."
    echo ""
    read -p "Are you sure you want to continue? Type 'yes' to confirm: " confirm
    
    if [ "$confirm" != "yes" ]; then
        log "Operation cancelled."
        exit 0
    fi
    
    log "🔄 Starting database re-initialization process..."
    
    # Stop development containers
    log "Stopping development containers..."
    docker_compose_cmd -f docker-compose.dev.yml down
    
    # Remove the MySQL data volume
    log "Removing MySQL data volume..."
    docker volume rm beba-coiffure-gestor-salon_mysql_dev_data 2>/dev/null || {
        warn "Volume may not exist or already removed"
    }
    
    # Remove any orphaned volumes
    log "Cleaning up orphaned volumes..."
    docker volume prune -f >/dev/null 2>&1 || true
    
    # Start containers again (this will trigger re-initialization)
    log "Starting containers with fresh database..."
    docker_compose_cmd -f docker-compose.dev.yml up -d
    
    # Wait and check initialization
    log "Waiting for services to start..."
    sleep 10
    
    # Run the migration check
    log "Checking database initialization..."
    if ./setup.sh migrate development; then
        log "✅ Database re-initialization completed successfully!"
        log ""
        log "📍 Services are available at:"
        log "   Frontend: http://localhost:5174"
        log "   Backend:  http://localhost:8081"
        log "   MySQL:    localhost:3307"
        log ""
        log "🔍 Check status with: ./setup.sh db-status"
    else
        warn "⚠️  There may be issues with database initialization"
        warn "Check logs with: ./setup.sh logs mysql"
    fi
}

# Show current database status
show_status() {
    log "📋 Current database status:"
    ./setup.sh db-status development
}

# Main script logic
case "${1:-force}" in
    "force")
        force_reinit "development"
        ;;
    "status")
        show_status
        ;;
    "help"|"--help"|"-h")
        echo "Force Database Re-initialization Script"
        echo ""
        echo "⚠️  WARNING: This script will destroy all development database data!"
        echo ""
        echo "Usage: $0 [COMMAND]"
        echo ""
        echo "Commands:"
        echo "  force    Force database re-initialization (default)"
        echo "  status   Show current database status"
        echo "  help     Show this help message"
        echo ""
        echo "How it works:"
        echo "1. Stops all development containers"
        echo "2. Removes the MySQL data volume"
        echo "3. Restarts containers (triggers fresh initialization)"
        echo "4. SQL scripts in src/sql/ run automatically when MySQL data is empty"
        echo ""
        echo "The MySQL Docker image automatically runs scripts in"
        echo "/docker-entrypoint-initdb.d/ when the data directory is empty."
        echo "This ensures scripts only run once per fresh database."
        ;;
    *)
        error "Unknown command: $1"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac
