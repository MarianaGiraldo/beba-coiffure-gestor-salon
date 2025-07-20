# Purchase Management System - API Documentation

## Overview

The Purchase Management System handles the creation and management of purchases (COMPRA_PRODUCTO) with their associated details (DETALLE_COMPRA). This system follows the flow you requested:

1. Create a purchase (similar to FACTURA_SERVICIO)
2. Add details to the purchase with a list of detalle_compra items
3. Get the list of full purchases with details using sp_listar_compras

## Database Structure

### Tables Involved
- `COMPRA_PRODUCTO`: Main purchase record
- `DETALLE_COMPRA`: Purchase details (products bought)
- `GASTO_MENSUAL`: Monthly expenses (referenced by purchases)
- `PROVEEDOR`: Suppliers
- `PRODUCTO`: Products

### New Models Added
- `Purchase`: Represents COMPRA_PRODUCTO table
- `DetalleCompra`: Represents DETALLE_COMPRA table
- `PurchaseWithDetails`: Complete purchase data with details
- `GastoMensual`: Represents GASTO_MENSUAL table

## API Endpoints

### Base URL: `/api/purchases`

#### 1. Get All Purchases
```
GET /api/purchases
```
**Authentication**: Required
**Response**: List of all purchases with basic details from sp_listar_compras

#### 2. Get Purchase by ID
```
GET /api/purchases/{id}
```
**Authentication**: Required
**Response**: Complete purchase data including all details

#### 3. Create Purchase
```
POST /api/purchases
```
**Authentication**: Admin required
**Request Body**:
```json
{
  "cop_fecha_compra": "2025-01-20",
  "cop_metodo_pago": "Efectivo",
  "prov_id": 1,
  "gas_id": 1,
  "detalles": [
    {
      "prod_id": 1,
      "dec_cantidad": 5,
      "dec_precio_unitario": 25.50
    },
    {
      "prod_id": 2,
      "dec_cantidad": 2,
      "dec_precio_unitario": 15.00
    }
  ]
}
```

#### 4. Update Purchase Header
```
PUT /api/purchases/{id}
```
**Authentication**: Admin required
**Request Body**:
```json
{
  "cop_fecha_compra": "2025-01-21",
  "cop_total_compra": 157.50,
  "cop_metodo_pago": "Tarjeta",
  "prov_id": 1,
  "gas_id": 1
}
```

#### 5. Delete Purchase
```
DELETE /api/purchases/{id}
```
**Authentication**: Admin required
**Response**: Deletes purchase and all its details

### Purchase Details Management

#### 6. Get Purchase Details
```
GET /api/purchases/{id}/details
```
**Authentication**: Required

#### 7. Add Purchase Detail
```
POST /api/purchases/{id}/details
```
**Authentication**: Admin required
**Request Body**:
```json
{
  "prod_id": 3,
  "dec_cantidad": 1,
  "dec_precio_unitario": 45.00
}
```

#### 8. Update Purchase Detail
```
PUT /api/purchases/{id}/details/{prodId}
```
**Authentication**: Admin required
**Request Body**:
```json
{
  "prod_id": 3,
  "dec_cantidad": 2,
  "dec_precio_unitario": 42.00
}
```

#### 9. Delete Purchase Detail
```
DELETE /api/purchases/{id}/details/{prodId}
```
**Authentication**: Admin required

## Stored Procedures

### Purchase Procedures
- `sp_insertar_compra`: Creates a new purchase
- `sp_buscar_compra_por_id`: Gets purchase by ID with supplier info
- `sp_obtener_ultima_compra`: Gets the last inserted purchase
- `sp_actualizar_compra`: Updates purchase header
- `sp_eliminar_compra`: Deletes purchase and all details
- `sp_listar_compras`: Lists all purchases with product names (GROUP_CONCAT)

### Purchase Detail Procedures
- `sp_insertar_detalle_compra`: Adds detail and updates total
- `sp_actualizar_detalle_compra`: Updates detail and recalculates total
- `sp_eliminar_detalle_compra`: Removes detail and recalculates total
- `sp_listar_detalles_compra`: Gets all details for a purchase

### Expense Procedures
- `sp_insertar_gasto`: Creates monthly expense
- `sp_listar_gastos`: Lists all expenses
- `sp_buscar_gasto_por_id`: Gets expense by ID
- `sp_actualizar_gasto`: Updates expense
- `sp_eliminar_gasto`: Deletes expense

## Go Functions Added

### Purchase Service Functions (stored_procedures.go)
```go
// Purchase management
func (s *DatabaseService) InsertarCompra(fecha string, total float64, metodoPago string, provID, gasID uint) error
func (s *DatabaseService) BuscarCompraPorID(comID uint) (*models.PurchaseWithDetails, error)
func (s *DatabaseService) ObtenerUltimaCompra() (*models.Purchase, error)
func (s *DatabaseService) ActualizarCompra(comID uint, fecha string, total float64, metodoPago string, provID, gasID uint) error
func (s *DatabaseService) EliminarCompra(comID uint) error
func (s *DatabaseService) ListarCompras() ([]models.PurchaseWithDetails, error)

// Purchase detail management
func (s *DatabaseService) InsertarDetalleCompra(comID, prodID uint, cantidad int, precioUnitario float64) error
func (s *DatabaseService) ActualizarDetalleCompra(comID, prodID uint, cantidad int, precioUnitario float64) error
func (s *DatabaseService) EliminarDetalleCompra(comID, prodID uint) error
func (s *DatabaseService) ListarDetallesCompra(comID uint) ([]models.DetalleCompra, error)

// Expense management
func (s *DatabaseService) InsertarGasto(descripcion string, fecha string, monto float64, tipo string) error
func (s *DatabaseService) ListarGastos() ([]models.GastoMensual, error)
func (s *DatabaseService) BuscarGastoPorID(gasID uint) (*models.GastoMensual, error)
func (s *DatabaseService) ActualizarGasto(gasID uint, descripcion string, fecha string, monto float64, tipo string) error
func (s *DatabaseService) EliminarGasto(gasID uint) error
```

## Usage Flow

### 1. Create a Complete Purchase
```bash
curl -X POST http://localhost:8080/api/purchases \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "cop_fecha_compra": "2025-01-20",
    "cop_metodo_pago": "Efectivo",
    "prov_id": 1,
    "gas_id": 1,
    "detalles": [
      {
        "prod_id": 1,
        "dec_cantidad": 5,
        "dec_precio_unitario": 25.50
      }
    ]
  }'
```

### 2. Get All Purchases with Details
```bash
curl -X GET http://localhost:8080/api/purchases \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Get Specific Purchase with Full Details
```bash
curl -X GET http://localhost:8080/api/purchases/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Key Features

1. **Automatic Total Calculation**: Purchase totals are automatically calculated when details are added/updated/removed
2. **Transactional Safety**: Purchase creation includes both header and details in a single flow
3. **Complete CRUD Operations**: Full create, read, update, delete operations for both purchases and details
4. **Supplier Integration**: Purchases are linked to suppliers (PROVEEDOR)
5. **Expense Tracking**: Purchases are linked to monthly expenses (GASTO_MENSUAL)
6. **Product Details**: Each purchase detail includes product information

## Files Created/Modified

### New Files:
- `src/controllers/purchase.go`: Purchase management controller
- `src/routes/purchase_routes.go`: Purchase API routes

### Modified Files:
- `src/models/models.go`: Added DetalleCompra, PurchaseWithDetails, GastoMensual models
- `src/services/stored_procedures.go`: Added purchase and expense management functions
- `src/sql/04_stored_procedures_crud.sql`: Added missing stored procedures
- `src/routes/routes.go`: Added purchase routes setup

The system is now ready to handle complete purchase management with the flow you requested!
