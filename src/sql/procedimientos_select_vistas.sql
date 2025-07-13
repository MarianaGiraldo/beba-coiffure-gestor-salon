-- PROCEDIMIENTOS PARA CONSULTAS SELECT SOBRE VISTAS

DELIMITER //

CREATE PROCEDURE sp_get_empleados_activos()
BEGIN
  SELECT * FROM vw_empleados_activos;
END;
//

CREATE PROCEDURE sp_get_citas_hoy()
BEGIN
  SELECT * FROM vw_citas_hoy;
END;
//

CREATE PROCEDURE sp_get_ingresos_mensuales()
BEGIN
  SELECT * FROM vw_ingresos_mensuales;
END;
//

CREATE PROCEDURE sp_get_productos_bajos()
BEGIN
  SELECT * FROM vw_productos_bajos;
END;
//

CREATE PROCEDURE sp_get_total_productos()
BEGIN
  SELECT * FROM vw_total_productos;
END;
//

CREATE PROCEDURE sp_get_valor_inventario()
BEGIN
  SELECT * FROM vw_valor_inventario;
END;
//

CREATE PROCEDURE sp_get_servicios_totales()
BEGIN
  SELECT * FROM vw_servicios_totales;
END;
//

CREATE PROCEDURE sp_get_precio_promedio_servicios()
BEGIN
  SELECT * FROM vw_precio_promedio_servicios;
END;
//

CREATE PROCEDURE sp_get_servicio_premium()
BEGIN
  SELECT * FROM vw_servicio_premium;
END;
//

CREATE PROCEDURE sp_get_total_proveedores()
BEGIN
  SELECT * FROM vw_total_proveedores;
END;
//

DELIMITER ;
