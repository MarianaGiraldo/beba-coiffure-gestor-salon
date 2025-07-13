# Beba Coiffure - Salon Management System

A comprehensive salon management system built with React frontend, Go (Gin) backend, and MySQL database, all containerized with Docker.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  React Frontend │    │   Go Backend    │    │ MySQL Database │
│    (Port 5173)  │◄──►│   (Port 8080)   │◄──►│   (Port 3306)   │
│                 │    │                 │    │                 │
│  - TypeScript   │    │  - Gin Gonic    │    │ - Stored Procs  │
│  - Tailwind CSS │    │  - GORM         │    │ - Views         │
│  - Shadcn/ui    │    │  - JWT Auth     │    │ - Triggers      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                    ┌─────────────────┐
                    │ Nginx (Optional)│
                    │   (Port 80)     │
                    │  Reverse Proxy  │
                    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Git
- At least 4GB RAM and 5GB disk space

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd beba-coiffure-gestor-salon
   ```

2. **Run the setup script:**
   ```bash
   ./setup.sh setup
   ```

3. **Access the application:**
   - Frontend: http://localhost:5174
   - Backend API: http://localhost:8081
   - Database: localhost:3307

## 🛠️ Development

### Development Environment

The setup script automatically starts the development environment with:
- **Hot reload** for both frontend and backend
- **Live database** with sample data
- **Debug logging** enabled

```bash
# Start development environment
./setup.sh start development

# View logs
./setup.sh logs

# View specific service logs
./setup.sh logs backend-dev
./setup.sh logs frontend-dev
./setup.sh logs mysql
```

### Project Structure

```
beba-coiffure-gestor-salon/
├── frontend/                 # React TypeScript frontend
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom hooks
│   │   └── lib/             # Utilities
│   ├── package.json
│   └── vite.config.ts
├── src/                     # Go backend
│   ├── controllers/         # HTTP handlers
│   ├── models/             # Database models
│   ├── services/           # Business logic
│   ├── routes/             # Route definitions
│   ├── config/             # Configuration
│   ├── middleware/         # Middleware
│   ├── sql/                # Database scripts
│   ├── go.mod
│   └── main.go
├── docker/                 # Docker configuration
│   ├── backend/
│   ├── frontend/
│   ├── mysql/
│   └── nginx/
├── docker-compose.yml      # Production environment
├── docker-compose.dev.yml  # Development environment
└── setup.sh               # Setup and management script
```

## 🗄️ Database Design

### MySQL User Management Options

This system implements **Option 2: Role-Based Database Access** from the three design patterns:

#### Option 1: Application User Mapping
- Each application user maps to a specific DB user
- Provides maximum security isolation
- Complex to manage with many users

#### Option 2: Role-Based Database Access (IMPLEMENTED)
- Three MySQL users: `admin`, `empleado`, `cliente`
- Application manages role-based permissions
- Balanced security and manageability

#### Option 3: Single Application User
- One MySQL user for all operations
- Application handles all permissions
- Simplest but least secure

### Database Schema

The system uses the following main tables:
- `EMPLEADO` - Employee management
- `CLIENTE` - Client management  
- `SERVICIO` - Service definitions
- `PRODUCTO` - Product inventory
- `PROVEEDOR` - Supplier management
- `INVENTARIO` - Inventory tracking
- `PROMOCION` - Promotional offers
- `CITA` - Appointment scheduling
- `PAGO` - Payment records
- `USUARIO_SISTEMA` - System users

### Stored Procedures

All CRUD operations use stored procedures instead of direct table access:

**Employee Procedures:**
- `sp_get_empleados()` - Get all employees
- `sp_insert_empleado()` - Create employee
- `sp_update_empleado()` - Update employee
- `sp_delete_empleado()` - Delete employee

**Client Procedures:**
- `sp_get_clientes()` - Get all clients
- `sp_insert_cliente()` - Create client
- `sp_update_cliente()` - Update client
- `sp_delete_cliente()` - Delete client

**Product Procedures:**
- `sp_get_productos()` - Get all products
- `sp_insert_producto()` - Create product
- `sp_update_producto()` - Update product
- `sp_delete_producto()` - Delete product

### Dashboard Views

Analytics are provided through MySQL views:
- `vw_empleados_activos` - Active employee count
- `vw_citas_hoy` - Today's appointments
- `vw_ingresos_mensuales` - Monthly revenue
- `vw_productos_bajos` - Low stock products
- `vw_valor_inventario` - Total inventory value
- `vw_servicios_totales` - Total services offered

## 🔧 Backend Implementation

### Controller Layer
Controllers handle HTTP requests and use the database service layer:

```go
type EmployeeController struct {
    dbService *services.DatabaseService
}

func (ec *EmployeeController) GetEmployees(c *gin.Context) {
    employees, err := ec.dbService.GetEmpleados() // Uses stored procedure
    // ... handle response
}
```

### Service Layer
The database service layer calls stored procedures:

```go
func (s *DatabaseService) GetEmpleados() ([]models.Employee, error) {
    var employees []models.Employee
    err := s.DB.Raw("CALL sp_get_empleados()").Scan(&employees).Error
    return employees, err
}
```

### Models
Models match the exact database schema:

```go
type Employee struct {
    EmpID       uint    `json:"emp_id" gorm:"column:emp_id"`
    EmpNombre   string  `json:"emp_nombre" gorm:"column:emp_nombre"`
    // ... other fields
}

func (Employee) TableName() string {
    return "EMPLEADO"
}
```

## 🚀 Production Deployment

### Production Environment

```bash
# Start production environment
./setup.sh start production

# Access production services
# Frontend: http://localhost:5173
# Backend: http://localhost:8080
# Nginx: http://localhost:80
```

### Environment Variables

Create a `.env` file for production configuration:

```env
# Database Configuration
DB_HOST=mysql
DB_PORT=3306
DB_USER=salon_user
DB_PASSWORD=your_secure_password
DB_NAME=mydb

# Server Configuration
SERVER_PORT=8080
FRONTEND_URL=https://yourdomain.com

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret
JWT_EXPIRES_IN=24h

# Environment
GIN_MODE=release
```

### SSL Configuration

For production with SSL, add certificates to `docker/nginx/ssl/` and update nginx configuration.

## 📊 API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout

### Employees (Uses Stored Procedures)
- `GET /employees` - List employees
- `POST /employees` - Create employee
- `PUT /employees/:id` - Update employee
- `DELETE /employees/:id` - Delete employee

### Clients (Uses Stored Procedures)
- `GET /clients` - List clients
- `POST /clients` - Create client
- `PUT /clients/:id` - Update client
- `DELETE /clients/:id` - Delete client

### Products (Uses Stored Procedures)
- `GET /products` - List products
- `POST /products` - Create product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product

### Dashboard (Uses Views)
- `GET /dashboard/metrics` - All dashboard metrics
- `GET /dashboard/employees` - Employee metrics
- `GET /dashboard/financial` - Financial metrics
- `GET /dashboard/inventory` - Inventory metrics

## 🔍 Monitoring and Maintenance

### View Logs
```bash
# View all logs
./setup.sh logs

# View specific service logs
./setup.sh logs backend-dev
./setup.sh logs mysql
```

### Database Backup and Restore
```bash
# Create backup
./setup.sh backup

# Restore from backup
./setup.sh restore backup_20241213_143052.sql
```

### System Status
```bash
# Check service status
./setup.sh status

# Clean up Docker resources
./setup.sh cleanup
```

## 🛡️ Security Features

1. **JWT Authentication** - Secure token-based authentication
2. **Role-Based Access** - Different database users for different roles
3. **Password Hashing** - bcrypt password encryption
4. **SQL Injection Protection** - All queries use stored procedures
5. **CORS Configuration** - Proper cross-origin settings
6. **Input Validation** - Request validation at controller level

## 🧪 Testing

### Backend Testing
```bash
# Run Go tests
cd src
go test ./...
```

### Frontend Testing
```bash
# Run React tests
cd frontend
bun test
```

## 📝 Management Commands

The `setup.sh` script provides comprehensive management:

```bash
# Setup and start development environment
./setup.sh setup

# Start/stop services
./setup.sh start [development|production]
./setup.sh stop [development|production]

# View logs and status
./setup.sh logs [service-name]
./setup.sh status

# Database operations
./setup.sh migrate
./setup.sh backup
./setup.sh restore backup.sql

# Cleanup
./setup.sh cleanup
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
1. Check the logs: `./setup.sh logs`
2. Verify system status: `./setup.sh status`
3. Review this documentation
4. Open an issue in the repository

---

**Beba Coiffure Salon Management System** - Streamlining salon operations with modern technology.
