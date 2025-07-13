-- PROCEDIMIENTOS ALMACENADOS CRUD PARA TABLAS

-- EMPLEADO
DELIMITER //

CREATE PROCEDURE sp_insert_empleado(
  IN p_nombre VARCHAR(50), IN p_apellido VARCHAR(50), IN p_telefono VARCHAR(20),
  IN p_correo VARCHAR(100), IN p_puesto VARCHAR(50), IN p_salario DECIMAL(10,2)
)
BEGIN
  INSERT INTO EMPLEADO(emp_nombre, emp_apellido, emp_telefono, emp_correo, emp_puesto, emp_salario)
  VALUES (p_nombre, p_apellido, p_telefono, p_correo, p_puesto, p_salario);
END;
//

CREATE PROCEDURE sp_get_empleados()
BEGIN
  SELECT * FROM EMPLEADO;
END;
//

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

CREATE PROCEDURE sp_delete_empleado(IN p_id INT)
BEGIN
  DELETE FROM EMPLEADO WHERE emp_id = p_id;
END;
//

-- CLIENTE
CREATE PROCEDURE sp_insert_cliente(
  IN p_nombre VARCHAR(50), IN p_apellido VARCHAR(50), IN p_telefono VARCHAR(20), IN p_correo VARCHAR(100)
)
BEGIN
  INSERT INTO CLIENTE(cli_nombre, cli_apellido, cli_telefono, cli_correo)
  VALUES (p_nombre, p_apellido, p_telefono, p_correo);
END;
//

CREATE PROCEDURE sp_get_clientes()
BEGIN
  SELECT * FROM CLIENTE;
END;
//

CREATE PROCEDURE sp_update_cliente(
  IN p_id INT, IN p_nombre VARCHAR(50), IN p_apellido VARCHAR(50), IN p_telefono VARCHAR(20), IN p_correo VARCHAR(100)
)
BEGIN
  UPDATE CLIENTE
  SET cli_nombre = p_nombre, cli_apellido = p_apellido, cli_telefono = p_telefono, cli_correo = p_correo
  WHERE cli_id = p_id;
END;
//

CREATE PROCEDURE sp_delete_cliente(IN p_id INT)
BEGIN
  DELETE FROM CLIENTE WHERE cli_id = p_id;
END;
//

-- PRODUCTO
CREATE PROCEDURE sp_insert_producto(
  IN p_nombre VARCHAR(100), IN p_descripcion TEXT, IN p_cantidad TINYINT, IN p_precio DECIMAL(10,2)
)
BEGIN
  INSERT INTO PRODUCTO(prod_nombre, prod_descripción, prod_cantidad_disponible, prod_precio_unitario)
  VALUES (p_nombre, p_descripcion, p_cantidad, p_precio);
END;
//

CREATE PROCEDURE sp_get_productos()
BEGIN
  SELECT * FROM PRODUCTO;
END;
//

CREATE PROCEDURE sp_update_producto(
  IN p_id INT, IN p_nombre VARCHAR(100), IN p_descripcion TEXT, IN p_cantidad TINYINT, IN p_precio DECIMAL(10,2)
)
BEGIN
  UPDATE PRODUCTO
  SET prod_nombre = p_nombre, prod_descripción = p_descripcion, prod_cantidad_disponible = p_cantidad,
      prod_precio_unitario = p_precio
  WHERE prod_id = p_id;
END;
//

CREATE PROCEDURE sp_delete_producto(IN p_id INT)
BEGIN
  DELETE FROM PRODUCTO WHERE prod_id = p_id;
END;
//

DELIMITER ;
