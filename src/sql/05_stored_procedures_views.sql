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

-- Insertar COMPRA_PRODUCTO
  
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE sp_insertar_compra (
    IN p_fecha DATE,
    IN p_total DECIMAL(10,2),
    IN p_metodo_pago VARCHAR(50),
    IN p_prov_id INT,
    IN p_gas_id INT
)
BEGIN
    INSERT INTO COMPRA_PRODUCTO (
        cop_fecha_compra, cop_total_compra, cop_metodo_pago, prov_id, gas_id
    )
    VALUES (p_fecha, p_total, p_metodo_pago, p_prov_id, p_gas_id);
END$$
DELIMITER ;

-- SELECT a COMPRA con PRODUCTOS
DELIMITER $$
CREATE PROCEDURE sp_listar_compras()
BEGIN
    SELECT
        cp.cop_fecha_compra,
        p.prov_nombre AS proveedor,
        GROUP_CONCAT(pr.prod_nombre SEPARATOR ', ') AS productos,
        cp.cop_total_compra,
        cp.cop_metodo_pago
    FROM COMPRA_PRODUCTO cp
    INNER JOIN PROVEEDOR p ON cp.prov_id = p.prov_id
    LEFT JOIN DETALLE_COMPRA dc ON cp.com_id = dc.com_id
    LEFT JOIN PRODUCTO pr ON dc.prod_id = pr.prod_id
    GROUP BY cp.com_id;
END$$
DELIMITER ;


-- Insertar DETALLE_COMPRA
DELIMITER $$
CREATE PROCEDURE sp_insertar_detalle_compra (
    IN p_com_id INT,
    IN p_prod_id INT,
    IN p_cantidad INT,
    IN p_precio_unitario DECIMAL(10,2)
)
BEGIN
    INSERT INTO DETALLE_COMPRA (com_id, prod_id, dec_cantidad, dec_precio_unitario)
    VALUES (p_com_id, p_prod_id, p_cantidad, p_precio_unitario);
    
    UPDATE COMPRA_PRODUCTO 
    SET cop_total_compra = cop_total_compra+(p_precio_unitario*dec_cantidad)
    WHERE com_id=p_com_id;
END$$
DELIMITER ;


-- Actualizar DETALLE_COMPRA
DELIMITER $$
CREATE PROCEDURE sp_actualizar_detalle_compra (
    IN p_com_id INT,
    IN p_prod_id INT,
    IN p_cantidad INT,
    IN p_precio_unitario DECIMAL(10,2)
)
BEGIN
    UPDATE DETALLE_COMPRA
    SET dec_cantidad = p_cantidad,
        dec_precio_unitario = p_precio_unitario
    WHERE com_id = p_com_id AND prod_id = p_prod_id;
    
    UPDATE COMPRA_PRODUCTO 
    SET cop_total_compra = cop_total_compra-(old.dec_precio_unitario*old.dec_cantidad)+(p_cantidad*p_precio_unitario)
    WHERE com_id=p_com_id;
END$$
DELIMITER ;
-- Log view stored procedures completion
INSERT IGNORE INTO salondb.db_initialization_log (script_name, status) 
VALUES ('05_stored_procedures_views.sql', 'SUCCESS');
