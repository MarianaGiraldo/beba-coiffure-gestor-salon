
-- Creación de usuarios y asignación de permisos
CREATE ROLE IF NOT EXISTS 'rol_admin';
CREATE ROLE IF NOT EXISTS 'rol_empleado';
CREATE ROLE IF NOT EXISTS 'rol_cliente';


-- Permisos Admin
GRANT ALL PRIVILEGES ON salondb.* TO 'rol_admin';
GRANT CREATE USER ON *.* TO 'rol_admin';
GRANT EXECUTE ON salondb.* TO 'rol_admin';
GRANT 'rol_cliente'@'%' TO 'rol_admin'@'%' WITH ADMIN OPTION;
GRANT 'rol_empleado'@'%' TO 'rol_admin'@'%' WITH ADMIN OPTION;

-- Permisos Empleado
GRANT SELECT, INSERT, UPDATE ON salondb.CITA TO 'rol_empleado';
GRANT SELECT, INSERT ON salondb.FACTURA_SERVICIO TO 'rol_empleado';
GRANT SELECT ON salondb.vw_citas_hoy TO 'rol_empleado';
GRANT SELECT ON salondb.vw_servicios_totales TO 'rol_empleado';
GRANT SELECT ON salondb.vw_precio_promedio_servicios TO 'rol_empleado';
GRANT SELECT ON salondb.EMPLEADO TO 'rol_empleado';
GRANT SELECT ON salondb.CITA TO 'rol_empleado';
GRANT SELECT ON salondb.SERVICIO TO 'rol_empleado';
GRANT SELECT ON salondb.HISTORIAL_CITA TO 'rol_empleado';
GRANT SELECT ON salondb.USUARIO_SISTEMA TO 'rol_empleado';
GRANT UPDATE ON salondb.EMPLEADO TO 'rol_empleado';
GRANT UPDATE ON salondb.USUARIO_SISTEMA TO 'rol_empleado';
GRANT EXECUTE ON PROCEDURE salondb.sp_update_empleado TO 'rol_empleado';
GRANT EXECUTE ON PROCEDURE salondb.sp_update_usuario TO 'rol_empleado';
GRANT EXECUTE ON PROCEDURE salondb.sp_ver_citas_empleado TO 'rol_empleado';
GRANT EXECUTE ON PROCEDURE salondb.sp_ver_historial_empleado TO 'rol_empleado';


-- Permisos Cliente
GRANT SELECT, INSERT ON salondb.CITA TO 'rol_cliente';
GRANT SELECT ON salondb.vw_citas_hoy TO 'rol_cliente';
GRANT SELECT ON salondb.vw_servicios_totales TO 'rol_cliente';
GRANT SELECT ON salondb.CLIENTE TO 'rol_cliente';
GRANT SELECT ON salondb.CITA TO 'rol_cliente';
GRANT SELECT ON salondb.SERVICIO TO 'rol_cliente';
GRANT SELECT ON salondb.PROMOCION TO 'rol_cliente';
GRANT SELECT ON salondb.FACTURA_SERVICIO TO 'rol_cliente';
GRANT SELECT ON salondb.DETALLE_FACTURA_SERVICIO TO 'rol_cliente';
GRANT SELECT ON salondb.HISTORIAL_CITA TO 'rol_cliente';
GRANT SELECT ON salondb.USUARIO_SISTEMA TO 'rol_cliente';
GRANT UPDATE ON salondb.CLIENTE TO 'rol_cliente';
GRANT UPDATE ON salondb.USUARIO_SISTEMA TO 'rol_cliente';
GRANT EXECUTE ON PROCEDURE salondb.sp_update_cliente TO 'rol_cliente';
GRANT EXECUTE ON PROCEDURE salondb.sp_update_usuario TO 'rol_cliente';

CREATE USER IF NOT EXISTS 'salon_user'@'%' IDENTIFIED BY 'salon_password_456';
GRANT 'rol_admin'@'%' TO 'salon_user'@'%';
SET DEFAULT ROLE 'rol_admin' TO 'salon_user'@'%';


-- CREATE USER IF NOT EXISTS 'admin01'@'%' IDENTIFIED BY 'admin123';
-- GRANT 'rol_admin'@'%' TO 'admin01'@'%';
-- SET DEFAULT ROLE 'rol_admin'@'%' TO 'admin01'@'%';

-- CREATE USER IF NOT EXISTS 'empleado01'@'%' IDENTIFIED BY 'empPass456';
-- GRANT 'rol_empleado'@'%' TO 'empleado01'@'%';
-- SET DEFAULT ROLE 'rol_empleado'@'%' TO 'empleado01'@'%';

-- CREATE USER IF NOT EXISTS 'cliente01'@'%' IDENTIFIED BY 'cliPass789';
-- GRANT 'rol_cliente'@'%' TO 'cliente01'@'%';
-- SET DEFAULT ROLE 'rol_cliente'@'%' TO 'cliente01'@'%';



-- Log table creation completion
INSERT IGNORE INTO salondb.db_initialization_log (script_name, status) 
VALUES ('07_roles_permissions.sql', 'SUCCESS');
