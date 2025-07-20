package models

import (
	"time"
)

// UsuarioSistema represents system users (matches database schema exactly)
type UsuarioSistema struct {
	UsuID            uint   `json:"usu_id" gorm:"primaryKey;autoIncrement;column:usu_id"`
	UsuNombreUsuario string `json:"usu_nombre_usuario" gorm:"not null;column:usu_nombre_usuario"`
	UsuContrasena    string `json:"-" gorm:"not null;column:usu_contrasena"`
	UsuRol           string `json:"usu_rol" gorm:"not null;column:usu_rol"`
	EmpID            *uint  `json:"emp_id,omitempty" gorm:"column:emp_id"`
	CliID            *uint  `json:"cli_id,omitempty" gorm:"column:cli_id"`
}

func (UsuarioSistema) TableName() string {
	return "USUARIO_SISTEMA"
}

// Employee represents the employees table (matches database schema exactly)
type Employee struct {
	EmpID       uint    `json:"emp_id" gorm:"primaryKey;autoIncrement;column:emp_id"`
	EmpNombre   string  `json:"emp_nombre" gorm:"not null;column:emp_nombre"`
	EmpApellido string  `json:"emp_apellido" gorm:"not null;column:emp_apellido"`
	EmpTelefono string  `json:"emp_telefono" gorm:"column:emp_telefono"`
	EmpCorreo   string  `json:"emp_correo" gorm:"not null;column:emp_correo"`
	EmpPuesto   string  `json:"emp_puesto" gorm:"not null;column:emp_puesto"`
	EmpSalario  float64 `json:"emp_salario" gorm:"not null;column:emp_salario"`
	EmpPassword string  `json:"emp_password" gorm:"-"`
}

func (Employee) TableName() string {
	return "EMPLEADO"
}

// Client represents the clients table (matches database schema exactly)
type Client struct {
	CliID       uint   `json:"cli_id" gorm:"primaryKey;autoIncrement;column:cli_id"`
	CliNombre   string `json:"cli_nombre" gorm:"column:cli_nombre"`
	CliApellido string `json:"cli_apellido" gorm:"column:cli_apellido"`
	CliTelefono string `json:"cli_telefono" gorm:"column:cli_telefono"`
	CliCorreo   string `json:"cli_correo" gorm:"not null;column:cli_correo"`
	CliPassword string `json:"cli_password" gorm:"-"`
	// Password is not stored in the database, but used for authentication
}

func (Client) TableName() string {
	return "CLIENTE"
}

// Service represents the services table (matches database schema exactly)
type Service struct {
	SerID               uint    `json:"ser_id" gorm:"primaryKey;autoIncrement;column:ser_id"`
	SerNombre           string  `json:"ser_nombre" gorm:"not null;column:ser_nombre"`
	SerDescripcion      string  `json:"ser_descripcion" gorm:"column:ser_descripcion"`
	SerPrecioUnitario   float64 `json:"ser_precio_unitario" gorm:"not null;column:ser_precio_unitario"`
	SerCategoria        string  `json:"ser_categoria" gorm:"not null;column:ser_categoria"`
	SerDuracionEstimada int     `json:"ser_duracion_estimada" gorm:"default:60;column:ser_duracion_estimada"`
}

func (Service) TableName() string {
	return "SERVICIO"
}

// Product represents the products table (matches database schema exactly)
type Product struct {
	ProdID                 uint    `json:"prod_id" gorm:"primaryKey;autoIncrement;column:prod_id"`
	ProdNombre             string  `json:"prod_nombre" gorm:"not null;column:prod_nombre"`
	ProdDescripcion        string  `json:"prod_descripcion" gorm:"column:prod_descripcion"`
	ProdCantidadDisponible int     `json:"prod_cantidad_disponible" gorm:"not null;column:prod_cantidad_disponible"`
	ProdPrecioUnitario     float64 `json:"prod_precio_unitario" gorm:"not null;column:prod_precio_unitario"`
}

func (Product) TableName() string {
	return "PRODUCTO"
}

// Inventory represents the inventory table (matches database schema exactly)
type Inventory struct {
	InvID                 uint      `json:"inv_id" gorm:"primaryKey;autoIncrement;column:inv_id"`
	InvFechaActualizacion time.Time `json:"inv_fecha_actualizacion" gorm:"not null;column:inv_fecha_actualizacion"`
	ProdID                uint      `json:"prod_id" gorm:"not null;column:prod_id"`
	InvCantidadActual     int       `json:"inv_cantidad_actual" gorm:"not null;column:inv_cantidad_actual"`
	InvObservaciones      string    `json:"inv_observaciones" gorm:"column:inv_observaciones"`
	Product               Product   `json:"producto,omitempty" gorm:"foreignKey:ProdID;references:ProdID"`
}

func (Inventory) TableName() string {
	return "INVENTARIO"
}

// Supplier represents the suppliers table (matches database schema exactly)
type Supplier struct {
	ProvID        uint   `json:"prov_id" gorm:"primaryKey;autoIncrement;column:prov_id"`
	ProvNombre    string `json:"prov_nombre" gorm:"not null;column:prov_nombre"`
	ProvTelefono  string `json:"prov_telefono" gorm:"not null;column:prov_telefono"`
	ProvCorreo    string `json:"prov_correo" gorm:"not null;column:prov_correo"`
	ProvDireccion string `json:"prov_direccion" gorm:"not null;column:prov_direccion"`
}

func (Supplier) TableName() string {
	return "PROVEEDOR"
}

// Purchase represents the purchases table (matches database schema)
type Purchase struct {
	ComID          uint      `json:"com_id" gorm:"primaryKey;autoIncrement;column:com_id"`
	CopFechaCompra time.Time `json:"cop_fecha_compra" gorm:"not null;column:cop_fecha_compra"`
	CopTotalCompra float64   `json:"cop_total_compra" gorm:"not null;column:cop_total_compra"`
	CopMetodoPago  string    `json:"cop_metodo_pago" gorm:"not null;column:cop_metodo_pago"`
	ProvID         uint      `json:"prov_id" gorm:"not null;column:prov_id"`
	GasID          uint      `json:"gas_id" gorm:"not null;column:gas_id"`
}

func (Purchase) TableName() string {
	return "COMPRA_PRODUCTO"
}

// DetalleCompra represents purchase details table (matches database schema)
type DetalleCompra struct {
	ComID            uint    `json:"com_id" gorm:"primaryKey;column:com_id"`
	ProdID           uint    `json:"prod_id" gorm:"primaryKey;column:prod_id"`
	DecCantidad      int     `json:"dec_cantidad" gorm:"not null;column:dec_cantidad"`
	DecPrecioUnitario float64 `json:"dec_precio_unitario" gorm:"not null;column:dec_precio_unitario"`
}

func (DetalleCompra) TableName() string {
	return "DETALLE_COMPRA"
}

// PurchaseWithDetails represents a complete purchase with its details
type PurchaseWithDetails struct {
	ComID          uint                `json:"com_id"`
	CopFechaCompra time.Time           `json:"cop_fecha_compra"`
	CopTotalCompra float64             `json:"cop_total_compra"`
	CopMetodoPago  string              `json:"cop_metodo_pago"`
	ProvID         uint                `json:"prov_id"`
	GasID          uint                `json:"gas_id"`
	Proveedor      string              `json:"proveedor"`
	Productos      string              `json:"productos"`
	Detalles       []DetalleCompra     `json:"detalles,omitempty"`
}

// Payment represents employee salary payments (matches database schema)
type Payment struct {
	PagID     uint      `json:"pag_id" gorm:"primaryKey;autoIncrement;column:pag_id"`
	PagFecha  time.Time `json:"pag_fecha" gorm:"not null;column:pag_fecha"`
	PagMonto  float64   `json:"pag_monto" gorm:"not null;column:pag_monto"`
	PagMetodo string    `json:"pag_metodo" gorm:"not null;column:pag_metodo"`
	GasID     uint      `json:"gas_id" gorm:"not null;column:gas_id"`
	EmpID     uint      `json:"emp_id" gorm:"not null;column:emp_id"`
}

func (Payment) TableName() string {
	return "PAGO"
}

// GastoMensual represents monthly expenses table (matches database schema)
type GastoMensual struct {
	GasID          uint      `json:"gas_id" gorm:"primaryKey;autoIncrement;column:gas_id"`
	GasDescripcion string    `json:"gas_descripcion" gorm:"column:gas_descripcion"`
	GasFecha       time.Time `json:"gas_fecha" gorm:"not null;column:gas_fecha"`
	GasMonto       float64   `json:"gas_monto" gorm:"not null;column:gas_monto"`
	GasTipo        string    `json:"gas_tipo" gorm:"not null;column:gas_tipo"`
}

func (GastoMensual) TableName() string {
	return "GASTO_MENSUAL"
}

// Promotion represents service promotions (matches database schema)
type Promotion struct {
	ProID                  uint      `json:"pro_id" gorm:"primaryKey;autoIncrement;column:pro_id"`
	ProNombre              string    `json:"pro_nombre" gorm:"not null;column:pro_nombre"`
	ProDescripcion         string    `json:"pro_descripcion" gorm:"column:pro_descripcion"`
	ProFechaInicio         time.Time `json:"pro_fecha_inicio" gorm:"not null;column:pro_fecha_inicio"`
	ProFechaFin            time.Time `json:"pro_fecha_fin" gorm:"not null;column:pro_fecha_fin"`
	ProDescuentoPorcentaje float64   `json:"pro_descuento_porcentaje" gorm:"column:pro_descuento_porcentaje"`
	SerID                  uint      `json:"ser_id" gorm:"not null;column:ser_id"`
	ProUsos                int       `json:"pro_usos" gorm:"column:pro_usos"`
}

func (Promotion) TableName() string {
	return "PROMOCION"
}

// PromotionWithService represents promotion data with service information from NATURAL JOIN
// Matches the exact schema from sp_listar_promociones stored procedure
type PromotionWithService struct {
	ProID                  uint    `json:"pro_id" gorm:"column:pro_id"`
	ProNombre              string  `json:"pro_nombre" gorm:"column:pro_nombre"`
	ProDescripcion         string  `json:"pro_descripcion" gorm:"column:pro_descripcion"`
	ProFechaInicio         string  `json:"pro_fecha_inicio" gorm:"column:pro_fecha_inicio"` // DATE returns as string from stored procedure
	ProFechaFin            string  `json:"pro_fecha_fin" gorm:"column:pro_fecha_fin"`       // DATE returns as string from stored procedure
	ProDescuentoPorcentaje float64 `json:"pro_descuento_porcentaje" gorm:"column:pro_descuento_porcentaje"`
	ProUsos                int     `json:"pro_usos" gorm:"column:pro_usos"`
	SerNombre              string  `json:"ser_nombre" gorm:"column:ser_nombre"`
}

// Views structs for dashboard metrics (used with stored procedures)
type EmpleadosActivos struct {
	TotalActivos int `json:"total_activos" gorm:"column:total_activos"`
}

type CitasHoy struct {
	TotalHoy int `json:"total_hoy" gorm:"column:total_hoy"`
}

type IngresosMensuales struct {
	IngresosMes float64 `json:"ingresos_mes" gorm:"column:ingresos_mes"`
}

type ProductosBajos struct {
	ProductosBajos int `json:"productos_bajos" gorm:"column:productos_bajos"`
}

type TotalProductos struct {
	TotalProductos int `json:"total_productos" gorm:"column:total_productos"`
}

type ValorInventario struct {
	ValorTotal float64 `json:"valor_total" gorm:"column:valor_total"`
}

type ServiciosTotales struct {
	TotalServicios int `json:"total_servicios" gorm:"column:total_servicios"`
}

type PrecioPromedioServicios struct {
	PrecioPromedio float64 `json:"precio_promedio" gorm:"column:precio_promedio"`
}

type ServicioPremium struct {
	SerID             uint    `json:"ser_id" gorm:"column:ser_id"`
	SerNombre         string  `json:"ser_nombre" gorm:"column:ser_nombre"`
	SerPrecioUnitario float64 `json:"ser_precio_unitario" gorm:"column:ser_precio_unitario"`
}

type TotalProveedores struct {
	TotalProveedores int `json:"total_proveedores" gorm:"column:total_proveedores"`
}

// Cita represents appointments table (matches database schema exactly)
type Cita struct {
	CitID    uint      `json:"cit_id" gorm:"primaryKey;autoIncrement;column:cit_id"`
	CitFecha time.Time `json:"cit_fecha" gorm:"not null;column:cit_fecha"`
	CitHora  string    `json:"cit_hora" gorm:"not null;column:cit_hora"`
	EmpID    uint      `json:"emp_id" gorm:"not null;column:emp_id"`
	SerID    uint      `json:"ser_id" gorm:"not null;column:ser_id"`
	CliID    uint      `json:"cli_id" gorm:"not null;column:cli_id"`
}

func (Cita) TableName() string {
	return "CITA"
}

// FacturaServicio represents service invoices table (matches database schema exactly)
type FacturaServicio struct {
	FacID    uint      `json:"fac_id" gorm:"primaryKey;autoIncrement;column:fac_id"`
	FacTotal float64   `json:"fac_total" gorm:"not null;column:fac_total"`
	FacFecha time.Time `json:"fac_fecha" gorm:"not null;column:fac_fecha"`
	FacHora  string    `json:"fac_hora" gorm:"not null;column:fac_hora"`
	CliID    uint      `json:"cli_id" gorm:"not null;column:cli_id"`
}

func (FacturaServicio) TableName() string {
	return "FACTURA_SERVICIO"
}

// DetalleFacturaServicio represents invoice details table (matches database schema exactly)
type DetalleFacturaServicio struct {
	FacID uint `json:"fac_id" gorm:"primaryKey;column:fac_id"`
	SerID uint `json:"ser_id" gorm:"primaryKey;column:ser_id"`
}

func (DetalleFacturaServicio) TableName() string {
	return "DETALLE_FACTURA_SERVICIO"
}

// HistorialCita represents appointment history table (matches database schema exactly)
type HistorialCita struct {
	HisID            uint   `json:"his_id" gorm:"primaryKey;autoIncrement;column:his_id"`
	HisObservaciones string `json:"his_observaciones" gorm:"column:his_observaciones"`
	CitID            uint   `json:"cit_id" gorm:"not null;column:cit_id"`
}

func (HistorialCita) TableName() string {
	return "HISTORIAL_CITA"
}

// Additional structs for frontend compatibility
type ClientPayment struct {
	PagCliID uint      `json:"pag_cli_id"`
	Fecha    time.Time `json:"fecha"`
	Monto    float64   `json:"monto"`
	Metodo   string    `json:"metodo"`
	Servicio string    `json:"servicio"`
	Cliente  string    `json:"cliente"`
}

// PaymentWithEmployee represents payment data with employee information
type PaymentWithEmployee struct {
	PagID       uint    `json:"pag_id" gorm:"column:pag_id"`
	PagFecha    string  `json:"pag_fecha" gorm:"column:pag_fecha"` // DATE returns as string from stored procedure
	PagMonto    float64 `json:"pag_monto" gorm:"column:pag_monto"`
	PagMetodo   string  `json:"pag_metodo" gorm:"column:pag_metodo"`
	GasID       uint    `json:"gas_id" gorm:"column:gas_id"`
	EmpID       uint    `json:"emp_id" gorm:"column:emp_id"`
	EmpNombre   string  `json:"emp_nombre" gorm:"column:emp_nombre"`
	EmpApellido string  `json:"emp_apellido" gorm:"column:emp_apellido"`
}

// EmployeePaymentSummary represents payment summary for a specific employee
type EmployeePaymentSummary struct {
	EmpID     uint    `json:"emp_id" gorm:"column:emp_id"`
	Empleado  string  `json:"empleado" gorm:"column:empleado"` // CONCAT result
	PagID     uint    `json:"pag_id" gorm:"column:pag_id"`
	PagFecha  string  `json:"pag_fecha" gorm:"column:pag_fecha"`
	PagMonto  float64 `json:"pag_monto" gorm:"column:pag_monto"`
	PagMetodo string  `json:"pag_metodo" gorm:"column:pag_metodo"`
	GasID     uint    `json:"gas_id" gorm:"column:gas_id"`
}

// InventoryComplete represents inventory data with product information
type InventoryComplete struct {
	InvID                  uint    `json:"inv_id" gorm:"column:inv_id"`
	InvFechaActualizacion  string  `json:"inv_fecha_actualizacion" gorm:"column:inv_fecha_actualizacion"`
	ProdID                 uint    `json:"prod_id" gorm:"column:prod_id"`
	InvCantidadActual      int     `json:"inv_cantidad_actual" gorm:"column:inv_cantidad_actual"`
	InvObservaciones       string  `json:"inv_observaciones" gorm:"column:inv_observaciones"`
	ProdNombre             string  `json:"prod_nombre" gorm:"column:prod_nombre"`
	ProdDescripcion        string  `json:"prod_descripcion" gorm:"column:prod_descripcion"`
	ProdCantidadDisponible int     `json:"prod_cantidad_disponible" gorm:"column:prod_cantidad_disponible"`
	ProdPrecioUnitario     float64 `json:"prod_precio_unitario" gorm:"column:prod_precio_unitario"`
}

// EmployeeHistory represents employee appointment history
type EmployeeHistory struct {
	HisID            uint   `json:"his_id" gorm:"column:his_id"`
	HisObservaciones string `json:"his_observaciones" gorm:"column:his_observaciones"`
	CitID            uint   `json:"cit_id" gorm:"column:cit_id"`
	CitFecha         string `json:"cit_fecha" gorm:"column:cit_fecha"`
	CitHora          string `json:"cit_hora" gorm:"column:cit_hora"`
	CliID            uint   `json:"cli_id" gorm:"column:cli_id"`
	SerID            uint   `json:"ser_id" gorm:"column:ser_id"`
}

type Appointment struct {
	AptID    uint      `json:"apt_id"`
	AptFecha time.Time `json:"apt_fecha"`
	AptHora  string    `json:"apt_hora"`
	CliID    uint      `json:"cli_id"`
	SerID    uint      `json:"ser_id"`
	EmpID    uint      `json:"emp_id"`
	Estado   string    `json:"estado"`
}

// Admin represents admin users
type Admin struct {
	AdminID   uint      `json:"admin_id" gorm:"primaryKey;autoIncrement"`
	Email     string    `json:"email" gorm:"unique;not null"`
	Password  string    `json:"password,omitempty" gorm:"not null"`
	Role      string    `json:"role" gorm:"default:'admin'"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
