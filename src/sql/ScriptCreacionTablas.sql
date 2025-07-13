-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `mydb` ;

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `mydb` DEFAULT CHARACTER SET utf8 ;
USE `mydb` ;

-- -----------------------------------------------------
-- Table `mydb`.`EMPLEADO`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`EMPLEADO` ;

CREATE TABLE IF NOT EXISTS `mydb`.`EMPLEADO` (
  `emp_id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT COMMENT 'Código que identifica a cada empleado',
  `emp_nombre` VARCHAR(50) NOT NULL COMMENT 'Nombres del empleado de la empresa',
  `emp_apellido` VARCHAR(50) NOT NULL COMMENT 'Apellidos del empleado de la empresa',
  `emp_telefono` VARCHAR(20) NULL DEFAULT NULL COMMENT 'Número de teléfono del empleado',
  `emp_correo` VARCHAR(100) NOT NULL COMMENT 'Dirección de correo del empleado',
  `emp_puesto` VARCHAR(50) NOT NULL COMMENT 'Puesto que ejerce el empleado en la empresa',
  `emp_salario` DECIMAL(10,2) NOT NULL COMMENT 'Cantidad de dinero correspondiente al salario del empleado'
);


-- -----------------------------------------------------
-- Table `mydb`.`CLIENTE`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`CLIENTE` ;

CREATE TABLE IF NOT EXISTS `mydb`.`CLIENTE` (
  `cli_id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT COMMENT 'Código que sirve como identificador único del cliente',
  `cli_nombre` VARCHAR(50) NULL DEFAULT NULL COMMENT 'Nombre del cliente',
  `cli_apellido` VARCHAR(50) NULL DEFAULT NULL COMMENT 'Apellido del cliente',
  `cli_telefono` VARCHAR(20) NULL DEFAULT NULL COMMENT 'Número de teléfono del cliente',
  `cli_correo` VARCHAR(100) NOT NULL COMMENT 'Dirección de correo del cliente'
);


-- -----------------------------------------------------
-- Table `mydb`.`USUARIO_SISTEMA`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`USUARIO_SISTEMA` ;

CREATE TABLE IF NOT EXISTS `mydb`.`USUARIO_SISTEMA` (
  `usu_id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT COMMENT 'Identificador del usuario del sistema',
  `usu_nombre_usuario` VARCHAR(50) NOT NULL COMMENT 'Nombre del usuario del sistema',
  `usu_contraseña` VARCHAR(100) NOT NULL COMMENT 'Contraseña del usuario del sistema',
  `usu_rol` VARCHAR(20) NOT NULL COMMENT 'Rol del usuario del sistema',
  `emp_id` INT NULL COMMENT 'Código que identifica al usuario del sistema como empleado de la empresa',
  `cli_id` INT NULL
);


-- -----------------------------------------------------
-- Table `mydb`.`HORARIO_EMPLEADO`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`HORARIO_EMPLEADO` ;

CREATE TABLE IF NOT EXISTS `mydb`.`HORARIO_EMPLEADO` (
  `hor_id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT COMMENT 'Identificador único del horario del empleado',
  `hor_dia_semana` VARCHAR(20) NOT NULL COMMENT 'Dato que indica qué días de la semana trabaja el empleado',
  `hor_hora_entrada` TIME NOT NULL COMMENT 'Dato que indica la hora de entrada del trabajador',
  `hor_hora_salida` TIME NOT NULL COMMENT 'Dato que indica la hora de salida del empleado',
  `emp_id` INT NOT NULL COMMENT 'Código que sirve como identificador único del empleado'
);


-- -----------------------------------------------------
-- Table `mydb`.`SERVICIO`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`SERVICIO` ;


-- -----------------------------------------------------
-- Table `mydb`.`PRODUCTO`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`PRODUCTO` ;

CREATE TABLE IF NOT EXISTS `mydb`.`PRODUCTO` (
  `prod_id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT COMMENT 'Código que sirve como identificador único del producto',
  `prod_nombre` VARCHAR(100) NOT NULL COMMENT 'Nombre del producto',
  `prod_descripción` TEXT NULL COMMENT 'Descripción del producto',
  `prod_cantidad_disponible` TINYINT(3) NOT NULL COMMENT 'Cantidad disponible del producto',
  `prod_precio_unitario` DECIMAL(10,2) NOT NULL COMMENT 'Precio unitario del producto'
);


-- -----------------------------------------------------
-- Table `mydb`.`PRODUCTO_USADO`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`PRODUCTO_USADO` ;

CREATE TABLE IF NOT EXISTS `mydb`.`PRODUCTO_USADO` (
  `ser_id` INT PRIMARY KEY NOT NULL COMMENT 'Códgo que sirve como identificador único del servicio realizado en el que se utilizó el producto',
  `prod_id` INT NOT NULL COMMENT 'Código que sirve como identificador único del producto utilizado',
  `pru_cantidad_usada` TINYINT(3) NOT NULL COMMENT 'Cantidad utilizada del producto durante el servicio',
  `pru_botellas_usadas` TINYINT(3) NOT NULL
  );


-- -----------------------------------------------------
-- Table `mydb`.`FACTURA_SERVICIO`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`FACTURA_SERVICIO` ;

CREATE TABLE IF NOT EXISTS `mydb`.`FACTURA_SERVICIO` (
  `fac_id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT COMMENT 'Código que sirve como identificador único de la factura con los servicios realizados a un cliente',
  `fac_total` DECIMAL(10,2) NOT NULL COMMENT 'Total gastado por el cliente durante su estancia en el salón de belleza',
  `fac_fecha` DATE NOT NULL COMMENT 'Fecha en la que se imprimió la factura',
  `fac_hora` TIME NOT NULL COMMENT 'Hora en la que se imprimió la factura',
  `cli_id` INT NOT NULL COMMENT 'Identificador del cliente para la impresión de la factura'
  );


-- -----------------------------------------------------
-- Table `mydb`.`DETALLE_FACTURA_SERVICIO`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`DETALLE_FACTURA_SERVICIO` ;

CREATE TABLE IF NOT EXISTS `mydb`.`DETALLE_FACTURA_SERVICIO` (
  `fac_id` INT PRIMARY KEY NOT NULL COMMENT 'Identificador único de la factura',
  `ser_id` INT NOT NULL COMMENT 'Identificador único del servicio'
  );


-- -----------------------------------------------------
-- Table `mydb`.`PROVEEDOR`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`PROVEEDOR` ;

CREATE TABLE IF NOT EXISTS `mydb`.`PROVEEDOR` (
  `prov_id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT COMMENT 'Código que sirve como identificador único para el proveedor',
  `prov_nombre` VARCHAR(100) NOT NULL COMMENT 'Nombre del proveedor',
  `prov_telefono` VARCHAR(20) NOT NULL COMMENT 'Número del teléfono del proveedor',
  `prov_correo` VARCHAR(100) NOT NULL COMMENT 'Dirección de correo del proveedor',
  `prov_dirección` VARCHAR(150) NOT NULL COMMENT 'Dirección que indica la ubicación del proveedor'
  );


-- -----------------------------------------------------
-- Table `mydb`.`GASTO_MENSUAL`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`GASTO_MENSUAL` ;

CREATE TABLE IF NOT EXISTS `mydb`.`GASTO_MENSUAL` (
  `gas_id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT COMMENT 'Identificador único del gasto total de la empresa',
  `gas_descripción` TEXT NULL DEFAULT NULL COMMENT 'Texto que describe las transacciones que hacen parte del gasto',
  `gas_fecha` DATE NOT NULL COMMENT 'Describe la fecha en la que se realizó cada gasto',
  `gas_monto` DECIMAL(10,2) NOT NULL COMMENT 'Cantidad de dinero total perteneciente al gasto realizado',
  `gas_tipo` VARCHAR(50) NOT NULL COMMENT 'Describe el tipo de gasto realizado en la empresa (Fijo, variable, directo, indirecto, etc)'
  );


-- -----------------------------------------------------
-- Table `mydb`.`PAGO`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`PAGO` ;

CREATE TABLE IF NOT EXISTS `mydb`.`PAGO` (
  `pag_id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT COMMENT 'Código que identifica a cada pago como único dentro de la empresa',
  `pag_fecha` DATE NOT NULL COMMENT 'Fecha en la que se realizó el pago',
  `pag_monto` DECIMAL(10,2) NOT NULL COMMENT 'Monto total del pago realizado',
  `pag_método` VARCHAR(50) NOT NULL COMMENT 'Método de pago utilizado en la transacción',
  `gas_id` INT NOT NULL COMMENT 'Código que sirve como identificador único de los gastos de la empresa',
  `emp_id` INT NOT NULL COMMENT 'Código que identifica a cada empleado como único dentro de la empresa'
  );


-- -----------------------------------------------------
-- Table `mydb`.`COMPRA_PRODUCTO`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`COMPRA_PRODUCTO` ;

CREATE TABLE IF NOT EXISTS `mydb`.`COMPRA_PRODUCTO` (
  `com_id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT COMMENT 'Código que sirve como identificador único de cada compra de productos realizada',
  `cop_fecha_compra` DATE NOT NULL COMMENT 'Fecha en la que se realizó la compra',
  `cop_total_compra` DECIMAL(10,2) NOT NULL COMMENT 'Monto total de la compra realizada',
  `cop_método_pago` VARCHAR(50) NOT NULL COMMENT 'Método de pago utilizado para realizar la compra',
  `prov_id` INT NOT NULL COMMENT 'Identificador único del proveedor',
  `gas_id` INT NOT NULL COMMENT 'Identificador único del gasto'
  );


-- -----------------------------------------------------
-- Table `mydb`.`DETALLE_COMPRA`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`DETALLE_COMPRA` ;

CREATE TABLE IF NOT EXISTS `mydb`.`DETALLE_COMPRA` (
  `com_id` INT PRIMARY KEY NOT NULL COMMENT 'Identificador único de la compra',
  `prod_id` INT NOT NULL COMMENT 'Identificador único de producto comprado',
  `dec_cantidad` INT NOT NULL COMMENT 'Cantidad de producto comprado',
  `dec_precio_unitario` DECIMAL(10,2) NOT NULL COMMENT 'Precio unitario del producto'
  );


-- -----------------------------------------------------
-- Table `mydb`.`INVENTARIO`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`INVENTARIO` ;

CREATE TABLE IF NOT EXISTS `mydb`.`INVENTARIO` (
  `inv_id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT COMMENT 'Código que sirve como identificador único del inventario',
  `inv_fecha_actualización` DATE NOT NULL COMMENT 'Fecha de actualización del inventario',
  `prod_id` INT NOT NULL COMMENT 'Identificador único del producto',
  `inv_cantidad_actual` INT NOT NULL COMMENT 'Cantidad actual del producto en el inventario',
  `inv_observaciones` TEXT NULL DEFAULT NULL COMMENT 'Observaciones sobre la presencia del producto en el inventario'
  );


-- -----------------------------------------------------
-- Table `mydb`.`PROMOCION`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`PROMOCION` ;

CREATE TABLE IF NOT EXISTS `mydb`.`PROMOCION` (
  `pro_id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT COMMENT 'Código que sirve como identificador único de la promoción',
  `pro_nombre` VARCHAR(100) NOT NULL COMMENT 'Nombre de la promoción',
  `pro_descripción` TEXT NULL DEFAULT NULL COMMENT 'Descripción y detalles de la promoción',
  `pro_fecha_inicio` DATE NOT NULL COMMENT 'Fecha de inicio de la promoción',
  `pro_fecha_fin` DATE NOT NULL COMMENT 'Fecha de finalización de la promoción',
  `pro_descuento_porcentaje` DECIMAL(5,2) NULL DEFAULT NULL COMMENT 'Porcentaje de descuento que un servicio posee gracias a la promoción',
  `ser_id` INT NOT NULL COMMENT 'Identificador único del servicio al cual va dirigido la promoción',
  `pro_usos` INT(2) NULL
  );


-- -----------------------------------------------------
-- Table `mydb`.`CITA`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`CITA` ;

CREATE TABLE IF NOT EXISTS `mydb`.`CITA` (
  `cit_id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT COMMENT 'Código que sirve como identificador único de la cita programada',
  `cit_fecha` DATE NOT NULL COMMENT 'Fecha de la cita programada',
  `cit_hora` TIME NOT NULL COMMENT 'Hora de la cita programada',
  `emp_id` INT NOT NULL COMMENT 'Identificador único del empleado que fue agendado para la cita',
  `ser_id` INT NOT NULL COMMENT 'Identificador único del servicio que se realizará en la cita',
  `cli_id` INT NOT NULL COMMENT 'Identificador único del cliente que agendó la cita'
  );


-- -----------------------------------------------------
-- Table `mydb`.`HISTORIAL_CITA`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`HISTORIAL_CITA` ;

CREATE TABLE IF NOT EXISTS `mydb`.`HISTORIAL_CITA` (
  `his_id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT COMMENT 'Código que sirve como identificador único para el historial de servicios recibidos por un cliente',
  `his_observaciones` TEXT NULL DEFAULT NULL COMMENT 'Observaciones sobre el historial del cliente',
  `cit_id` INT NOT NULL COMMENT 'Identificador único de alguna de las citas tomadas por el cliente'
  );

