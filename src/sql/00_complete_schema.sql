-- Create a complete SERVICIO table based on the inserts and usage patterns
USE mydb;

-- Create SERVICIO table
DROP TABLE IF EXISTS `mydb`.`SERVICIO`;

CREATE TABLE IF NOT EXISTS `mydb`.`SERVICIO` (
  `ser_id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT COMMENT 'Código que sirve como identificador único del servicio',
  `ser_nombre` VARCHAR(100) NOT NULL COMMENT 'Nombre del servicio',
  `ser_descripción` TEXT NULL DEFAULT NULL COMMENT 'Descripción del servicio',
  `ser_precio_unitario` DECIMAL(10,2) NOT NULL COMMENT 'Precio unitario del servicio',
  `ser_categoria` VARCHAR(50) NOT NULL COMMENT 'Categoría del servicio (Belleza, Mantenimiento, etc.)',
  `ser_duracion_estimada` INT NULL DEFAULT 60 COMMENT 'Duración estimada del servicio en minutos'
);

-- Add any missing columns to existing tables for compatibility
ALTER TABLE USUARIO_SISTEMA ADD COLUMN IF NOT EXISTS usu_fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE USUARIO_SISTEMA ADD COLUMN IF NOT EXISTS usu_ultimo_acceso TIMESTAMP NULL;
ALTER TABLE USUARIO_SISTEMA ADD COLUMN IF NOT EXISTS usu_activo BOOLEAN DEFAULT TRUE;
