@echo off
REM Beba Coiffure Salon Management System - Windows Setup Script
setlocal enabledelayedexpansion

REM Parse command line arguments first
set "COMMAND=%~1"
set "ENVIRONMENT=%~2"

if "%COMMAND%"=="" set "COMMAND=setup"
if "%ENVIRONMENT%"=="" set "ENVIRONMENT=development"

REM Handle help command early - before any other processing
if "%COMMAND%"=="help" goto :help
if "%COMMAND%"=="--help" goto :help
if "%COMMAND%"=="-h" goto :help

REM Function to log messages
:log
echo [%date% %time%] %~1
goto :eof

:warn
echo [%date% %time%] WARNING: %~1
goto :eof

:error
echo [%date% %time%] ERROR: %~1
goto :eof

:info
echo [%date% %time%] INFO: %~1
goto :eof

REM Main script starts here
call :log "Setting up Beba Coiffure Salon Management System..."

REM Create .env file if it doesn't exist
if not exist ".env" (
    call :log "Creating .env file..."
    (
        echo # Database Configuration
        echo DB_HOST=mysql
        echo DB_PORT=3306
        echo DB_USER=salon_user
        echo DB_PASSWORD=salon_password_456
        echo DB_ROOT_PASSWORD=root_password_123
        echo DB_NAME=salondb
        echo.
        echo # Server Configuration
        echo SERVER_HOST=0.0.0.0
        echo SERVER_PORT=8080
        echo FRONTEND_URL=http://localhost:5173
        echo.
        echo # JWT Configuration
        echo JWT_SECRET=your_jwt_secret_here_change_in_production
        echo JWT_EXPIRES_IN=24h
        echo.
        echo # Environment
        echo GIN_MODE=release
        echo VITE_API_URL=http://localhost:8080
        echo VITE_NODE_ENV=production
    ) > .env
    call :log ".env file created"
) else (
    call :info ".env file already exists"
)

REM Create necessary directories
call :log "Creating necessary directories..."
if not exist "docker\mysql\data" mkdir "docker\mysql\data"
if not exist "docker\backend\logs" mkdir "docker\backend\logs"
if not exist "docker\frontend\logs" mkdir "docker\frontend\logs"
if not exist "docker\nginx\logs" mkdir "docker\nginx\logs"

REM Handle different commands
if "%COMMAND%"=="setup" goto :setup
if "%COMMAND%"=="install" goto :setup
if "%COMMAND%"=="start" goto :start
if "%COMMAND%"=="stop" goto :stop
if "%COMMAND%"=="restart" goto :restart
if "%COMMAND%"=="logs" goto :logs
if "%COMMAND%"=="status" goto :status
if "%COMMAND%"=="cleanup" goto :cleanup
goto :help

:setup
call :log "Starting development environment..."
call :start_development
call :log "Setup completed successfully!"
echo.
call :log "Access the application at:"
call :log "  - Frontend: http://localhost:5174"
call :log "  - Backend API: http://localhost:8081"
call :log "  - Database: localhost:3307"
echo.
call :log "Use 'setup.bat logs' to view application logs"
call :log "Use 'setup.bat status' to check service status"
goto :end

:start
if "%ENVIRONMENT%"=="development" (
    call :start_development
) else (
    call :start_production
)
goto :end

:start_development
call :log "Starting development environment..."
docker-compose -f docker-compose.dev.yml down --remove-orphans
docker-compose -f docker-compose.dev.yml build --no-cache
docker-compose -f docker-compose.dev.yml up -d

call :log "Development services starting..."
call :log "Frontend (React): http://localhost:5174"
call :log "Backend (Go API): http://localhost:8081"
call :log "Database (MySQL): localhost:3307"
goto :eof

:start_production
call :log "Starting production environment..."
docker-compose down --remove-orphans
docker-compose build --no-cache
docker-compose up -d

call :log "Production services starting..."
call :log "Frontend (React): http://localhost:5173"
call :log "Backend (Go API): http://localhost:8080"
call :log "Database (MySQL): localhost:3306"
call :log "Nginx Proxy: http://localhost:80"
goto :eof

:stop
if "%ENVIRONMENT%"=="development" (
    call :log "Stopping development environment..."
    docker-compose -f docker-compose.dev.yml down
) else (
    call :log "Stopping production environment..."
    docker-compose down
)
goto :end

:restart
call :stop
call :start
goto :end

:logs
set "SERVICE=%~2"
if "%SERVICE%"=="" (
    if "%ENVIRONMENT%"=="development" (
        docker-compose -f docker-compose.dev.yml logs -f
    ) else (
        docker-compose logs -f
    )
) else (
    if "%ENVIRONMENT%"=="development" (
        docker-compose -f docker-compose.dev.yml logs -f %SERVICE%
    ) else (
        docker-compose logs -f %SERVICE%
    )
)
goto :end

:status
if "%ENVIRONMENT%"=="development" (
    docker-compose -f docker-compose.dev.yml ps
) else (
    docker-compose ps
)
goto :end

:cleanup
call :log "Cleaning up Docker resources..."
docker system prune -f
docker volume prune -f
call :log "Cleanup completed"
goto :end

:help
echo Beba Coiffure Salon Management System - Windows Setup Script
echo.
echo Usage: setup.bat [COMMAND] [ENVIRONMENT]
echo.
echo Commands:
echo   setup, install    Set up the entire system (default)
echo   start [env]       Start services (development^|production)
echo   stop [env]        Stop services (development^|production)
echo   restart [env]     Restart services (development^|production)
echo   logs [service]    Show logs for all services or specific service
echo   status [env]      Show status of all services
echo   cleanup           Clean up Docker resources
echo   help              Show this help message
echo.
echo Environment:
echo   development       Development mode (default)
echo   production        Production mode
echo.
echo Examples:
echo   setup.bat                        # Initial setup (development mode)
echo   setup.bat start production       # Start production environment
echo   setup.bat logs backend-dev       # Show backend logs
echo   setup.bat status development     # Show development status
echo.
echo Prerequisites:
echo   - Docker Desktop must be installed and running
echo   - Docker Compose must be available
echo.
goto :end

:end
endlocal
