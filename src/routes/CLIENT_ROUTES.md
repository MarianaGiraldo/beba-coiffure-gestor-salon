# Client Routes Documentation

## Overview
Client routes have been separated into their own file (`client_routes.go`) for better organization and maintainability.

## Available Routes

### Public Routes (No Authentication Required)
- `POST /api/clients/register` - Client self-registration

### Protected Routes (Authentication Required)

#### Admin Only Routes
- `GET /api/clients/` - Get all clients (Admin only)
- `POST /api/clients/` - Create new client (Admin only) 
- `PUT /api/clients/:id` - Update client (Admin only)
- `DELETE /api/clients/:id` - Delete client (Admin only)

#### Client Profile Routes (Future Implementation)
- `GET /api/clients/profile/` - Get own profile
- `PUT /api/clients/profile/` - Update own profile  
- `DELETE /api/clients/profile/` - Delete own account

## Usage Examples

### Client Registration
```bash
POST /api/clients/register
Content-Type: application/json

{
  "nombre": "Juan",
  "apellido": "Pérez",
  "telefono": "+57 123 456 7890",
  "email": "juan.perez@email.com",
  "password": "securePassword123",
  "confirmPassword": "securePassword123"
}
```

### Get All Clients (Admin)
```bash
GET /api/clients/
Authorization: Bearer <admin_token>
```

## Integration
The client routes are automatically included in the main routes setup via the `SetupClientRoutes()` function called from the main `routes.go` file.
