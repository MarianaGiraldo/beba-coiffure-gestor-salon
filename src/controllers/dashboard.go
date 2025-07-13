package controllers

import (
	"net/http"
	"salon/services"

	"github.com/gin-gonic/gin"
)

type DashboardController struct {
	dbService *services.DatabaseService
}

func NewDashboardController(dbService *services.DatabaseService) *DashboardController {
	return &DashboardController{dbService: dbService}
}

// GetDashboardMetrics handles GET /dashboard/metrics - uses views through stored procedures
func (dc *DashboardController) GetDashboardMetrics(c *gin.Context) {
	metrics, err := dc.dbService.GetDashboardMetrics()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to retrieve dashboard metrics",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    metrics,
	})
}

// GetEmployeesMetrics handles GET /dashboard/employees - uses views
func (dc *DashboardController) GetEmployeesMetrics(c *gin.Context) {
	empleadosActivos, err := dc.dbService.GetEmpleadosActivos()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to retrieve employee metrics",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    empleadosActivos,
	})
}

// GetAppointmentsMetrics handles GET /dashboard/appointments - uses views
func (dc *DashboardController) GetAppointmentsMetrics(c *gin.Context) {
	citasHoy, err := dc.dbService.GetCitasHoy()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to retrieve appointment metrics",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    citasHoy,
	})
}

// GetFinancialMetrics handles GET /dashboard/financial - uses views
func (dc *DashboardController) GetFinancialMetrics(c *gin.Context) {
	ingresos, err := dc.dbService.GetIngresosMensuales()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to retrieve financial metrics",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    ingresos,
	})
}

// GetInventoryMetrics handles GET /dashboard/inventory - uses views
func (dc *DashboardController) GetInventoryMetrics(c *gin.Context) {
	metrics := make(map[string]interface{})

	// Get low stock products
	prodBajos, err := dc.dbService.GetProductosBajos()
	if err != nil {
		metrics["productos_bajos"] = 0
	} else {
		metrics["productos_bajos"] = prodBajos.ProductosBajos
	}

	// Get total products
	totalProd, err := dc.dbService.GetTotalProductos()
	if err != nil {
		metrics["total_productos"] = 0
	} else {
		metrics["total_productos"] = totalProd.TotalProductos
	}

	// Get inventory value
	valorInv, err := dc.dbService.GetValorInventario()
	if err != nil {
		metrics["valor_inventario"] = 0.0
	} else {
		metrics["valor_inventario"] = valorInv.ValorTotal
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    metrics,
	})
}

// GetServicesMetrics handles GET /dashboard/services - uses views
func (dc *DashboardController) GetServicesMetrics(c *gin.Context) {
	metrics := make(map[string]interface{})

	// Get total services
	totalServ, err := dc.dbService.GetServiciosTotales()
	if err != nil {
		metrics["servicios_totales"] = 0
	} else {
		metrics["servicios_totales"] = totalServ.TotalServicios
	}

	// Get average service price
	precioPromedio, err := dc.dbService.GetPrecioPromedioServicios()
	if err != nil {
		metrics["precio_promedio_servicios"] = 0.0
	} else {
		metrics["precio_promedio_servicios"] = precioPromedio.PrecioPromedio
	}

	// Get premium service
	servPremium, err := dc.dbService.GetServicioPremium()
	if err != nil {
		metrics["servicio_premium"] = nil
	} else {
		metrics["servicio_premium"] = servPremium
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    metrics,
	})
}

// GetSuppliersMetrics handles GET /dashboard/suppliers - uses views
func (dc *DashboardController) GetSuppliersMetrics(c *gin.Context) {
	totalProv, err := dc.dbService.GetTotalProveedores()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to retrieve supplier metrics",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    totalProv,
	})
}
