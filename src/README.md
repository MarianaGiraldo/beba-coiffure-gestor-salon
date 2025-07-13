# Beba Coiffure - Salon Management System Backend

A comprehensive salon management system backend built with Go, Gin Gonic, and GORM for MySQL.

## 🏗️ Architecture Overview

This backend is designed to work seamlessly with the React frontend, providing RESTful APIs for:
- **Authentication & Authorization** (Admin, Employee, Client roles)
- **Employee Management** (Admin only)
- **Client Management** 
- **Service Management**
- **Inventory Management**
- **Supplier Management**
- **Promotion Management**
- **Financial Management**

## 📁 Project Structure

```
src/
├── config/          # Database configuration and app settings
├── controllers/     # Request handlers for each module
├── handlers/        # Additional business logic handlers
├── middleware/      # Authentication, CORS, and other middleware
├── models/          # GORM database models
├── routes/          # API route definitions
├── services/        # Business logic and database services
├── main.go          # Application entry point
├── go.mod           # Go module dependencies
└── .env.example     # Environment variables template
```

## 🚀 Quick Start

### Prerequisites
- Go 1.21+
- MySQL 8.0+
- Node.js 18+ (for frontend)

### Setup

1. **Clone and navigate to the project:**
   ```bash
   cd /path/to/your/project/src
   ```

2. **Install Go dependencies:**
   ```bash
   go mod tidy
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Create MySQL database:**
   ```sql
   CREATE DATABASE beba_coiffure_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

5. **Run the application:**
   ```bash
   go run main.go
   ```

The server will start on `http://localhost:8080`

## 🔐 MySQL User Management Design Options

Based on your frontend's multi-role authentication system, here are **3 design approaches** for managing MySQL database access:

### Option 1: Single Application User with Role-Based Access Control (RBAC) ⭐ **RECOMMENDED**

**Concept:** Use one MySQL user for the application with all necessary permissions. Handle access control at the application level using JWT tokens with role information.

**Pros:**
- ✅ Simplest to implement and manage
- ✅ Better performance (single connection pool)
- ✅ Easier deployment and scaling
- ✅ Standard industry practice
- ✅ Built-in audit trail through application logs

**Cons:**
- ❌ All database access goes through one user
- ❌ Less granular database-level security

**Implementation:**
```sql
-- Create application user
CREATE USER 'beba_coiffure_app'@'localhost' IDENTIFIED BY 'strong_password_here';
GRANT SELECT, INSERT, UPDATE, DELETE ON beba_coiffure_db.* TO 'beba_coiffure_app'@'localhost';
FLUSH PRIVILEGES;
```

**Application Logic:**
- JWT tokens contain user type (admin/employee/client) and permissions
- Controllers check permissions before database operations
- Middleware handles authentication and authorization
- Single GORM connection with connection pooling

---

### Option 2: Multi-User Database Pattern

**Concept:** Create different MySQL users for different roles, with the application switching database connections based on the authenticated user's role.

**Pros:**
- ✅ Database-level security enforcement
- ✅ Granular permission control
- ✅ Better audit trail at DB level
- ✅ Compliance-friendly

**Cons:**
- ❌ Complex connection management
- ❌ Performance overhead (multiple connection pools)
- ❌ Deployment complexity
- ❌ User management overhead

**Implementation:**
```sql
-- Admin user (full access)
CREATE USER 'beba_admin'@'localhost' IDENTIFIED BY 'admin_password';
GRANT ALL PRIVILEGES ON beba_coiffure_db.* TO 'beba_admin'@'localhost';

-- Employee user (limited access)
CREATE USER 'beba_employee'@'localhost' IDENTIFIED BY 'employee_password';
GRANT SELECT, INSERT, UPDATE ON beba_coiffure_db.clients TO 'beba_employee'@'localhost';
GRANT SELECT, INSERT, UPDATE ON beba_coiffure_db.appointments TO 'beba_employee'@'localhost';
GRANT SELECT ON beba_coiffure_db.services TO 'beba_employee'@'localhost';
GRANT SELECT ON beba_coiffure_db.products TO 'beba_employee'@'localhost';

-- Client user (read-only access to own data)
CREATE USER 'beba_client'@'localhost' IDENTIFIED BY 'client_password';
GRANT SELECT ON beba_coiffure_db.services TO 'beba_client'@'localhost';
GRANT SELECT ON beba_coiffure_db.promotions TO 'beba_client'@'localhost';

FLUSH PRIVILEGES;
```

---

### Option 3: Hybrid Approach with Service Users

**Concept:** Use different database users for different service types/modules rather than user roles.

**Pros:**
- ✅ Modular security approach
- ✅ Service-level isolation
- ✅ Easier to manage than per-user approach
- ✅ Good for microservices architecture

**Cons:**
- ❌ Still complex connection management
- ❌ May not align perfectly with frontend roles

**Implementation:**
```sql
-- Authentication service user
CREATE USER 'beba_auth_service'@'localhost' IDENTIFIED BY 'auth_password';
GRANT SELECT, INSERT, UPDATE ON beba_coiffure_db.admins TO 'beba_auth_service'@'localhost';
GRANT SELECT, INSERT, UPDATE ON beba_coiffure_db.employees TO 'beba_auth_service'@'localhost';
GRANT SELECT, INSERT, UPDATE ON beba_coiffure_db.clients TO 'beba_auth_service'@'localhost';

-- Business operations user
CREATE USER 'beba_business_service'@'localhost' IDENTIFIED BY 'business_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON beba_coiffure_db.services TO 'beba_business_service'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON beba_coiffure_db.appointments TO 'beba_business_service'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON beba_coiffure_db.client_payments TO 'beba_business_service'@'localhost';

-- Inventory management user
CREATE USER 'beba_inventory_service'@'localhost' IDENTIFIED BY 'inventory_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON beba_coiffure_db.products TO 'beba_inventory_service'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON beba_coiffure_db.inventories TO 'beba_inventory_service'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON beba_coiffure_db.suppliers TO 'beba_inventory_service'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON beba_coiffure_db.purchases TO 'beba_inventory_service'@'localhost';

FLUSH PRIVILEGES;
```

---

## 🏆 Implemented Solution: Option 1 (RBAC)

This project implements **Option 1** as it's the most practical and scalable approach for your salon management system. Here's how it works:

### Authentication Flow
1. **Login Request** → Verify credentials against appropriate table (admin/employee/client)
2. **JWT Generation** → Create token with user ID, email, user type, and role
3. **Request Authorization** → Middleware validates JWT and extracts user information
4. **Permission Check** → Controllers verify user permissions before database operations

### Database Models
All models are defined in `models/models.go` with proper relationships:
- **Employee** → Has many Payments
- **Client** → Has many Appointments, ClientPayments
- **Service** → Has many Appointments, Promotions
- **Product** → Has many Inventories
- **Supplier** → Has many Purchases

### API Endpoints

#### Authentication
- `POST /api/auth/login` - User login (admin/employee/client)
- `POST /api/auth/register` - Client registration
- `GET /api/me` - Get current user profile

#### Employee Management (Admin only)
- `GET /api/employees` - List all employees
- `POST /api/employees` - Create new employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee
- `GET /api/payments` - List salary payments
- `POST /api/payments` - Create salary payment

#### Additional modules follow similar patterns...

## 🔧 Configuration

### Environment Variables (.env)
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=beba_coiffure_app
DB_PASSWORD=your_secure_password
DB_NAME=beba_coiffure_db

# Server
SERVER_PORT=8080
SERVER_HOST=localhost

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h

# Admin
ADMIN_EMAIL=admin@bebacoiffure.com
ADMIN_PASSWORD=admin123

# CORS
FRONTEND_URL=http://localhost:5173
```

## 🔐 Security Features

- **Password Hashing:** bcrypt for all user passwords
- **JWT Authentication:** Secure token-based authentication
- **CORS Protection:** Configured for your frontend URL
- **SQL Injection Prevention:** GORM ORM provides protection
- **Role-Based Access:** Middleware enforces permissions
- **Input Validation:** Gin binding validates request data

## 🚀 Deployment

### Development
```bash
go run main.go
```

### Production Build
```bash
# Build the application
go build -o salon-backend main.go

# Run the binary
./salon-backend
```

### Docker (Optional)
```dockerfile
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.* ./
RUN go mod download
COPY . .
RUN go build -o main main.go

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/main .
COPY --from=builder /app/.env .
CMD ["./main"]
```

## 📝 API Documentation

### Authentication Examples

**Login:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@bebacoiffure.com",
    "password": "admin123"
  }'
```

**Access Protected Route:**
```bash
curl -X GET http://localhost:8080/api/employees \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🤝 Contributing

1. Follow Go conventions and best practices
2. Add tests for new features
3. Update documentation for API changes
4. Use meaningful commit messages

## 📄 License

This project is private and confidential for Beba Coiffure salon management.
