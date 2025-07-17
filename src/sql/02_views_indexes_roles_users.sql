-- Creación de vistas (paneles de métricas)
CREATE VIEW vw_empleados_activos AS
  SELECT COUNT(*) AS total_activos
  FROM EMPLEADO;

CREATE VIEW vw_citas_hoy AS
  SELECT COUNT(*) AS total_hoy
  FROM CITA
  WHERE cit_fecha = CURDATE();

CREATE VIEW vw_ingresos_mensuales AS
  SELECT COALESCE(SUM(fac_total),0) AS ingresos_mes
  FROM FACTURA_SERVICIO
  WHERE MONTH(fac_fecha) = MONTH(CURDATE())
    AND YEAR(fac_fecha) = YEAR(CURDATE());

CREATE VIEW vw_productos_bajos AS
  SELECT COUNT(*) AS productos_bajos
  FROM INVENTARIO
  WHERE inv_cantidad_actual < 5;

CREATE VIEW vw_total_productos AS
  SELECT COUNT(*) AS total_productos
  FROM PRODUCTO;

CREATE VIEW vw_valor_inventario AS
  SELECT COALESCE(SUM(prod.prod_precio_unitario * inv.inv_cantidad_actual),0) AS valor_total
  FROM INVENTARIO inv
  JOIN PRODUCTO prod ON inv.prod_id = prod.prod_id;

CREATE VIEW vw_servicios_totales AS
  SELECT COUNT(*) AS total_servicios
  FROM SERVICIO;

CREATE VIEW vw_precio_promedio_servicios AS
  SELECT ROUND(AVG(ser_precio_unitario),2) AS precio_promedio
  FROM SERVICIO;

CREATE VIEW vw_servicio_premium AS
  SELECT ser_id, ser_nombre, ser_precio_unitario
  FROM SERVICIO
  ORDER BY ser_precio_unitario DESC
  LIMIT 1;

CREATE VIEW vw_total_proveedores AS
  SELECT COUNT(*) AS total_proveedores
  FROM PROVEEDOR;

-- Creación de índices para optimizar las vistas
CREATE INDEX idx_cita_fecha ON CITA (cit_fecha);
CREATE INDEX idx_factura_fecha ON FACTURA_SERVICIO (fac_fecha);
CREATE INDEX idx_gasto_fecha ON GASTO_MENSUAL (gas_fecha);
CREATE INDEX idx_inv_cantidad ON INVENTARIO (inv_cantidad_actual);
CREATE INDEX idx_prod_precio ON PRODUCTO (prod_precio_unitario);

-- Creación de usuarios y asignación de permisos
CREATE ROLE IF NOT EXISTS 'rol_admin';
CREATE ROLE IF NOT EXISTS 'rol_empleado';
CREATE ROLE IF NOT EXISTS 'rol_cliente';



GRANT ALL PRIVILEGES ON salondb.* TO 'rol_admin';

GRANT SELECT, INSERT, UPDATE ON salondb.CITA TO 'rol_empleado';
GRANT SELECT, INSERT ON salondb.FACTURA_SERVICIO TO 'rol_empleado';
GRANT SELECT ON salondb.vw_citas_hoy TO 'rol_empleado';
GRANT SELECT ON salondb.vw_servicios_totales TO 'rol_empleado';
GRANT SELECT ON salondb.vw_precio_promedio_servicios TO 'rol_empleado';

GRANT SELECT, INSERT ON salondb.CITA TO 'rol_cliente';
GRANT SELECT ON salondb.vw_citas_hoy TO 'rol_cliente';
GRANT SELECT ON salondb.vw_servicios_totales TO 'rol_cliente';


CREATE USER IF NOT EXISTS 'admin01'@'localhost' IDENTIFIED BY 'admin123';
GRANT 'rol_admin' TO 'admin01'@'localhost';
SET DEFAULT ROLE 'rol_admin' TO 'admin01'@'localhost';

CREATE USER IF NOT EXISTS 'empleado01'@'localhost' IDENTIFIED BY 'empPass456';
GRANT 'rol_empleado' TO 'empleado01'@'localhost';
SET DEFAULT ROLE 'rol_empleado' TO 'empleado01'@'localhost';

CREATE USER IF NOT EXISTS 'cliente01'@'localhost' IDENTIFIED BY 'cliPass789';
GRANT 'rol_cliente' TO 'cliente01'@'localhost';
SET DEFAULT ROLE 'rol_cliente' TO 'cliente01'@'localhost';

-- Log views and permissions completion
INSERT INTO salondb.db_initialization_log (script_name, status) 
VALUES ('02_views_indexes_roles_users.sql', 'SUCCESS');
