-- PROCEDIMIENTOS ALMACENADOS CRUD PARA TABLAS

-- EMPLEADO
DELIMITER //


-- Insertar Empleado
CREATE PROCEDURE sp_insert_empleado(
  IN p_nombre VARCHAR(50), IN p_apellido VARCHAR(50), IN p_telefono VARCHAR(20),
  IN p_correo VARCHAR(100), IN p_puesto VARCHAR(50), IN p_salario DECIMAL(10,2)
)
BEGIN
  INSERT INTO EMPLEADO(emp_nombre, emp_apellido, emp_telefono, emp_correo, emp_puesto, emp_salario)
  VALUES (p_nombre, p_apellido, p_telefono, p_correo, p_puesto, p_salario);
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
  IN p_nombre VARCHAR(50), IN p_apellido VARCHAR(50), IN p_telefono VARCHAR(20), IN p_correo VARCHAR(100)
)
BEGIN
  INSERT INTO CLIENTE(cli_nombre, cli_apellido, cli_telefono, cli_correo)
  VALUES (p_nombre, p_apellido, p_telefono, p_correo);
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

-- Insertar Producto

DELIMITER //

CREATE PROCEDURE CrearProducto(
  IN p_nombre VARCHAR(100),
  IN p_descripcion TEXT,
  IN p_cantidad INT,
  IN p_precio DECIMAL(10,2)
)
BEGIN
  INSERT INTO PRODUCTO (
    prod_nombre,
    prod_descripcion,
    prod_cantidad_disponible,
    prod_precio_unitario
  )
  VALUES (
    p_nombre,
    p_descripcion,
    p_cantidad,
    p_precio
  );
END;
//

DELIMITER ;

-- Actualizar Producto

DELIMITER //

CREATE PROCEDURE ActualizarProducto(
  IN p_prod_id INT,
  IN p_nombre VARCHAR(100),
  IN p_descripcion TEXT,
  IN p_cantidad INT,
  IN p_precio DECIMAL(10,2)
)
BEGIN
  UPDATE PRODUCTO
  SET
    prod_nombre = p_nombre,
    prod_descripcion = p_descripcion,
    prod_cantidad_disponible = p_cantidad,
    prod_precio_unitario = p_precio
  WHERE prod_id = p_prod_id;
END;
//

DELIMITER ;

-- Borrar Producto

DELIMITER //

CREATE PROCEDURE EliminarProducto(
  IN p_prod_id INT
)
BEGIN
  DELETE FROM PRODUCTO
  WHERE prod_id = p_prod_id;
END;
//

DELIMITER ;


-- Insertar Proveedor
DELIMITER //

CREATE PROCEDURE CrearProveedor(
  IN p_nombre VARCHAR(100),
  IN p_contacto VARCHAR(100),
  IN p_correo VARCHAR(100),
  IN p_telefono VARCHAR(20),
  IN p_direccion TEXT
)
BEGIN
  INSERT INTO PROVEEDOR (
    prov_nombre,
    prov_contacto,
    prov_correo,
    prov_telefono,
    prov_direccion
  )
  VALUES (
    p_nombre,
    p_contacto,
    p_correo,
    p_telefono,
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
  IN p_contacto VARCHAR(100),
  IN p_correo VARCHAR(100),
  IN p_telefono VARCHAR(20),
  IN p_direccion TEXT
)
BEGIN
  UPDATE PROVEEDOR
  SET
    prov_nombre = p_nombre,
    prov_contacto = p_contacto,
    prov_correo = p_correo,
    prov_telefono = p_telefono,
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
  IN p_fac_id INT,
  IN p_fecha DATE,
  IN p_monto DECIMAL(10,2),
  IN p_metodo VARCHAR(50),
  IN p_referencia VARCHAR(100)
)
BEGIN
  INSERT INTO PAGO (
    fac_id,
    pago_fecha,
    pago_monto,
    pago_metodo,
    pago_referencia
  )
  VALUES (
    p_fac_id,
    p_fecha,
    p_monto,
    p_metodo,
    p_referencia
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
  IN p_fac_id INT,
  IN p_fecha DATE,
  IN p_monto DECIMAL(10,2),
  IN p_metodo VARCHAR(50),
  IN p_referencia VARCHAR(100)
)
BEGIN
  UPDATE PAGO
  SET
    fac_id = p_fac_id,
    pago_fecha = p_fecha,
    pago_monto = p_monto,
    pago_metodo = p_metodo,
    pago_referencia = p_referencia
  WHERE pago_id = p_pago_id;
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
  WHERE pago_id = p_pago_id;
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
    p.pago_id,
    p.pago_fecha,
    p.pago_monto,
    p.pago_metodo,
    p.pago_referencia
  FROM EMPLEADO e
  JOIN FACTURA_SERVICIO f ON e.emp_id = f.emp_id
  JOIN PAGO p ON f.fac_id = p.fac_id
  WHERE e.emp_id = p_emp_id;
END;
//

DELIMITER ;

-- Obtener todos los pagos con el nombre del empleado asociado:

DELIMITER //

CREATE PROCEDURE ObtenerTodosLosPagosConEmpleado()
BEGIN
  SELECT
    p.pago_id,
    p.pago_fecha,
    p.pago_monto,
    p.pago_metodo,
    p.pago_referencia,
    e.emp_id,
    e.emp_nombre,
    e.emp_apellido
  FROM PAGO p
  JOIN FACTURA_SERVICIO f ON p.fac_id = f.fac_id
  JOIN EMPLEADO e ON f.emp_id = e.emp_id;
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

CREATE PROCEDURE sp_listar_promociones ()
BEGIN
    SELECT * FROM PROMOCION;
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

-- Log CRUD stored procedures completion
INSERT IGNORE INTO salondb.db_initialization_log (script_name, status) 
VALUES ('04_stored_procedures_crud.sql', 'SUCCESS');

