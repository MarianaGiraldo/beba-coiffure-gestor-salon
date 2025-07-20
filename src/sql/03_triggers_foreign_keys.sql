-- TRIGGERS DE VALIDACIÓN DE LLAVES FORÁNEAS

DELIMITER //
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
  IF OLD.fac_id <> NEW.fac_id THEN
    UPDATE DETALLE_FACTURA_SERVICIO 
    SET fac_id = NEW.fac_id 
    WHERE fac_id = OLD.fac_id;
  END IF;
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

-- Log triggers completion
INSERT IGNORE INTO salondb.db_initialization_log (script_name, status) 
VALUES ('03_triggers_foreign_keys.sql', 'SUCCESS');
