package services

import (
	"fmt"
	"salon/models"

	"gorm.io/gorm"
)

type DatabaseService struct {
	DB *gorm.DB
}

func NewDatabaseService(db *gorm.DB) *DatabaseService {
	return &DatabaseService{DB: db}
}

// ============= EMPLOYEE PROCEDURES =============

func (s *DatabaseService) GetEmpleados() ([]models.Employee, error) {
	var employees []models.Employee
	err := s.DB.Raw("CALL sp_get_empleados()").Scan(&employees).Error
	return employees, err
}

func (s *DatabaseService) InsertEmpleado(emp models.Employee) error {
	err := s.DB.Exec("CALL sp_insert_empleado(?, ?, ?, ?, ?, ?, ?)",
		emp.EmpNombre, emp.EmpApellido, emp.EmpTelefono,
		emp.EmpCorreo, emp.EmpPuesto, emp.EmpSalario, emp.EmpPassword).Error
	if err != nil {
		return err
	}
	return s.CrearUsuarioConRolDirecto(emp.EmpCorreo, emp.EmpPassword, "empleado")
}

func (s *DatabaseService) UpdateEmpleado(emp models.Employee) error {
	return s.DB.Exec("CALL sp_update_empleado(?, ?, ?, ?, ?, ?, ?)",
		emp.EmpID, emp.EmpNombre, emp.EmpApellido, emp.EmpTelefono,
		emp.EmpCorreo, emp.EmpPuesto, emp.EmpSalario).Error
}

func (s *DatabaseService) DeleteEmpleado(id uint) error {
	return s.DB.Exec("CALL sp_delete_empleado(?)", id).Error
}

// ============= CLIENT PROCEDURES =============

func (s *DatabaseService) GetClientes() ([]models.Client, error) {
	var clients []models.Client
	err := s.DB.Raw("CALL sp_get_clientes()").Scan(&clients).Error
	return clients, err
}

func (s *DatabaseService) InsertCliente(cli models.Client) error {
	err := s.DB.Exec("CALL sp_insert_cliente(?, ?, ?, ?, ?)",
		cli.CliNombre, cli.CliApellido, cli.CliTelefono, cli.CliCorreo, cli.CliPassword).Error
	if err != nil {
		return err
	}
	return s.CrearUsuarioConRolDirecto(cli.CliCorreo, cli.CliPassword, "cliente")
}

func (s *DatabaseService) UpdateCliente(cli models.Client) error {
	return s.DB.Exec("CALL sp_update_cliente(?, ?, ?, ?, ?)",
		cli.CliID, cli.CliNombre, cli.CliApellido, cli.CliTelefono, cli.CliCorreo).Error
}

func (s *DatabaseService) DeleteCliente(id uint) error {
	return s.DB.Exec("CALL sp_delete_cliente(?)", id).Error
}

// ============= PRODUCT PROCEDURES =============

func (s *DatabaseService) GetProductos() ([]models.Product, error) {
	var products []models.Product
	err := s.DB.Raw("CALL sp_get_productos()").Scan(&products).Error
	return products, err
}

func (s *DatabaseService) InsertProducto(prod models.Product) error {
	return s.DB.Exec("CALL sp_insert_producto(?, ?, ?, ?)",
		prod.ProdNombre, prod.ProdDescripcion,
		prod.ProdCantidadDisponible, prod.ProdPrecioUnitario).Error
}

func (s *DatabaseService) UpdateProducto(prod models.Product) error {
	return s.DB.Exec("CALL sp_update_producto(?, ?, ?, ?, ?)",
		prod.ProdID, prod.ProdNombre, prod.ProdDescripcion,
		prod.ProdCantidadDisponible, prod.ProdPrecioUnitario).Error
}

func (s *DatabaseService) DeleteProducto(id uint) error {
	return s.DB.Exec("CALL sp_delete_producto(?)", id).Error
}

// ============= VIEW PROCEDURES FOR DASHBOARD =============

func (s *DatabaseService) GetEmpleadosActivos() (*models.EmpleadosActivos, error) {
	var result models.EmpleadosActivos
	err := s.DB.Raw("CALL sp_get_empleados_activos()").Scan(&result).Error
	if err != nil {
		return nil, err
	}
	return &result, nil
}

func (s *DatabaseService) GetCitasHoy() (*models.CitasHoy, error) {
	var result models.CitasHoy
	err := s.DB.Raw("CALL sp_get_citas_hoy()").Scan(&result).Error
	if err != nil {
		return nil, err
	}
	return &result, nil
}

func (s *DatabaseService) GetIngresosMensuales() (*models.IngresosMensuales, error) {
	var result models.IngresosMensuales
	err := s.DB.Raw("CALL sp_get_ingresos_mensuales()").Scan(&result).Error
	if err != nil {
		return nil, err
	}
	return &result, nil
}

func (s *DatabaseService) GetProductosBajos() (*models.ProductosBajos, error) {
	var result models.ProductosBajos
	err := s.DB.Raw("CALL sp_get_productos_bajos()").Scan(&result).Error
	if err != nil {
		return nil, err
	}
	return &result, nil
}

func (s *DatabaseService) GetTotalProductos() (*models.TotalProductos, error) {
	var result models.TotalProductos
	err := s.DB.Raw("CALL sp_get_total_productos()").Scan(&result).Error
	if err != nil {
		return nil, err
	}
	return &result, nil
}

func (s *DatabaseService) GetValorInventario() (*models.ValorInventario, error) {
	var result models.ValorInventario
	err := s.DB.Raw("CALL sp_get_valor_inventario()").Scan(&result).Error
	if err != nil {
		return nil, err
	}
	return &result, nil
}

func (s *DatabaseService) GetServiciosTotales() (*models.ServiciosTotales, error) {
	var result models.ServiciosTotales
	err := s.DB.Raw("CALL sp_get_servicios_totales()").Scan(&result).Error
	if err != nil {
		return nil, err
	}
	return &result, nil
}

func (s *DatabaseService) GetPrecioPromedioServicios() (*models.PrecioPromedioServicios, error) {
	var result models.PrecioPromedioServicios
	err := s.DB.Raw("CALL sp_get_precio_promedio_servicios()").Scan(&result).Error
	if err != nil {
		return nil, err
	}
	return &result, nil
}

func (s *DatabaseService) GetServicioPremium() (*models.ServicioPremium, error) {
	var result models.ServicioPremium
	err := s.DB.Raw("CALL sp_get_servicio_premium()").Scan(&result).Error
	if err != nil {
		return nil, err
	}
	return &result, nil
}

func (s *DatabaseService) GetTotalProveedores() (*models.TotalProveedores, error) {
	var result models.TotalProveedores
	err := s.DB.Raw("CALL sp_get_total_proveedores()").Scan(&result).Error
	if err != nil {
		return nil, err
	}
	return &result, nil
}

// ============= AUTHENTICATION PROCEDURES =============

func (s *DatabaseService) GetUsuarioByCredentials(username, role string) (*models.UsuarioSistema, error) {
	var user models.UsuarioSistema
	err := s.DB.Where("usu_nombre_usuario = ? AND usu_rol = ?", username, role).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (s *DatabaseService) CreateUsuarioSistema(user models.UsuarioSistema) error {
	return s.DB.Create(&user).Error
}

// ============= DASHBOARD METRICS (using views) =============

func (s *DatabaseService) GetDashboardMetrics() (map[string]interface{}, error) {
	metrics := make(map[string]interface{})

	// Get employees active
	empActivos, err := s.GetEmpleadosActivos()
	if err != nil {
		metrics["empleados_activos"] = 0
	} else {
		metrics["empleados_activos"] = empActivos.TotalActivos
	}

	// Get citas today
	citasHoy, err := s.GetCitasHoy()
	if err != nil {
		metrics["citas_hoy"] = 0
	} else {
		metrics["citas_hoy"] = citasHoy.TotalHoy
	}

	// Get monthly income
	ingresos, err := s.GetIngresosMensuales()
	if err != nil {
		metrics["ingresos_mensuales"] = 0.0
	} else {
		metrics["ingresos_mensuales"] = ingresos.IngresosMes
	}

	// Get low stock products
	prodBajos, err := s.GetProductosBajos()
	if err != nil {
		metrics["productos_bajos"] = 0
	} else {
		metrics["productos_bajos"] = prodBajos.ProductosBajos
	}

	return metrics, nil
}

// ============= SEARCH/LOOKUP PROCEDURES =============

func (s *DatabaseService) BuscarClientePorID(id uint) (*models.Client, error) {
	var client models.Client
	err := s.DB.Raw("CALL BuscarClientePorID(?)", id).Scan(&client).Error
	if err != nil {
		return nil, err
	}
	return &client, nil
}

func (s *DatabaseService) BuscarEmpleadoPorID(id uint) (*models.Employee, error) {
	var employee models.Employee
	err := s.DB.Raw("CALL BuscarEmpleadoPorID(?)", id).Scan(&employee).Error
	if err != nil {
		return nil, err
	}
	return &employee, nil
}

func (s *DatabaseService) BuscarUsuario(username string) (*models.UsuarioSistema, error) {
	var user models.UsuarioSistema
	err := s.DB.Raw("CALL BuscarUsuario(?)", username).Scan(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (s *DatabaseService) BuscarClientePorCorreo(email string) (*models.Client, error) {
	var client models.Client
	err := s.DB.Raw("CALL buscar_cliente_por_correo(?)", email).Scan(&client).Error
	if err != nil {
		return nil, err
	}
	return &client, nil
}

// ============= USER MANAGEMENT PROCEDURES =============

func (s *DatabaseService) CrearUsuarioConRol(username, password, role string) error {
	// Use the direct approach instead of the problematic stored procedure
	return s.CrearUsuarioConRolDirecto(username, password, role)
}

// CrearUsuarioConRolDirecto creates a MySQL user with the specified role using direct SQL commands
// This function replaces the problematic stored procedure that uses dynamic SQL
func (s *DatabaseService) CrearUsuarioConRolDirecto(username, password, role string) error {
	// Validate the role
	validRoles := map[string]string{
		"admin":    "rol_admin",
		"empleado": "rol_empleado",
		"cliente":  "rol_cliente",
	}

	mysqlRole, roleExists := validRoles[role]
	if !roleExists {
		return fmt.Errorf("rol no válido. Use: admin, empleado o cliente")
	}

	// Start a transaction to ensure all operations succeed or fail together
	tx := s.DB.Begin()
	if tx.Error != nil {
		return tx.Error
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// 1. Create the MySQL user
	createUserSQL := fmt.Sprintf("CREATE USER IF NOT EXISTS '%s'@'%%' IDENTIFIED BY '%s'", username, password)
	if err := tx.Exec(createUserSQL).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("error creating user: %v", err)
	}

	// 2. Grant the appropriate role to the user
	grantRoleSQL := fmt.Sprintf("GRANT %s TO '%s'@'%%'", mysqlRole, username)
	if err := tx.Exec(grantRoleSQL).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("error granting role: %v", err)
	}

	// 3. Set the default role for the user
	setDefaultRoleSQL := fmt.Sprintf("SET DEFAULT ROLE %s TO '%s'@'%%'", mysqlRole, username)
	if err := tx.Exec(setDefaultRoleSQL).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("error setting default role: %v", err)
	}

	// Commit the transaction
	if err := tx.Commit().Error; err != nil {
		return fmt.Errorf("error committing transaction: %v", err)
	}

	return nil
}

// CrearUsuarioSistemaConRol creates a user in the USUARIO_SISTEMA table only (not MySQL users)
// This is useful when you only need application-level users without MySQL database users
func (s *DatabaseService) CrearUsuarioSistemaConRol(username, password, role string, empID, cliID *uint) error {
	// Validate the role
	if role != "admin" && role != "empleado" && role != "cliente" {
		return fmt.Errorf("rol no válido. Use: admin, empleado o cliente")
	}

	// Validate that either emp_id or cli_id is provided based on role
	if role == "empleado" && empID == nil {
		return fmt.Errorf("emp_id es requerido para el rol empleado")
	}
	if role == "cliente" && cliID == nil {
		return fmt.Errorf("cli_id es requerido para el rol cliente")
	}

	// Check if username already exists
	var existingUser models.UsuarioSistema
	if err := s.DB.Where("usu_nombre_usuario = ?", username).First(&existingUser).Error; err == nil {
		return fmt.Errorf("el nombre de usuario ya existe")
	}

	// Create user in USUARIO_SISTEMA table
	user := models.UsuarioSistema{
		UsuNombreUsuario: username,
		UsuContrasena:    password,
		UsuRol:           role,
		EmpID:            empID,
		CliID:            cliID,
	}

	if err := s.DB.Create(&user).Error; err != nil {
		return fmt.Errorf("error creating user in USUARIO_SISTEMA: %v", err)
	}

	return nil
}

func (s *DatabaseService) ObtenerDatosUsuario(username, role string) (map[string]interface{}, error) {
	var result map[string]interface{}
	err := s.DB.Raw("CALL ObtenerDatosUsuario(?, ?)", username, role).Scan(&result).Error
	return result, err
}

func (s *DatabaseService) InsertarUsuarioSistema(username, email, password string, empID, cliID *uint) error {
	return s.DB.Exec("CALL insertar_usuario_sistema(?, ?, ?, ?, ?)",
		username, email, password, empID, cliID).Error
}

// ============= INVENTORY PROCEDURES =============

func (s *DatabaseService) CrearInventario(fecha string, prodID uint, cantidad int, observaciones string) error {
	return s.DB.Exec("CALL CrearInventario(?, ?, ?, ?)",
		fecha, prodID, cantidad, observaciones).Error
}

func (s *DatabaseService) ObtenerInventarioCompleto() ([]models.InventoryComplete, error) {
	var inventories []models.InventoryComplete
	err := s.DB.Raw("CALL ObtenerInventarioCompleto()").Scan(&inventories).Error
	return inventories, err
}

func (s *DatabaseService) ActualizarInventario(invID uint, fecha string, cantidad int, observaciones string) error {
	return s.DB.Exec("CALL ActualizarInventario(?, ?, ?, ?)",
		invID, fecha, cantidad, observaciones).Error
}

func (s *DatabaseService) EliminarInventario(invID uint) error {
	return s.DB.Exec("CALL EliminarInventario(?)", invID).Error
}

// ============= ALTERNATIVE PRODUCT PROCEDURES =============

func (s *DatabaseService) CrearProducto(nombre, descripcion string, cantidad int, precio float64) error {
	return s.DB.Exec("CALL CrearProducto(?, ?, ?, ?)",
		nombre, descripcion, cantidad, precio).Error
}

func (s *DatabaseService) ActualizarProducto(prodID uint, nombre, descripcion string, cantidad int, precio float64) error {
	return s.DB.Exec("CALL ActualizarProducto(?, ?, ?, ?, ?)",
		prodID, nombre, descripcion, cantidad, precio).Error
}

func (s *DatabaseService) EliminarProducto(prodID uint) error {
	return s.DB.Exec("CALL EliminarProducto(?)", prodID).Error
}

// ============= SUPPLIER PROCEDURES (using stored procedures) =============

func (s *DatabaseService) CrearProveedor(nombre, telefono, correo, direccion string) error {
	return s.DB.Exec("CALL CrearProveedor(?, ?, ?, ?)",
		nombre, telefono, correo, direccion).Error
}

func (s *DatabaseService) ObtenerProveedores() ([]models.Supplier, error) {
	var suppliers []models.Supplier
	err := s.DB.Raw("CALL ObtenerProveedores()").Scan(&suppliers).Error
	return suppliers, err
}

func (s *DatabaseService) ActualizarProveedor(provID uint, nombre, telefono, correo, direccion string) error {
	return s.DB.Exec("CALL ActualizarProveedor(?, ?, ?, ?, ?)",
		provID, nombre, telefono, correo, direccion).Error
}

func (s *DatabaseService) EliminarProveedor(provID uint) error {
	return s.DB.Exec("CALL EliminarProveedor(?)", provID).Error
}

// ============= PAYMENT PROCEDURES =============

func (s *DatabaseService) CrearPago(fecha string, monto float64, metodo string, gasID, empID uint) error {
	return s.DB.Exec("CALL CrearPago(?, ?, ?, ?, ?)",
		fecha, monto, metodo, gasID, empID).Error
}

func (s *DatabaseService) ObtenerPagos() ([]models.Payment, error) {
	var pagos []models.Payment
	err := s.DB.Raw("CALL ObtenerPagos()").Scan(&pagos).Error
	return pagos, err
}

func (s *DatabaseService) ActualizarPago(pagoID uint, fecha string, monto float64, metodo string, gasID, empID uint) error {
	return s.DB.Exec("CALL ActualizarPago(?, ?, ?, ?, ?, ?)",
		pagoID, fecha, monto, metodo, gasID, empID).Error
}

func (s *DatabaseService) EliminarPago(pagoID uint) error {
	return s.DB.Exec("CALL EliminarPago(?)", pagoID).Error
}

func (s *DatabaseService) ObtenerPagosPorEmpleado(empID uint) ([]models.EmployeePaymentSummary, error) {
	var pagos []models.EmployeePaymentSummary
	err := s.DB.Raw("CALL ObtenerPagosPorEmpleado(?)", empID).Scan(&pagos).Error
	return pagos, err
}

func (s *DatabaseService) ObtenerTodosLosPagosConEmpleado() ([]models.PaymentWithEmployee, error) {
	var pagos []models.PaymentWithEmployee
	err := s.DB.Raw("CALL ObtenerTodosLosPagosConEmpleado()").Scan(&pagos).Error
	return pagos, err
}

// ============= PROMOTION PROCEDURES =============

type PromocionParams struct {
	Nombre      string
	Descripcion string
	FechaInicio string
	FechaFin    string
	Descuento   float64
	SerID       uint
	Usos        int
}

func (s *DatabaseService) CrearPromocion(params PromocionParams) error {
	return s.DB.Exec("CALL sp_crear_promocion(?, ?, ?, ?, ?, ?, ?)",
		params.Nombre, params.Descripcion, params.FechaInicio, params.FechaFin,
		params.Descuento, params.SerID, params.Usos).Error
}

func (s *DatabaseService) ListarPromociones() ([]models.PromotionWithService, error) {
	var promociones []models.PromotionWithService
	err := s.DB.Raw("CALL sp_listar_promociones()").Scan(&promociones).Error
	return promociones, err
}

func (s *DatabaseService) ObtenerPromocionPorID(proID uint) (*models.Promotion, error) {
	var promocion models.Promotion
	err := s.DB.Raw("CALL sp_obtener_promocion_por_id(?)", proID).Scan(&promocion).Error
	if err != nil {
		return nil, err
	}
	return &promocion, err
}

func (s *DatabaseService) ActualizarPromocion(proID uint, params PromocionParams) error {
	return s.DB.Exec("CALL sp_actualizar_promocion(?, ?, ?, ?, ?, ?, ?, ?)",
		proID, params.Nombre, params.Descripcion, params.FechaInicio, params.FechaFin,
		params.Descuento, params.SerID, params.Usos).Error
}

func (s *DatabaseService) EliminarPromocion(proID uint) error {
	return s.DB.Exec("CALL sp_eliminar_promocion(?)", proID).Error
}

// ============= USER MANAGEMENT PROCEDURES =============

func (s *DatabaseService) UpdateUsuario(usuID uint, nombreUsuario, contrasena, rol string) error {
	return s.DB.Exec("CALL sp_update_usuario(?, ?, ?, ?)",
		usuID, nombreUsuario, contrasena, rol).Error
}

// ============= APPOINTMENT PROCEDURES =============

func (s *DatabaseService) VerCitasEmpleado(empID uint) ([]models.Cita, error) {
	var citas []models.Cita
	err := s.DB.Raw("CALL sp_ver_citas_empleado(?)", empID).Scan(&citas).Error
	return citas, err
}

func (s *DatabaseService) VerHistorialEmpleado(empID uint) ([]models.EmployeeHistory, error) {
	var historial []models.EmployeeHistory
	err := s.DB.Raw("CALL sp_ver_historial_empleado(?)", empID).Scan(&historial).Error
	return historial, err
}

func (s *DatabaseService) InsertarCita(fecha string, hora string, empID, serID, cliID uint) error {
	return s.DB.Exec("CALL sp_insertar_cita(?, ?, ?, ?, ?)",
		fecha, hora, empID, serID, cliID).Error
}

func (s *DatabaseService) ListarCitas() ([]models.Cita, error) {
	var citas []models.Cita
	err := s.DB.Raw("CALL sp_listar_citas()").Scan(&citas).Error
	return citas, err
}

func (s *DatabaseService) BuscarCitaPorID(citID uint) (*models.Cita, error) {
	var cita models.Cita
	err := s.DB.Raw("CALL sp_buscar_cita_por_id(?)", citID).Scan(&cita).Error
	if err != nil {
		return nil, err
	}
	return &cita, nil
}

func (s *DatabaseService) ActualizarCita(citID uint, fecha string, hora string, empID, serID, cliID uint) error {
	return s.DB.Exec("CALL sp_actualizar_cita(?, ?, ?, ?, ?, ?)",
		citID, fecha, hora, empID, serID, cliID).Error
}

func (s *DatabaseService) EliminarCita(citID uint) error {
	return s.DB.Exec("CALL sp_eliminar_cita(?)", citID).Error
}

// ============= SERVICE PROCEDURES =============

func (s *DatabaseService) InsertarServicio(nombre, descripcion, categoria string, precioUnitario float64, duracionEstimada int) error {
	return s.DB.Exec("CALL sp_insertar_servicio(?, ?, ?, ?, ?)",
		nombre, descripcion, categoria, precioUnitario, duracionEstimada).Error
}

func (s *DatabaseService) ListarServicios() ([]models.Service, error) {
	var servicios []models.Service
	err := s.DB.Raw("CALL sp_listar_servicios()").Scan(&servicios).Error
	return servicios, err
}

func (s *DatabaseService) BuscarServicioPorID(serID uint) (*models.Service, error) {
	var servicio models.Service
	err := s.DB.Raw("CALL sp_buscar_servicio_por_id(?)", serID).Scan(&servicio).Error
	if err != nil {
		return nil, err
	}
	return &servicio, nil
}

func (s *DatabaseService) ActualizarServicio(serID uint, nombre, descripcion, categoria string, precioUnitario float64, duracionEstimada int) error {
	return s.DB.Exec("CALL sp_actualizar_servicio(?, ?, ?, ?, ?, ?)",
		serID, nombre, descripcion, categoria, precioUnitario, duracionEstimada).Error
}

func (s *DatabaseService) EliminarServicio(serID uint) error {
	return s.DB.Exec("CALL sp_eliminar_servicio(?)", serID).Error
}

// ============= INVOICE PROCEDURES =============

func (s *DatabaseService) InsertarFactura(total float64, fecha string, hora string, cliID uint) error {
	return s.DB.Exec("CALL sp_insertar_factura(?, ?, ?, ?)",
		total, fecha, hora, cliID).Error
}

func (s *DatabaseService) InsertarFacturaSinTotal(fecha string, hora string, cliID uint) error {
	return s.DB.Exec("CALL sp_insertar_factura_sin_total(?, ?, ?)",
		fecha, hora, cliID).Error
}

func (s *DatabaseService) ObtenerUltimaFactura() (*models.FacturaServicio, error) {
	var factura models.FacturaServicio
	err := s.DB.Raw("CALL sp_obtener_ultima_factura()").Scan(&factura).Error
	if err != nil {
		return nil, err
	}
	return &factura, nil
}

func (s *DatabaseService) RecalcularTotalFactura(facID uint) error {
	return s.DB.Exec(`
		UPDATE FACTURA_SERVICIO f
		SET fac_total = (
			SELECT COALESCE(SUM(s.ser_precio_unitario), 0)
			FROM DETALLE_FACTURA_SERVICIO dfs
			JOIN SERVICIO s ON dfs.ser_id = s.ser_id
			WHERE dfs.fac_id = ?
		)
		WHERE fac_id = ?
	`, facID, facID).Error
}

func (s *DatabaseService) ListarFacturas() ([]models.FacturaServicio, error) {
	var facturas []models.FacturaServicio
	err := s.DB.Raw("CALL sp_listar_facturas()").Scan(&facturas).Error
	return facturas, err
}

func (s *DatabaseService) BuscarFacturaPorID(facID uint) (*models.FacturaServicio, error) {
	var factura models.FacturaServicio
	err := s.DB.Raw("CALL sp_buscar_factura_por_id(?)", facID).Scan(&factura).Error
	if err != nil {
		return nil, err
	}
	return &factura, nil
}

func (s *DatabaseService) ActualizarFactura(facID uint, total float64, fecha string, hora string, cliID uint) error {
	return s.DB.Exec("CALL sp_actualizar_factura(?, ?, ?, ?, ?)",
		facID, total, fecha, hora, cliID).Error
}

func (s *DatabaseService) EliminarFactura(facID uint) error {
	return s.DB.Exec("CALL sp_eliminar_factura(?)", facID).Error
}

// ============= INVOICE DETAIL PROCEDURES =============

func (s *DatabaseService) InsertarDetalleFactura(facID, serID uint) error {
	return s.DB.Exec("CALL sp_insertar_detalle_factura(?, ?)",
		facID, serID).Error
}

func (s *DatabaseService) ListarDetallesFactura() ([]models.DetalleFacturaServicio, error) {
	var detalles []models.DetalleFacturaServicio
	err := s.DB.Raw("CALL sp_listar_detalles_factura()").Scan(&detalles).Error
	return detalles, err
}

func (s *DatabaseService) BuscarDetallePorFactura(facID uint) ([]models.DetalleFacturaServicio, error) {
	var detalles []models.DetalleFacturaServicio
	err := s.DB.Raw("CALL sp_buscar_detalle_por_factura(?)", facID).Scan(&detalles).Error
	return detalles, err
}

func (s *DatabaseService) ActualizarDetalleFactura(facID, serID uint) error {
	return s.DB.Exec("CALL sp_actualizar_detalle_factura(?, ?)",
		facID, serID).Error
}

func (s *DatabaseService) EliminarDetalleFactura(facID uint) error {
	return s.DB.Exec("CALL sp_eliminar_detalle_factura(?)", facID).Error
}

// ============= PURCHASE PROCEDURES =============

func (s *DatabaseService) InsertarCompra(fecha string, total float64, metodoPago string, provID, gasID uint) error {
	return s.DB.Exec("CALL sp_insertar_compra(?, ?, ?, ?, ?)",
		fecha, total, metodoPago, provID, gasID).Error
}

func (s *DatabaseService) BuscarCompraPorID(comID uint) (*models.PurchaseWithDetails, error) {
	var compra models.PurchaseWithDetails
	err := s.DB.Raw("CALL sp_buscar_compra_por_id(?)", comID).Scan(&compra).Error
	if err != nil {
		return nil, err
	}
	return &compra, nil
}

func (s *DatabaseService) ObtenerUltimaCompra() (*models.Purchase, error) {
	var compra models.Purchase
	err := s.DB.Raw("CALL sp_obtener_ultima_compra()").Scan(&compra).Error
	if err != nil {
		return nil, err
	}
	return &compra, nil
}

func (s *DatabaseService) ActualizarCompra(comID uint, fecha string, total float64, metodoPago string, provID, gasID uint) error {
	return s.DB.Exec("CALL sp_actualizar_compra(?, ?, ?, ?, ?, ?)",
		comID, fecha, total, metodoPago, provID, gasID).Error
}

func (s *DatabaseService) EliminarCompra(comID uint) error {
	return s.DB.Exec("CALL sp_eliminar_compra(?)", comID).Error
}

func (s *DatabaseService) ListarCompras() ([]models.PurchaseWithDetails, error) {
	var compras []models.PurchaseWithDetails
	err := s.DB.Raw("CALL sp_listar_compras()").Scan(&compras).Error
	return compras, err
}

// ============= PURCHASE DETAIL PROCEDURES =============

func (s *DatabaseService) InsertarDetalleCompra(comID, prodID uint, cantidad int, precioUnitario float64) error {
	return s.DB.Exec("CALL sp_insertar_detalle_compra(?, ?, ?, ?)",
		comID, prodID, cantidad, precioUnitario).Error
}

func (s *DatabaseService) ActualizarDetalleCompra(comID, prodID uint, cantidad int, precioUnitario float64) error {
	return s.DB.Exec("CALL sp_actualizar_detalle_compra(?, ?, ?, ?)",
		comID, prodID, cantidad, precioUnitario).Error
}

func (s *DatabaseService) EliminarDetalleCompra(comID, prodID uint) error {
	return s.DB.Exec("CALL sp_eliminar_detalle_compra(?, ?)",
		comID, prodID).Error
}

func (s *DatabaseService) ListarDetallesCompra(comID uint) ([]models.DetalleCompra, error) {
	var detalles []models.DetalleCompra
	err := s.DB.Raw("CALL sp_listar_detalles_compra(?)", comID).Scan(&detalles).Error
	return detalles, err
}

// ============= EXPENSE PROCEDURES (GASTO_MENSUAL) =============

func (s *DatabaseService) InsertarGasto(descripcion string, fecha string, monto float64, tipo string) error {
	return s.DB.Exec("CALL sp_insertar_gasto(?, ?, ?, ?)",
		descripcion, fecha, monto, tipo).Error
}

func (s *DatabaseService) ListarGastos() ([]models.GastoMensual, error) {
	var gastos []models.GastoMensual
	err := s.DB.Raw("CALL sp_listar_gastos()").Scan(&gastos).Error
	return gastos, err
}

func (s *DatabaseService) BuscarGastoPorID(gasID uint) (*models.GastoMensual, error) {
	var gasto models.GastoMensual
	err := s.DB.Raw("CALL sp_buscar_gasto_por_id(?)", gasID).Scan(&gasto).Error
	if err != nil {
		return nil, err
	}
	return &gasto, nil
}

func (s *DatabaseService) ActualizarGasto(gasID uint, descripcion string, fecha string, monto float64, tipo string) error {
	return s.DB.Exec("CALL sp_actualizar_gasto(?, ?, ?, ?, ?)",
		gasID, descripcion, fecha, monto, tipo).Error
}

func (s *DatabaseService) EliminarGasto(gasID uint) error {
	return s.DB.Exec("CALL sp_eliminar_gasto(?)", gasID).Error
}
