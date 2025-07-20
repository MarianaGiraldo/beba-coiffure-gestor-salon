# Expense Management API Documentation

## Overview

The Expense Management System handles monthly expenses (GASTO_MENSUAL) for the salon. This system provides full CRUD operations for managing business expenses.

## API Endpoints

### Base URL: `/api/expenses`

#### 1. Get All Expenses (Gastos)
```
GET /api/expenses
```
**Authentication**: Required  
**Authorization**: Any authenticated user  
**Description**: Returns all expenses ordered by date (most recent first)  

**Response Example**:
```json
{
  "expenses": [
    {
      "gas_id": 1,
      "gas_descripcion": "Compra de productos para el salón",
      "gas_fecha": "2025-01-20T00:00:00Z",
      "gas_monto": 150.50,
      "gas_tipo": "Variable"
    },
    {
      "gas_id": 2,
      "gas_descripcion": "Pago de alquiler mensual",
      "gas_fecha": "2025-01-15T00:00:00Z",
      "gas_monto": 800.00,
      "gas_tipo": "Fijo"
    }
  ],
  "total": 2
}
```

#### 2. Get Expense by ID
```
GET /api/expenses/{id}
```
**Authentication**: Required  
**Authorization**: Any authenticated user  

**Response Example**:
```json
{
  "expense": {
    "gas_id": 1,
    "gas_descripcion": "Compra de productos para el salón",
    "gas_fecha": "2025-01-20T00:00:00Z",
    "gas_monto": 150.50,
    "gas_tipo": "Variable"
  }
}
```

#### 3. Create Expense
```
POST /api/expenses
```
**Authentication**: Required  
**Authorization**: Admin only  

**Request Body**:
```json
{
  "gas_descripcion": "Nuevo gasto del salón",
  "gas_fecha": "2025-01-20",
  "gas_monto": 75.25,
  "gas_tipo": "Variable"
}
```

**Response Example**:
```json
{
  "message": "Expense created successfully",
  "expense": {
    "gas_descripcion": "Nuevo gasto del salón",
    "gas_fecha": "2025-01-20",
    "gas_monto": 75.25,
    "gas_tipo": "Variable"
  }
}
```

#### 4. Update Expense
```
PUT /api/expenses/{id}
```
**Authentication**: Required  
**Authorization**: Admin only  

**Request Body**:
```json
{
  "gas_descripcion": "Gasto actualizado",
  "gas_fecha": "2025-01-21",
  "gas_monto": 80.00,
  "gas_tipo": "Fijo"
}
```

#### 5. Delete Expense
```
DELETE /api/expenses/{id}
```
**Authentication**: Required  
**Authorization**: Admin only  

**Response Example**:
```json
{
  "message": "Expense deleted successfully"
}
```

## Usage Examples

### Get All Expenses (Gastos)
```bash
curl -X GET http://localhost:8080/api/expenses \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create a New Expense
```bash
curl -X POST http://localhost:8080/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "gas_descripcion": "Compra de productos de limpieza",
    "gas_fecha": "2025-01-20",
    "gas_monto": 45.30,
    "gas_tipo": "Variable"
  }'
```

### Get Specific Expense
```bash
curl -X GET http://localhost:8080/api/expenses/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Expense Types (gas_tipo)

Common expense types you can use:
- **"Fijo"**: Fixed expenses (rent, utilities, salaries)
- **"Variable"**: Variable expenses (products, supplies)
- **"Directo"**: Direct expenses (related to services)
- **"Indirecto"**: Indirect expenses (administration, marketing)

## Integration with Purchase System

Expenses (GASTO_MENSUAL) are referenced by:
- **Purchases (COMPRA_PRODUCTO)**: Each purchase must reference an expense ID
- **Payments (PAGO)**: Employee salary payments reference expense IDs

This allows you to track which purchases and payments belong to which expense categories for better financial reporting.

## Database Schema

The `GASTO_MENSUAL` table structure:
- `gas_id`: Primary key (auto-increment)
- `gas_descripcion`: Description of the expense (TEXT, optional)
- `gas_fecha`: Date of the expense (DATE, required)
- `gas_monto`: Amount of money (DECIMAL(10,2), required)
- `gas_tipo`: Type of expense (VARCHAR(50), required)

## Files Created

- `src/controllers/expense.go`: Expense management controller
- `src/routes/expense_routes.go`: Expense API routes
- `src/routes/routes.go`: Updated to include expense routes

The expense system is now fully integrated and ready to use!
