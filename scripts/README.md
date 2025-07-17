# Scripts Directory

This directory contains utility scripts for database management.

## Available Scripts

### `check-db-init.sh`
**Purpose**: Check database initialization status  
**Usage**: `./scripts/check-db-init.sh [check|force-reinit]`  
**Description**: Validates that the database is properly initialized and shows the initialization log.

### `force-db-reinit.sh`
**Purpose**: Force database re-initialization (development only)  
**Usage**: `./scripts/force-db-reinit.sh [force|status|help]`  
**Description**: Completely resets the development database by removing the data volume and forcing fresh initialization.

## Main Setup Script

The primary setup and management script is located in the root directory:

### `../setup.sh`
**Purpose**: Main project setup and management  
**Usage**: `./setup.sh [setup|start|stop|logs|db-status|help]`  
**Description**: Comprehensive script for setting up, starting, stopping, and managing the entire project.

## Quick Reference

```bash
# Initial setup
./setup.sh setup

# Check database status
./setup.sh db-status
# or
./scripts/check-db-init.sh

# Reset database (development only)
./scripts/force-db-reinit.sh

# Start/stop services
./setup.sh start
./setup.sh stop

# View logs
./setup.sh logs [service]
```

## Database Initialization

The system uses a three-layer approach to ensure SQL files run only once:

1. **MySQL Docker Protection**: Scripts only run when data volume is empty
2. **Initialization Log**: Tracks script execution in `db_initialization_log` table
3. **State Validation**: Confirms expected tables exist

This ensures reliable, one-time initialization while maintaining development flexibility.
