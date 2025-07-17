-- TRIGGERS DE VALIDACIÓN DE LLAVES FORÁNEAS

DELIMITER //

-- Trigger para HORARIO_EMPLEADO.emp_id
CREATE TRIGGER trg_insert_horario_empleado
BEFORE INSERT ON HORARIO_EMPLEADO
FOR EACH ROW
BEGIN
  DECLARE emp_exists INT;
  SELECT COUNT(*) INTO emp_exists FROM EMPLEADO WHERE emp_id = NEW.emp_id;
  IF emp_exists = 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Empleado no existe para el horario';
  END IF;
END;
//

-- Trigger para USUARIO_SISTEMA.emp_id y cli_id
CREATE TRIGGER trg_insert_usuario_sistema
BEFORE INSERT ON USUARIO_SISTEMA
FOR EACH ROW
BEGIN
  IF NEW.emp_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM EMPLEADO WHERE emp_id = NEW.emp_id) THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Empleado no existe para el usuario del sistema';
    END IF;
  END IF;
  IF NEW.cli_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM CLIENTE WHERE cli_id = NEW.cli_id) THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cliente no existe para el usuario del sistema';
    END IF;
  END IF;
END;
//

-- Trigger para CITA
CREATE TRIGGER trg_insert_cita
BEFORE INSERT ON CITA
FOR EACH ROW
BEGIN
  IF NOT EXISTS (SELECT 1 FROM EMPLEADO WHERE emp_id = NEW.emp_id) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Empleado no existe para la cita';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM CLIENTE WHERE cli_id = NEW.cli_id) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cliente no existe para la cita';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM SERVICIO WHERE ser_id = NEW.ser_id) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Servicio no existe para la cita';
  END IF;
END;
//

-- Trigger para FACTURA_SERVICIO
CREATE TRIGGER trg_insert_factura_servicio
BEFORE INSERT ON FACTURA_SERVICIO
FOR EACH ROW
BEGIN
  IF NOT EXISTS (SELECT 1 FROM CLIENTE WHERE cli_id = NEW.cli_id) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cliente no existe para la factura';
  END IF;
END;
//

-- Trigger para DETALLE_FACTURA_SERVICIO
CREATE TRIGGER trg_insert_detalle_factura
BEFORE INSERT ON DETALLE_FACTURA_SERVICIO
FOR EACH ROW
BEGIN
  IF NOT EXISTS (SELECT 1 FROM FACTURA_SERVICIO WHERE fac_id = NEW.fac_id) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Factura no existe para el detalle';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM SERVICIO WHERE ser_id = NEW.ser_id) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Servicio no existe para el detalle';
  END IF;
END;
//

-- Trigger para PRODUCTO_USADO
CREATE TRIGGER trg_insert_producto_usado
BEFORE INSERT ON PRODUCTO_USADO
FOR EACH ROW
BEGIN
  IF NOT EXISTS (SELECT 1 FROM SERVICIO WHERE ser_id = NEW.ser_id) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Servicio no existe para producto usado';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM PRODUCTO WHERE prod_id = NEW.prod_id) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Producto no existe en producto usado';
  END IF;
END;
//

-- Trigger para PAGO
CREATE TRIGGER trg_insert_pago
BEFORE INSERT ON PAGO
FOR EACH ROW
BEGIN
  IF NOT EXISTS (SELECT 1 FROM GASTO_MENSUAL WHERE gas_id = NEW.gas_id) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Gasto no existe para el pago';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM EMPLEADO WHERE emp_id = NEW.emp_id) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Empleado no existe para el pago';
  END IF;
END;
//

-- Trigger para COMPRA_PRODUCTO
CREATE TRIGGER trg_insert_compra_producto
BEFORE INSERT ON COMPRA_PRODUCTO
FOR EACH ROW
BEGIN
  IF NOT EXISTS (SELECT 1 FROM PROVEEDOR WHERE prov_id = NEW.prov_id) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Proveedor no existe para la compra';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM GASTO_MENSUAL WHERE gas_id = NEW.gas_id) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Gasto no existe para la compra';
  END IF;
END;
//

-- Trigger para DETALLE_COMPRA
CREATE TRIGGER trg_insert_detalle_compra
BEFORE INSERT ON DETALLE_COMPRA
FOR EACH ROW
BEGIN
  IF NOT EXISTS (SELECT 1 FROM COMPRA_PRODUCTO WHERE com_id = NEW.com_id) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Compra no existe para el detalle';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM PRODUCTO WHERE prod_id = NEW.prod_id) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Producto no existe en el detalle de compra';
  END IF;
END;
//

-- Trigger para INVENTARIO
CREATE TRIGGER trg_insert_inventario
BEFORE INSERT ON INVENTARIO
FOR EACH ROW
BEGIN
  IF NOT EXISTS (SELECT 1 FROM PRODUCTO WHERE prod_id = NEW.prod_id) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Producto no existe para el inventario';
  END IF;
END;
//

-- Trigger para PROMOCION
CREATE TRIGGER trg_insert_promocion
BEFORE INSERT ON PROMOCION
FOR EACH ROW
BEGIN
  IF NOT EXISTS (SELECT 1 FROM SERVICIO WHERE ser_id = NEW.ser_id) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Servicio no existe para la promoción';
  END IF;
END;
//

-- Trigger para HISTORIAL_CITA
CREATE TRIGGER trg_insert_historial_cita
BEFORE INSERT ON HISTORIAL_CITA
FOR EACH ROW
BEGIN
  IF NOT EXISTS (SELECT 1 FROM CITA WHERE cit_id = NEW.cit_id) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cita no existe para el historial';
  END IF;
END;
//


-- Trigger DELETE con cascada manual para EMPLEADO
CREATE TRIGGER trg_delete_empleado
BEFORE DELETE ON EMPLEADO
FOR EACH ROW
BEGIN
  DELETE FROM HORARIO_EMPLEADO WHERE emp_id = OLD.emp_id;
  DELETE FROM USUARIO_SISTEMA WHERE emp_id = OLD.emp_id;
  DELETE FROM CITA WHERE emp_id = OLD.emp_id;
  DELETE FROM PAGO WHERE emp_id = OLD.emp_id;
END;
//

-- Trigger UPDATE con cascada manual para EMPLEADO
CREATE TRIGGER trg_update_empleado
AFTER UPDATE ON EMPLEADO
FOR EACH ROW
BEGIN
  UPDATE HORARIO_EMPLEADO SET emp_id = NEW.emp_id WHERE emp_id = OLD.emp_id;
  UPDATE USUARIO_SISTEMA SET emp_id = NEW.emp_id WHERE emp_id = OLD.emp_id;
  UPDATE CITA SET emp_id = NEW.emp_id WHERE emp_id = OLD.emp_id;
  UPDATE PAGO SET emp_id = NEW.emp_id WHERE emp_id = OLD.emp_id;
END;
//

-- Trigger DELETE con cascada manual para CLIENTE
CREATE TRIGGER trg_delete_cliente
BEFORE DELETE ON CLIENTE
FOR EACH ROW
BEGIN
  DELETE FROM USUARIO_SISTEMA WHERE cli_id = OLD.cli_id;
  DELETE FROM CITA WHERE cli_id = OLD.cli_id;
  DELETE FROM FACTURA_SERVICIO WHERE cli_id = OLD.cli_id;
END;
//

-- Trigger UPDATE con cascada manual para CLIENTE
CREATE TRIGGER trg_update_cliente
AFTER UPDATE ON CLIENTE
FOR EACH ROW
BEGIN
  UPDATE USUARIO_SISTEMA SET cli_id = NEW.cli_id WHERE cli_id = OLD.cli_id;
  UPDATE CITA SET cli_id = NEW.cli_id WHERE cli_id = OLD.cli_id;
  UPDATE FACTURA_SERVICIO SET cli_id = NEW.cli_id WHERE cli_id = OLD.cli_id;
END;
//

-- Trigger DELETE con cascada manual para SERVICIO
CREATE TRIGGER trg_delete_servicio
BEFORE DELETE ON SERVICIO
FOR EACH ROW
BEGIN
  DELETE FROM CITA WHERE ser_id = OLD.ser_id;
  DELETE FROM DETALLE_FACTURA_SERVICIO WHERE ser_id = OLD.ser_id;
  DELETE FROM PRODUCTO_USADO WHERE ser_id = OLD.ser_id;
  DELETE FROM PROMOCION WHERE ser_id = OLD.ser_id;
END;
//

-- Trigger UPDATE con cascada manual para SERVICIO
CREATE TRIGGER trg_update_servicio
AFTER UPDATE ON SERVICIO
FOR EACH ROW
BEGIN
  UPDATE CITA SET ser_id = NEW.ser_id WHERE ser_id = OLD.ser_id;
  UPDATE DETALLE_FACTURA_SERVICIO SET ser_id = NEW.ser_id WHERE ser_id = OLD.ser_id;
  UPDATE PRODUCTO_USADO SET ser_id = NEW.ser_id WHERE ser_id = OLD.ser_id;
  UPDATE PROMOCION SET ser_id = NEW.ser_id WHERE ser_id = OLD.ser_id;
END;
//

-- Trigger DELETE con cascada manual para PRODUCTO
CREATE TRIGGER trg_delete_producto
BEFORE DELETE ON PRODUCTO
FOR EACH ROW
BEGIN
  DELETE FROM PRODUCTO_USADO WHERE prod_id = OLD.prod_id;
  DELETE FROM DETALLE_COMPRA WHERE prod_id = OLD.prod_id;
  DELETE FROM INVENTARIO WHERE prod_id = OLD.prod_id;
END;
//

-- Trigger UPDATE con cascada manual para PRODUCTO
CREATE TRIGGER trg_update_producto
AFTER UPDATE ON PRODUCTO
FOR EACH ROW
BEGIN
  UPDATE PRODUCTO_USADO SET prod_id = NEW.prod_id WHERE prod_id = OLD.prod_id;
  UPDATE DETALLE_COMPRA SET prod_id = NEW.prod_id WHERE prod_id = OLD.prod_id;
  UPDATE INVENTARIO SET prod_id = NEW.prod_id WHERE prod_id = OLD.prod_id;
END;
//

-- Trigger DELETE con cascada manual para FACTURA_SERVICIO
CREATE TRIGGER trg_delete_factura
BEFORE DELETE ON FACTURA_SERVICIO
FOR EACH ROW
BEGIN
  DELETE FROM DETALLE_FACTURA_SERVICIO WHERE fac_id = OLD.fac_id;
END;
//

-- Trigger UPDATE con cascada manual para FACTURA_SERVICIO
CREATE TRIGGER trg_update_factura
AFTER UPDATE ON FACTURA_SERVICIO
FOR EACH ROW
BEGIN
  UPDATE DETALLE_FACTURA_SERVICIO SET fac_id = NEW.fac_id WHERE fac_id = OLD.fac_id;
END;
//

-- Trigger DELETE con cascada manual para COMPRA_PRODUCTO
CREATE TRIGGER trg_delete_compra
BEFORE DELETE ON COMPRA_PRODUCTO
FOR EACH ROW
BEGIN
  DELETE FROM DETALLE_COMPRA WHERE com_id = OLD.com_id;
END;
//

-- Trigger UPDATE con cascada manual para COMPRA_PRODUCTO
CREATE TRIGGER trg_update_compra
AFTER UPDATE ON COMPRA_PRODUCTO
FOR EACH ROW
BEGIN
  UPDATE DETALLE_COMPRA SET com_id = NEW.com_id WHERE com_id = OLD.com_id;
END;
//

-- Trigger DELETE con cascada manual para CITA
CREATE TRIGGER trg_delete_cita
BEFORE DELETE ON CITA
FOR EACH ROW
BEGIN
  DELETE FROM HISTORIAL_CITA WHERE cit_id = OLD.cit_id;
END;
//

-- Trigger UPDATE con cascada manual para CITA
CREATE TRIGGER trg_update_cita
AFTER UPDATE ON CITA
FOR EACH ROW
BEGIN
  UPDATE HISTORIAL_CITA SET cit_id = NEW.cit_id WHERE cit_id = OLD.cit_id;
END;
//

-- Trigger empleado->usuario_sistema

DELIMITER //

CREATE TRIGGER trg_insert_usuario_empleado
AFTER INSERT ON EMPLEADO
FOR EACH ROW
BEGIN
  INSERT INTO USUARIO_SISTEMA (
    usu_nombre_usuario,
    usu_contraseña,
    usu_rol,
    emp_id,
    cli_id
  )
  VALUES (
    CONCAT(LOWER(LEFT(NEW.emp_nombre, 1)), LOWER(NEW.emp_apellido)),
    SHA2('default123', 256), 
    'empleado',
    NEW.emp_id,
    NULL
  );
END;
//

DELIMITER ;

-- Trigger cliente->usuario_sistema

CREATE TRIGGER trg_insert_usuario_cliente
AFTER INSERT ON CLIENTE
FOR EACH ROW
BEGIN
  INSERT INTO USUARIO_SISTEMA (
    usu_nombre_usuario,
    usu_contraseña,
    usu_rol,
    emp_id,
    cli_id
  )
  VALUES (
    CONCAT(LOWER(LEFT(NEW.cli_nombre, 1)), LOWER(NEW.cli_apellido)),
    SHA2('default123', 256), 
    'cliente',
    NULL,
    NEW.cli_id
  );
END;
//

DELIMITER ;

-- Log triggers completion
INSERT INTO salondb.db_initialization_log (script_name, status) 
VALUES ('03_triggers_foreign_keys.sql', 'SUCCESS');