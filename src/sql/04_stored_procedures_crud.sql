-- PROCEDIMIENTOS ALMACENADOS CRUD PARA TABLAS

-- EMPLEADO
DELIMITER //


-- Insertar Empleado
CREATE PROCEDURE sp_insert_empleado(
  IN p_nombre VARCHAR(50), IN p_apellido VARCHAR(50), IN p_telefono VARCHAR(20),
  IN p_correo VARCHAR(100), IN p_puesto VARCHAR(50), IN p_salario DECIMAL(10,2), IN p_contrasena VARCHAR(100)
)
BEGIN
  DECLARE emp_id_new INT;
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  -- Insert into EMPLEADO table
  INSERT INTO EMPLEADO(emp_nombre, emp_apellido, emp_telefono, emp_correo, emp_puesto, emp_salario)
  VALUES (p_nombre, p_apellido, p_telefono, p_correo, p_puesto, p_salario);

  -- Get the ID of the newly inserted employee
  SET emp_id_new = LAST_INSERT_ID();

  -- Insert into USUARIO_SISTEMA table
  INSERT INTO USUARIO_SISTEMA (
    usu_nombre_usuario,
    usu_contrasena,
    usu_rol,
    emp_id,
    cli_id
  )
  VALUES (
    CONCAT(LOWER(p_correo)),
    p_contrasena,
    'empleado',
    emp_id_new,
    NULL
  );

END;
//


-- Select empleado
CREATE PROCEDURE sp_get_empleados()
BEGIN
  SELECT * FROM EMPLEADO;
END;
//


-- Update Empleado
CREATE PROCEDURE sp_update_empleado(
  IN p_id INT, IN p_nombre VARCHAR(50), IN p_apellido VARCHAR(50), IN p_telefono VARCHAR(20),
  IN p_correo VARCHAR(100), IN p_puesto VARCHAR(50), IN p_salario DECIMAL(10,2)
)
BEGIN
  UPDATE EMPLEADO
  SET emp_nombre = p_nombre, emp_apellido = p_apellido, emp_telefono = p_telefono,
      emp_correo = p_correo, emp_puesto = p_puesto, emp_salario = p_salario
  WHERE emp_id = p_id;
END;
//

-- Borrar empleado
CREATE PROCEDURE sp_delete_empleado(IN p_id INT)
BEGIN
  DELETE FROM EMPLEADO WHERE emp_id = p_id;
END;
//

-- CLIENTE

-- Insertar Cliente
CREATE PROCEDURE sp_insert_cliente(
  IN p_nombre VARCHAR(50), IN p_apellido VARCHAR(50), IN p_telefono VARCHAR(20), IN p_correo VARCHAR(100), IN p_contrasena VARCHAR(100)
)
BEGIN
  DECLARE cli_id_new INT;
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  -- Insert into CLIENTE table
  INSERT INTO CLIENTE(cli_nombre, cli_apellido, cli_telefono, cli_correo)
  VALUES (p_nombre, p_apellido, p_telefono, p_correo);

  -- Get the ID of the newly inserted client
  SET cli_id_new = LAST_INSERT_ID();

  -- Insert into USUARIO_SISTEMA table
  INSERT INTO USUARIO_SISTEMA (
    usu_nombre_usuario,
    usu_contrasena,
    usu_rol,
    emp_id,
    cli_id
  )
  VALUES (
    CONCAT(LOWER(p_correo)),
    p_contrasena,
    'cliente',
    NULL,
    cli_id_new
  );

  COMMIT;
END;
//


-- Select Cliente
CREATE PROCEDURE sp_get_clientes()
BEGIN
  SELECT * FROM CLIENTE;
END;
//

-- Actualizar Cliente
CREATE PROCEDURE sp_update_cliente(
  IN p_id INT, IN p_nombre VARCHAR(50), IN p_apellido VARCHAR(50), IN p_telefono VARCHAR(20), IN p_correo VARCHAR(100)
)
BEGIN
  UPDATE CLIENTE
  SET cli_nombre = p_nombre, cli_apellido = p_apellido, cli_telefono = p_telefono, cli_correo = p_correo
  WHERE cli_id = p_id;
END;
//

-- Borrar Cliente
CREATE PROCEDURE sp_delete_cliente(IN p_id INT)
BEGIN
  DELETE FROM CLIENTE WHERE cli_id = p_id;
END;
//

-- PRODUCTO

-- Insertar Producto
CREATE PROCEDURE sp_insert_producto(
  IN p_nombre VARCHAR(100), IN p_descripcion TEXT, IN p_cantidad TINYINT, IN p_precio DECIMAL(10,2)
)
BEGIN
  INSERT INTO PRODUCTO(prod_nombre, prod_descripcion, prod_cantidad_disponible, prod_precio_unitario)
  VALUES (p_nombre, p_descripcion, p_cantidad, p_precio);

  SET @last_id = LAST_INSERT_ID();
  
  INSERT INTO INVENTARIO(inv_fecha_actualizacion, prod_id, inv_cantidad_actual, inv_observaciones)
  VALUES (CURDATE(), @last_id, p_cantidad, NULL);
END;
//


-- Select Producto
CREATE PROCEDURE sp_get_productos()
BEGIN
  SELECT * FROM PRODUCTO;
END;
//

-- Actualizar Producto
CREATE PROCEDURE sp_update_producto(
  IN p_id INT, IN p_nombre VARCHAR(100), IN p_descripcion TEXT, IN p_cantidad TINYINT, IN p_precio DECIMAL(10,2)
)
BEGIN
  UPDATE INVENTARIO
  SET inv_cantidad_actual = p_cantidad WHERE p_id=prod_id;
  
  UPDATE PRODUCTO
  SET prod_nombre = p_nombre, prod_descripcion = p_descripcion, prod_cantidad_disponible = p_cantidad,
      prod_precio_unitario = p_precio
  WHERE prod_id = p_id;
END;
//


-- Borrar Producto
CREATE PROCEDURE sp_delete_producto(IN p_id INT)
BEGIN
  DELETE FROM PRODUCTO WHERE prod_id = p_id;
END;
//

DELIMITER ;

-- Buscar cliente por ID:

DELIMITER //

CREATE PROCEDURE BuscarClientePorID(IN p_cli_id INT)
BEGIN
  SELECT * 
  FROM CLIENTE 
  WHERE cli_id = p_cli_id;
END;
//
DELIMITER ;

-- Buscar empleado por ID:

DELIMITER //

CREATE PROCEDURE BuscarEmpleadoPorID(IN p_emp_id INT)
BEGIN
  SELECT * 
  FROM EMPLEADO 
  WHERE emp_id = p_emp_id;
END;
//

DELIMITER ;

-- Buscar usuario
DELIMITER //

CREATE PROCEDURE BuscarUsuario(IN p_usuario VARCHAR(100))
BEGIN
  SELECT * 
  FROM USUARIO_SISTEMA
  WHERE usu_nombre_usuario = p_usuario;
END;
//

DELIMITER ;

DELIMITER //

CREATE PROCEDURE CrearUsuarioConRol(
  IN p_usuario VARCHAR(50),
  IN p_contrasena VARCHAR(100),
  IN p_rol VARCHAR(20)
)
BEGIN
  DECLARE query_crear_usuario TEXT;
  DECLARE query_grant_rol TEXT;
  DECLARE query_set_default TEXT;

  SET @query_crear_usuario = CONCAT(
    'CREATE USER IF NOT EXISTS \'', p_usuario, '\'@\'localhost\' IDENTIFIED BY \'', p_contrasena, '\';'
  );
  PREPARE stmt1 FROM @query_crear_usuario;
  EXECUTE stmt1;
  DEALLOCATE PREPARE stmt1;

  IF p_rol = 'admin' THEN
    SET @query_grant_rol = CONCAT('GRANT rol_admin TO \'', p_usuario, '\'@\'localhost\';');
    SET @query_set_default = CONCAT('SET DEFAULT ROLE rol_admin TO \'', p_usuario, '\'@\'localhost\';');

  ELSEIF p_rol = 'empleado' THEN
    SET @query_grant_rol = CONCAT('GRANT rol_empleado TO \'', p_usuario, '\'@\'localhost\';');
    SET @query_set_default = CONCAT('SET DEFAULT ROLE rol_empleado TO \'', p_usuario, '\'@\'localhost\';');

  ELSEIF p_rol = 'cliente' THEN
    SET @query_grant_rol = CONCAT('GRANT rol_cliente TO \'', p_usuario, '\'@\'localhost\';');
    SET @query_set_default = CONCAT('SET DEFAULT ROLE rol_cliente TO \'', p_usuario, '\'@\'localhost\';');
  ELSE
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Rol no válido. Use: admin, empleado o cliente.';
  END IF;

  PREPARE stmt2 FROM @query_grant_rol;
  EXECUTE stmt2;
  DEALLOCATE PREPARE stmt2;

  PREPARE stmt3 FROM @query_set_default;
  EXECUTE stmt3;
  DEALLOCATE PREPARE stmt3;
END;
//

DELIMITER ;

-- Select datos con usuario y rol

DELIMITER //

CREATE PROCEDURE ObtenerDatosUsuario(
  IN p_usuario VARCHAR(50),
  IN p_rol VARCHAR(20)
)
BEGIN
  IF p_rol = 'empleado' THEN
    SELECT 
      u.usu_id,
      u.usu_nombre_usuario,
      u.usu_rol,
      u.emp_id,
      e.emp_nombre,
      e.emp_apellido,
      e.emp_correo,
      e.emp_telefono,
      e.emp_puesto,
      e.emp_salario
    FROM USUARIO_SISTEMA u
    JOIN EMPLEADO e ON u.emp_id = e.emp_id
    WHERE u.usu_nombre_usuario = p_usuario
      AND u.usu_rol = 'empleado';

  ELSEIF p_rol = 'cliente' THEN
    SELECT 
      u.usu_id,
      u.usu_nombre_usuario,
      u.usu_rol,
      u.cli_id,
      c.cli_nombre,
      c.cli_apellido,
      c.cli_correo,
      c.cli_telefono
    FROM USUARIO_SISTEMA u
    JOIN CLIENTE c ON u.cli_id = c.cli_id
    WHERE u.usu_nombre_usuario = p_usuario
      AND u.usu_rol = 'cliente';

  ELSE
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Rol no válido. Use "empleado" o "cliente".';
  END IF;
END;
//

DELIMITER ;

-- insertar inventario

DELIMITER //

CREATE PROCEDURE CrearInventario(
  IN p_fecha DATE,
  IN p_prod_id INT,
  IN p_cantidad INT,
  IN p_observaciones TEXT
)
BEGIN
  INSERT INTO INVENTARIO (
    inv_fecha_actualizacion,
    prod_id,
    inv_cantidad_actual,
    inv_observaciones
  )
  VALUES (
    p_fecha,
    p_prod_id,
    p_cantidad,
    p_observaciones
  );
END;
//

DELIMITER ;

-- Mostrar Inventario x Producto

DELIMITER //

CREATE PROCEDURE ObtenerInventarioCompleto()
BEGIN
  SELECT *
  FROM INVENTARIO
  NATURAL JOIN PRODUCTO;
END;
//

DELIMITER ;

-- Actualizar Inventario

DELIMITER //

CREATE PROCEDURE ActualizarInventario(
  IN p_inv_id INT,
  IN p_fecha DATE,
  IN p_cantidad INT,
  IN p_observaciones TEXT
)
BEGIN
  UPDATE INVENTARIO
  SET
    inv_fecha_actualizacion = p_fecha,
    inv_cantidad_actual = p_cantidad,
    inv_observaciones = p_observaciones
  WHERE inv_id = p_inv_id;
END;
//

DELIMITER ;

-- Borrar Inventario

DELIMITER //

CREATE PROCEDURE EliminarInventario(
  IN p_inv_id INT
)
BEGIN
  DELETE FROM INVENTARIO
  WHERE inv_id = p_inv_id;
END;
//

DELIMITER ;

-- Insertar Proveedor
DELIMITER //

CREATE PROCEDURE CrearProveedor(
  IN p_nombre VARCHAR(100),
  IN p_telefono VARCHAR(20),
  IN p_correo VARCHAR(100),
  IN p_direccion TEXT
)
BEGIN
  INSERT INTO PROVEEDOR (
    prov_nombre,
    prov_telefono,
    prov_correo,
    prov_direccion
  )
  VALUES (
    p_nombre,
    p_telefono,
    p_correo,
    p_direccion
  );
END;
//

DELIMITER ;

-- Leer Proveedor

DELIMITER //

CREATE PROCEDURE ObtenerProveedores()
BEGIN
  SELECT * FROM PROVEEDOR;
END;
//

DELIMITER ;

-- Actualizar Proveedor

DELIMITER //

CREATE PROCEDURE ActualizarProveedor(
  IN p_prov_id INT,
  IN p_nombre VARCHAR(100),
  IN p_telefono VARCHAR(20),
  IN p_correo VARCHAR(100),
  IN p_direccion TEXT
)
BEGIN
  UPDATE PROVEEDOR
  SET
    prov_nombre = p_nombre,
    prov_telefono = p_telefono,
    prov_correo = p_correo,
    prov_direccion = p_direccion
  WHERE prov_id = p_prov_id;
END;
//

DELIMITER ;

-- Borrar Proveedor

DELIMITER //

CREATE PROCEDURE EliminarProveedor(
  IN p_prov_id INT
)
BEGIN
  DELETE FROM PROVEEDOR
  WHERE prov_id = p_prov_id;
END;
//

DELIMITER ;

-- Insertar Pago
DELIMITER //

CREATE PROCEDURE CrearPago(
  IN p_fecha DATE,
  IN p_monto DECIMAL(10,2),
  IN p_metodo VARCHAR(50),
  IN p_gas_id INT,
  IN p_emp_id INT
)
BEGIN
  INSERT INTO PAGO (
    pag_fecha,
    pag_monto,
    pag_metodo,
    gas_id,
    emp_id
  )
  VALUES (
    p_fecha,
    p_monto,
    p_metodo,
    p_gas_id,
    p_emp_id
  );
END;
//

DELIMITER ;

-- Leer Pago
DELIMITER //

CREATE PROCEDURE ObtenerPagos()
BEGIN
  SELECT * FROM PAGO;
END;
//

DELIMITER ;

-- Actualizar Pago
DELIMITER //

CREATE PROCEDURE ActualizarPago(
  IN p_pago_id INT,
  IN p_fecha DATE,
  IN p_monto DECIMAL(10,2),
  IN p_metodo VARCHAR(50),
  IN p_gas_id INT,
  IN p_emp_id INT
)
BEGIN
  UPDATE PAGO
  SET
    pag_fecha = p_fecha,
    pag_monto = p_monto,
    pag_metodo = p_metodo,
    gas_id = p_gas_id,
    emp_id = p_emp_id
  WHERE pag_id = p_pago_id;
END;
//

DELIMITER ;

-- Borrar Pago
DELIMITER //

CREATE PROCEDURE EliminarPago(
  IN p_pago_id INT
)
BEGIN
  DELETE FROM PAGO
  WHERE pag_id = p_pago_id;
END;
//

DELIMITER ;

-- Pagos de un empleado en específico
DELIMITER //

CREATE PROCEDURE ObtenerPagosPorEmpleado(
  IN p_emp_id INT
)
BEGIN
  SELECT 
    e.emp_id,
    CONCAT(e.emp_nombre, ' ', e.emp_apellido) AS empleado,
    p.pag_id,
    p.pag_fecha,
    p.pag_monto,
    p.pag_metodo,
    p.gas_id
  FROM EMPLEADO e
  JOIN PAGO p ON e.emp_id=p.emp_id
  WHERE e.emp_id = p_emp_id;
END;
//

DELIMITER ;

-- Obtener todos los pagos con el nombre del empleado asociado:

DELIMITER //

CREATE PROCEDURE ObtenerTodosLosPagosConEmpleado()
BEGIN
  SELECT
    p.pag_id,
    p.pag_fecha,
    p.pag_monto,
    p.pag_metodo,
    p.gas_id,
    e.emp_id,
    e.emp_nombre,
    e.emp_apellido
  FROM PAGO p
  JOIN EMPLEADO e ON p.emp_id = e.emp_id;
END;
//

DELIMITER ;

-- Insertar Promocion
DELIMITER $$

CREATE PROCEDURE sp_crear_promocion (
    IN p_nombre VARCHAR(100),
    IN p_descripcion TEXT,
    IN p_fecha_inicio DATE,
    IN p_fecha_fin DATE,
    IN p_descuento DECIMAL(5,2),
    IN p_ser_id INT,
    IN p_usos INT
)
BEGIN
    INSERT INTO PROMOCION (
        pro_nombre,
        pro_descripcion,
        pro_fecha_inicio,
        pro_fecha_fin,
        pro_descuento_porcentaje,
        ser_id,
        pro_usos
    )
    VALUES (
        p_nombre,
        p_descripcion,
        p_fecha_inicio,
        p_fecha_fin,
        p_descuento,
        p_ser_id,
        p_usos
    );
END $$

DELIMITER ;

-- Leer promociones
DELIMITER $$

CREATE PROCEDURE sp_listar_promociones()
BEGIN
    SELECT pro_id, pro_nombre, pro_descripcion, pro_fecha_inicio, pro_fecha_fin, pro_descuento_porcentaje, ser_nombre 
    FROM PROMOCION NATURAL JOIN SERVICIO;
END $$

DELIMITER ;

-- Leer promocion por ID
DELIMITER $$

CREATE PROCEDURE sp_obtener_promocion_por_id (
    IN p_pro_id INT
)
BEGIN
    SELECT * FROM PROMOCION WHERE pro_id = p_pro_id;
END $$

DELIMITER ;

-- Actualizar promocion
DELIMITER $$

CREATE PROCEDURE sp_actualizar_promocion (
    IN p_pro_id INT,
    IN p_nombre VARCHAR(100),
    IN p_descripcion TEXT,
    IN p_fecha_inicio DATE,
    IN p_fecha_fin DATE,
    IN p_descuento DECIMAL(5,2),
    IN p_ser_id INT,
    IN p_usos INT
)
BEGIN
    UPDATE PROMOCION
    SET
        pro_nombre = p_nombre,
        pro_descripcion = p_descripcion,
        pro_fecha_inicio = p_fecha_inicio,
        pro_fecha_fin = p_fecha_fin,
        pro_descuento_porcentaje = p_descuento,
        ser_id = p_ser_id,
        pro_usos = p_usos
    WHERE pro_id = p_pro_id;
END $$

DELIMITER ;

-- Eliminar promocion
DELIMITER $$

CREATE PROCEDURE sp_eliminar_promocion (
    IN p_pro_id INT
)
BEGIN
    DELETE FROM PROMOCION WHERE pro_id = p_pro_id;
END $$

DELIMITER ;


-- Insertar Usuario

DELIMITER //

CREATE PROCEDURE insertar_usuario_sistema(
  IN p_usuario VARCHAR(50),
  IN p_contrasena VARCHAR(100),
  IN p_rol VARCHAR(20),
  IN p_emp_id INT,
  IN p_cli_id INT
)
BEGIN
  INSERT INTO USUARIO_SISTEMA (usu_nombre_usuario, usu_contrasena, usu_rol, emp_id, cli_id)
  VALUES (p_usuario, p_contrasena, p_rol, p_emp_id, p_cli_id);
END //

DELIMITER ;


-- Leer cliente por correo

DELIMITER //

CREATE PROCEDURE buscar_cliente_por_correo(IN p_correo VARCHAR(100))
BEGIN
  SELECT * FROM CLIENTE WHERE cli_correo = p_correo;
END //


DELIMITER ;

-- Actualizar usuario
DELIMITER $$

CREATE PROCEDURE sp_update_usuario(
  IN p_usu_id INT,
  IN p_nombre_usuario VARCHAR(50),
  IN p_contrasena VARCHAR(100),
  IN p_rol VARCHAR(20)
)
BEGIN
  UPDATE USUARIO_SISTEMA
  SET usu_nombre_usuario = p_nombre_usuario,
      usu_contrasena = p_contrasena,
      usu_rol = p_rol
  WHERE usu_id = p_usu_id;
END $$

DELIMITER ;

-- Leer citas empleado
DELIMITER $$

CREATE PROCEDURE sp_ver_citas_empleado(IN p_emp_id INT)
BEGIN
  SELECT cit_id, cit_fecha, cit_hora, ser_id, cli_id
  FROM CITA
  WHERE emp_id = p_emp_id
  ORDER BY cit_fecha DESC, cit_hora DESC;
END $$

DELIMITER ;

-- Leer historial_empleado
DELIMITER $$

CREATE PROCEDURE sp_ver_historial_empleado(IN p_emp_id INT)
BEGIN
  SELECT h.his_id, h.his_observaciones, h.cit_id, c.cit_fecha, c.cit_hora, c.cli_id, c.ser_id
  FROM HISTORIAL_CITA h
  JOIN CITA c ON h.cit_id = c.cit_id
  WHERE c.emp_id = p_emp_id
  ORDER BY c.cit_fecha DESC, c.cit_hora DESC;
END $$

DELIMITER ;

-- Crear una nueva cita
DELIMITER $$
CREATE PROCEDURE sp_insertar_cita (
    IN p_fecha DATE,
    IN p_hora TIME,
    IN p_emp_id INT,
    IN p_ser_id INT,
    IN p_cli_id INT
)
BEGIN
    INSERT INTO CITA (cit_fecha, cit_hora, emp_id, ser_id, cli_id)
    VALUES (p_fecha, p_hora, p_emp_id, p_ser_id, p_cli_id);
END$$
DELIMITER ;

-- Obtener todas las citas
DELIMITER $$
CREATE PROCEDURE sp_listar_citas()
BEGIN
    SELECT * FROM CITA ORDER BY cit_fecha DESC, cit_hora DESC;
END$$
DELIMITER ;

-- Obtener una cita por ID
DELIMITER $$
CREATE PROCEDURE sp_buscar_cita_por_id (
    IN p_cit_id INT
)
BEGIN
    SELECT * FROM CITA WHERE cit_id = p_cit_id;
END$$
DELIMITER ;

-- Actualizar una cita existente
DELIMITER $$
CREATE PROCEDURE sp_actualizar_cita (
    IN p_cit_id INT,
    IN p_fecha DATE,
    IN p_hora TIME,
    IN p_emp_id INT,
    IN p_ser_id INT,
    IN p_cli_id INT
)
BEGIN
    UPDATE CITA
    SET cit_fecha = p_fecha,
        cit_hora = p_hora,
        emp_id = p_emp_id,
        ser_id = p_ser_id,
        cli_id = p_cli_id
    WHERE cit_id = p_cit_id;
END$$
DELIMITER ;

-- Eliminar una cita por ID
DELIMITER $$
CREATE PROCEDURE sp_eliminar_cita (
    IN p_cit_id INT
)
BEGIN
    DELETE FROM CITA WHERE cit_id = p_cit_id;
END$$
DELIMITER ;

-- Insertar Servicio
DELIMITER $$
CREATE PROCEDURE sp_insertar_servicio (
    IN p_nombre VARCHAR(100),
    IN p_descripcion TEXT,
    IN p_categoria VARCHAR(50),
    IN p_precio_unitario DECIMAL(10,2),
    IN p_duracion_estimada INT
)
BEGIN
    INSERT INTO SERVICIO (
        ser_nombre, ser_descripcion, ser_categoria, ser_precio_unitario, ser_duracion_estimada
    )
    VALUES (
        p_nombre, p_descripcion, p_categoria, p_precio_unitario, p_duracion_estimada
    );
END$$
DELIMITER ;

-- Obtener todos los servicios
DELIMITER $$
CREATE PROCEDURE sp_listar_servicios()
BEGIN
    SELECT * FROM SERVICIO;
END$$
DELIMITER ;

-- Obtener un servicio por ID
DELIMITER $$
CREATE PROCEDURE sp_buscar_servicio_por_id (
    IN p_ser_id INT
)
BEGIN
    SELECT * FROM SERVICIO WHERE ser_id = p_ser_id;
END$$
DELIMITER ;

-- Actualizar un servicio existente
DELIMITER $$
CREATE PROCEDURE sp_actualizar_servicio (
    IN p_ser_id INT,
    IN p_nombre VARCHAR(100),
    IN p_descripcion TEXT,
    IN p_categoria VARCHAR(50),
    IN p_precio_unitario DECIMAL(10,2),
    IN p_duracion_estimada INT
)
BEGIN
    UPDATE SERVICIO
    SET
        ser_nombre = p_nombre,
        ser_descripcion = p_descripcion,
        ser_categoria = p_categoria,
        ser_precio_unitario = p_precio_unitario,
        ser_duracion_estimada = p_duracion_estimada
    WHERE ser_id = p_ser_id;
END$$
DELIMITER ;

-- Eliminar un servicio por ID
DELIMITER $$
CREATE PROCEDURE sp_eliminar_servicio (
    IN p_ser_id INT
)
BEGIN
    DELETE FROM SERVICIO WHERE ser_id = p_ser_id;
END$$
DELIMITER ;

-- Insertar una nueva factura
DELIMITER $$
CREATE PROCEDURE sp_insertar_factura (
    IN p_total DECIMAL(10,2),
    IN p_fecha DATE,
    IN p_hora TIME,
    IN p_cli_id INT
)
BEGIN
    INSERT INTO FACTURA_SERVICIO (fac_total, fac_fecha, fac_hora, cli_id)
    VALUES (p_total, p_fecha, p_hora, p_cli_id);
END$$
DELIMITER ;

-- Listar todas las facturas
DELIMITER $$
CREATE PROCEDURE sp_listar_facturas()
BEGIN
    SELECT * FROM FACTURA_SERVICIO;
END$$
DELIMITER ;

-- Buscar factura por ID
DELIMITER $$
CREATE PROCEDURE sp_buscar_factura_por_id (
    IN p_fac_id INT
)
BEGIN
    SELECT * FROM FACTURA_SERVICIO WHERE fac_id = p_fac_id;
END$$
DELIMITER ;

-- Actualizar factura existente
DELIMITER $$
CREATE PROCEDURE sp_actualizar_factura (
    IN p_fac_id INT,
    IN p_total DECIMAL(10,2),
    IN p_fecha DATE,
    IN p_hora TIME,
    IN p_cli_id INT
)
BEGIN
    UPDATE FACTURA_SERVICIO
    SET fac_total = p_total,
        fac_fecha = p_fecha,
        fac_hora = p_hora,
        cli_id = p_cli_id
    WHERE fac_id = p_fac_id;
END$$
DELIMITER ;

-- Eliminar una factura
DELIMITER $$
CREATE PROCEDURE sp_eliminar_factura (
    IN p_fac_id INT
)
BEGIN
    DELETE FROM FACTURA_SERVICIO WHERE fac_id = p_fac_id;
END$$
DELIMITER ;

-- Insertar detalle de factura
DELIMITER $$
CREATE PROCEDURE sp_insertar_detalle_factura (
    IN p_fac_id INT,
    IN p_ser_id INT
)
BEGIN
    INSERT INTO DETALLE_FACTURA_SERVICIO (fac_id, ser_id)
    VALUES (p_fac_id, p_ser_id);
END$$
DELIMITER ;

-- Listar todos los detalles de factura
DELIMITER $$
CREATE PROCEDURE sp_listar_detalles_factura()
BEGIN
    SELECT * FROM DETALLE_FACTURA_SERVICIO;
END$$
DELIMITER ;

-- Buscar detalle de factura por ID de factura
DELIMITER $$
CREATE PROCEDURE sp_buscar_detalle_por_factura (
    IN p_fac_id INT
)
BEGIN
    SELECT * FROM DETALLE_FACTURA_SERVICIO WHERE fac_id = p_fac_id;
END$$
DELIMITER ;

-- Actualizar detalle de factura (solo ser_id según estructura)
DELIMITER $$
CREATE PROCEDURE sp_actualizar_detalle_factura (
    IN p_fac_id INT,
    IN p_ser_id INT
)
BEGIN
    UPDATE DETALLE_FACTURA_SERVICIO
    SET ser_id = p_ser_id
    WHERE fac_id = p_fac_id;
END$$
DELIMITER ;

-- Eliminar detalle de factura
DELIMITER $$
CREATE PROCEDURE sp_eliminar_detalle_factura (
    IN p_fac_id INT
)
BEGIN
    DELETE FROM DETALLE_FACTURA_SERVICIO WHERE fac_id = p_fac_id;
END$$
DELIMITER ;


-- Crear un nuevo gasto mensual
DELIMITER $$
CREATE PROCEDURE sp_insertar_gasto (
    IN p_descripcion TEXT,
    IN p_fecha DATE,
    IN p_monto DECIMAL(10,2),
    IN p_tipo VARCHAR(50)
)
BEGIN
    INSERT INTO GASTO_MENSUAL (gas_descripcion, gas_fecha, gas_monto, gas_tipo)
    VALUES (p_descripcion, p_fecha, p_monto, p_tipo);
END$$
DELIMITER ;

-- Listar todos los gastos ordenados del más reciente al más antiguo
DELIMITER $$
CREATE PROCEDURE sp_listar_gastos()
BEGIN
    SELECT *
    FROM GASTO_MENSUAL
    ORDER BY gas_fecha DESC;
END$$
DELIMITER ;

-- Buscar gasto por ID
DELIMITER $$
CREATE PROCEDURE sp_buscar_gasto_por_id (
    IN p_gas_id INT
)
BEGIN
    SELECT *
    FROM GASTO_MENSUAL
    WHERE gas_id = p_gas_id;
END$$
DELIMITER ;

-- Actualizar un gasto mensual
DELIMITER $$
CREATE PROCEDURE sp_actualizar_gasto (
    IN p_gas_id INT,
    IN p_descripcion TEXT,
    IN p_fecha DATE,
    IN p_monto DECIMAL(10,2),
    IN p_tipo VARCHAR(50)
)
BEGIN
    UPDATE GASTO_MENSUAL
    SET
        gas_descripcion = p_descripcion,
        gas_fecha = p_fecha,
        gas_monto = p_monto,
        gas_tipo = p_tipo
    WHERE gas_id = p_gas_id;
END$$
DELIMITER ;

-- Eliminar un gasto mensual
DELIMITER $$
CREATE PROCEDURE sp_eliminar_gasto (
    IN p_gas_id INT
)
BEGIN
    DELETE FROM GASTO_MENSUAL
    WHERE gas_id = p_gas_id;
END$$
DELIMITER ;

-- Log CRUD stored procedures completion
INSERT IGNORE INTO salondb.db_initialization_log (script_name, status) 
VALUES ('04_stored_procedures_crud.sql', 'SUCCESS');

