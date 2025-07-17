#!/bin/bash

# Backend Health Check Script
# This script can be used as a health check for the backend container

# Database connection parameters from environment
DB_HOST="${DB_HOST:-mysql}"
DB_PORT="${DB_PORT:-3306}"
DB_USER="${DB_USER:-salon_user}"
DB_PASSWORD="${DB_PASSWORD:-salon_password_456}"
DB_NAME="${DB_NAME:-salondb}"

# Check if we can connect to the database
if mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -D"$DB_NAME" -e "SELECT 1;" >/dev/null 2>&1; then
    # Check if initialization is complete
    COMPLETE_COUNT=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -D"$DB_NAME" -se "
        SELECT COUNT(*) FROM db_initialization_log 
        WHERE script_name = '99_initialization_complete.sql';" 2>/dev/null || echo "0")
    
    if [ "$COMPLETE_COUNT" -eq 1 ]; then
        echo "Database is ready and initialized"
        exit 0
    else
        echo "Database connected but not fully initialized"
        exit 1
    fi
else
    echo "Cannot connect to database"
    exit 1
fi
