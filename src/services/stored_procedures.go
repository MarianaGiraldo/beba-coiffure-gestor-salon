package services

import (
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
	return s.DB.Exec("CALL sp_insert_empleado(?, ?, ?, ?, ?, ?)",
		emp.EmpNombre, emp.EmpApellido, emp.EmpTelefono,
		emp.EmpCorreo, emp.EmpPuesto, emp.EmpSalario).Error
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
	return s.DB.Exec("CALL sp_insert_cliente(?, ?, ?, ?)",
		cli.CliNombre, cli.CliApellido, cli.CliTelefono, cli.CliCorreo).Error
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

	// Get total products
	totalProd, err := s.GetTotalProductos()
	if err != nil {
		metrics["total_productos"] = 0
	} else {
		metrics["total_productos"] = totalProd.TotalProductos
	}

	// Get inventory value
	valorInv, err := s.GetValorInventario()
	if err != nil {
		metrics["valor_inventario"] = 0.0
	} else {
		metrics["valor_inventario"] = valorInv.ValorTotal
	}

	// Get total services
	totalServ, err := s.GetServiciosTotales()
	if err != nil {
		metrics["servicios_totales"] = 0
	} else {
		metrics["servicios_totales"] = totalServ.TotalServicios
	}

	// Get average service price
	precioPromedio, err := s.GetPrecioPromedioServicios()
	if err != nil {
		metrics["precio_promedio_servicios"] = 0.0
	} else {
		metrics["precio_promedio_servicios"] = precioPromedio.PrecioPromedio
	}

	// Get premium service
	servPremium, err := s.GetServicioPremium()
	if err != nil {
		metrics["servicio_premium"] = nil
	} else {
		metrics["servicio_premium"] = servPremium
	}

	// Get total suppliers
	totalProv, err := s.GetTotalProveedores()
	if err != nil {
		metrics["total_proveedores"] = 0
	} else {
		metrics["total_proveedores"] = totalProv.TotalProveedores
	}

	return metrics, nil
}

// ============= CUSTOM QUERIES FOR FRONTEND COMPATIBILITY =============

// GetInventoryWithProducts returns inventory with product details using joins
func (s *DatabaseService) GetInventoryWithProducts() ([]models.Inventory, error) {
	var inventories []models.Inventory
	err := s.DB.Preload("Product").Find(&inventories).Error
	return inventories, err
}

// Custom method for suppliers with additional frontend fields
func (s *DatabaseService) GetSuppliers() ([]map[string]interface{}, error) {
	var suppliers []models.Supplier
	err := s.DB.Find(&suppliers).Error
	if err != nil {
		return nil, err
	}

	// Convert to frontend format
	result := make([]map[string]interface{}, len(suppliers))
	for i, supplier := range suppliers {
		result[i] = map[string]interface{}{
			"prov_id":        supplier.ProvID,
			"prov_nombre":    supplier.ProvNombre,
			"prov_telefono":  supplier.ProvTelefono,
			"prov_correo":    supplier.ProvCorreo,
			"prov_direccion": supplier.ProvDireccion,
			"categoria":      "General", // Default category
			"estado":         "Activo",  // Default status
		}
	}
	return result, nil
}

// Add supplier using direct GORM (since no stored procedure exists for suppliers)
func (s *DatabaseService) AddSupplier(supplier models.Supplier) error {
	return s.DB.Create(&supplier).Error
}

func (s *DatabaseService) UpdateSupplier(supplier models.Supplier) error {
	return s.DB.Save(&supplier).Error
}

func (s *DatabaseService) DeleteSupplier(id uint) error {
	return s.DB.Delete(&models.Supplier{}, id).Error
}
