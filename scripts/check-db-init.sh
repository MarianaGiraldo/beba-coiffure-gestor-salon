#!/bin/bash

# Database Initialization Check Script
# This script checks if the database has been properly initialized

# Database connection parameters - adjusted for Docker environment
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3307}"  # Development port
DB_USER="${DB_USER:-salon_user}"
DB_PASSWORD="${DB_PASSWORD:-salon_password_456}"
DB_NAME="${DB_NAME:-salondb}"

# Docker command prefix for running inside containers
DOCKER_PREFIX="${DOCKER_PREFIX:-sg docker -c}"

# Function to check if database is initialized
check_db_initialization() {
    echo "Checking database initialization status..."
    
    # Try to connect to database (with timeout)
    if ! timeout 10 mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1;" >/dev/null 2>&1; then
        echo "❌ Cannot connect to database at $DB_HOST:$DB_PORT"
        echo "💡 Make sure containers are running: docker-compose -f docker-compose.dev.yml ps"
        return 1
    fi
    
    # Check if the initialization log table exists and has entries
    INIT_COUNT=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -D"$DB_NAME" -se "
        SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = '$DB_NAME' 
        AND TABLE_NAME = 'db_initialization_log';" 2>/dev/null)
    
    if [ "$INIT_COUNT" -eq 1 ]; then
        echo "✅ Initialization log table exists"
        
        # Check completed scripts
        mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -D"$DB_NAME" -se "
            SELECT CONCAT('✅ ', script_name, ' executed at ', executed_at) as 'Initialization Status'
            FROM db_initialization_log 
            ORDER BY executed_at;" 2>/dev/null
        
        # Check if initialization is complete
        COMPLETE_COUNT=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -D"$DB_NAME" -se "
            SELECT COUNT(*) FROM db_initialization_log 
            WHERE script_name = '99_initialization_complete.sql';" 2>/dev/null)
        
        if [ "$COMPLETE_COUNT" -eq 1 ]; then
            echo "🎉 Database initialization is COMPLETE"
            return 0
        else
            echo "⚠️  Database initialization is INCOMPLETE"
            return 1
        fi
    else
        echo "❌ Database has not been initialized or initialization table doesn't exist"
        return 1
    fi
}

# Function to force re-initialization (development only)
force_reinitialize() {
    echo "⚠️  WARNING: This will drop and recreate the database!"
    read -p "Are you sure you want to continue? (yes/no): " confirm
    
    if [ "$confirm" = "yes" ]; then
        echo "Dropping database..."
        mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -e "DROP DATABASE IF EXISTS $DB_NAME;"
        echo "Database dropped. Restart the containers to reinitialize."
    else
        echo "Operation cancelled."
    fi
}

# Main script logic
case "${1:-check}" in
    "check")
        check_db_initialization
        ;;
    "force-reinit")
        force_reinitialize
        ;;
    *)
        echo "Usage: $0 [check|force-reinit]"
        echo "  check        - Check initialization status (default)"
        echo "  force-reinit - Drop database to force reinitialization (development only)"
        exit 1
        ;;
esac
