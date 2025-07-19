USE salondb;

CALL sp_insert_empleado('Feliciana', 'Canton', '+57 4843321819', 'andresciro@gmail.com', 'Estilista', 1050021.51, '12345');
CALL sp_insert_empleado('Joan', 'Vazquez', '+57 4740838637', 'cuervojose@gmail.com', 'Gerente', 1489783.71, '12345');
CALL sp_insert_empleado('Noe', 'Lobo', '+57 4835116155', 'segoviabrunilda@gmail.com', 'Recepcionista', 2472942.43, '12345');
CALL sp_insert_empleado('Agata', 'Pinedo', '+57 4738495931', 'maria-teresamancebo@gmail.com', 'Estilista', 2180985.02, '12345');
CALL sp_insert_empleado('Leopoldo', 'Santana', '+57 4952553419', 'fernandosevilla@gmail.com', 'Estilista', 1059594.44, '12345');
CALL sp_insert_empleado('Pia', 'Barba', '+57 4740564139', 'gabrielavalera@gmail.com', 'Recepcionista', 1465321.79, '12345');
CALL sp_insert_empleado('Soledad', 'Segarra', '+57 4842388496', 'isidoro28@gmail.com', 'Estilista', 2122490.13, '12345');
CALL sp_insert_empleado('Ciriaco', 'Arevalo', '+57 4622691669', 'carolina01@gmail.com', 'Asistente', 1440881.24, '12345');
CALL sp_insert_empleado('Sonia', 'Lasa', '+57 4851462704', 'martinprudencia@gmail.com', 'Gerente', 2618860.91, '12345');
CALL sp_insert_empleado('Maria Belen', 'Cuellar', '+57 4708095701', 'jose03@gmail.com', 'Estilista', 2517614.73, '12345');
CALL sp_insert_empleado('Cayetano', 'Boada', '+57 4747182278', 'belen96@gmail.com', 'Recepcionista', 2396278.79, '12345');
CALL sp_insert_empleado('Sabas', 'Perea', '+57 4728713315', 'dionisiagimenez@gmail.com', 'Gerente', 1555742.68, '12345');
CALL sp_insert_empleado('Jenaro', 'Bauza', '+57 4705183473', 'yherrero@gmail.com', 'Recepcionista', 2914426.14, '12345');
CALL sp_insert_empleado('Cleto', 'Rosa', '+57 4746670106', 'ibarragregorio@gmail.com', 'Gerente', 1204420.55, '12345');
CALL sp_insert_empleado('Brunilda', 'Sanabria', '+57 4962473178', 'alcoleaciro@gmail.com', 'Asistente', 1193432.75, '12345');

CALL sp_insert_cliente('Alicia', 'Garcia', '+57 4802606474', 'mcortina@gmail.com', '12345');
CALL sp_insert_cliente('Isaac', 'Barragan', '+57 4738050097', 'verdejocecilio@gmail.com', '12345');
CALL sp_insert_cliente('Imelda', 'Gutierrez', '+57 4819399091', 'juan-carlos35@gmail.com', '12345');
CALL sp_insert_cliente('Juan Manuel', 'Priego', '+57 4947510799', 'garcesantonia@gmail.com', '12345');
CALL sp_insert_cliente('Serafina', 'Hidalgo', '+57 4642784980', 'canizaresjuan-luis@gmail.com', '12345');
CALL sp_insert_cliente('Tania', 'Campo', '+57 4682449353', 'diglesias@gmail.com', '12345');
CALL sp_insert_cliente('Fabiana', 'Roda', '+57 4800524278', 'caparroscarlos@gmail.com', '12345');
CALL sp_insert_cliente('Vera', 'Company', '+57 4700598262', 'panfilo05@gmail.com', '12345');
CALL sp_insert_cliente('Paulino', 'Ramos', '+57 4623226025', 'juanitocuervo@gmail.com', '12345');
CALL sp_insert_cliente('Candido', 'Pineiro', '+57 4707337543', 'ferrandosabas@gmail.com', '12345');
CALL sp_insert_cliente('Pascual', 'Vergara', '+57 4885014294', 'roviraonofre@gmail.com', '12345');
CALL sp_insert_cliente('Rogelio', 'Falcon', '+57 4906088356', 'estrella51@gmail.com', '12345');
CALL sp_insert_cliente('Nacho', 'Quevedo', '+57 4724823662', 'tabad@gmail.com', '12345');
CALL sp_insert_cliente('Humberto', 'Ropero', '+57 4739577738', 'genovevablazquez@gmail.com', '12345');
CALL sp_insert_cliente('Aranzazu', 'Naranjo', '+57 4733433200', 'dbeltran@gmail.com', '12345');


CALL CrearProveedor('Zamora Inc', '+57 4720062312', 'gilanselma@gmail.com', 'Paseo Carmen Reina 1, Murcia, 08621');
CALL CrearProveedor('Zamora and Sons', '+57 4639845461', 'santiago79@gmail.com', 'C. de Rene Tamarit 1, Avila, 65918');
CALL CrearProveedor('Gras and Sons', '+57 4729740148', 'escobarursula@gmail.com', 'Rambla de Cintia Hernandez 668, Valladolid, 18501');
CALL CrearProveedor('Guerra-Benitez', '+57 4739996504', 'otrujillo@gmail.com', 'Urbanización de Leyre Beltrán 5, Jaen, 65511');
CALL CrearProveedor('Mendez Group', '+57 4641212678', 'bcalderon@gmail.com', 'Canada Severiano Pons 9 Apt. 98 , Soria, 22444');
CALL CrearProveedor('Coello-Barroso', '+57 4706464715', 'jose-manuel79@gmail.com', 'Alameda de Prudencia Pinto 67, Segovia, 45937');
CALL CrearProveedor('Elias-Puig', '+57 4724793564', 'hpatino@gmail.com', 'Avenida de Olivia Rebollo 52 Apt. 42 , Zamora, 17979');
CALL CrearProveedor('Velazquez-Ripoll', '+57 4700589113', 'flavio90@gmail.com', 'Urbanizacion de Arcelia Villena 499, Huesca, 79825');
CALL CrearProveedor('Tolosa Inc', '+57 4706112545', 'hgabaldon@gmail.com', 'Avenida de Marcelo Arribas 1 Piso 1 , Valencia, 82825');
CALL CrearProveedor('Roldan, Sevilla and Guardiola', '+57 4822660937', 'aporcel@gmail.com', 'Alameda de Haroldo Seco 5, Melilla, 96969');
CALL CrearProveedor('Oliveras LLC', '+57 4739249912', 'desiderio34@gmail.com', 'Camino Rodolfo Rocha 97 Puerta 2 , Madrid, 22579');
CALL CrearProveedor('Palomar Inc', '+57 4623688767', 'fsaldana@gmail.com', 'Callejon Jafet Malo 87 Puerta 8 , Ourense, 48580');
CALL CrearProveedor('Sainz, Gil and Rodríguez', '+57 4743407451', 'xcarpio@gmail.com', 'Glorieta Odalys Gabaldon 6, Pontevedra, 54494');
CALL CrearProveedor('Bustos, Cerda and Reina', '+57 4714223253', 'jtovar@gmail.com', 'Pasadizo de Maribel Lobo 87, Palencia, 17518');
CALL CrearProveedor('Gibert-Roman', '+57 4737454589', 'clarisatoro@gmail.com', 'Rambla Valero Sastre 7, Tarragona, 42415');


CALL sp_insertar_servicio('Coloracion', 'Tintes, mechas, reflejos, y otros servicios de coloracion.', 'Cabello', 200931.51, 90);
CALL sp_insertar_servicio('Manicura', 'Cuidado y embellecimiento de las unas de las manos.', 'Unas', 20000, 60);
CALL sp_insertar_servicio('Corte Cabello', 'Cortes adaptados a diferentes estilos y tipos de cabello.', 'Cabello', 30000, 30);
CALL sp_insertar_servicio('Alisado', 'Permanente o temporal.', 'Cabello', 25000, 30);
CALL sp_insertar_servicio('Pedicura', 'Cuidado y embellecimiento de las unas de los pies.', 'Unas', 30000, 60);
CALL sp_insertar_servicio('Decoración de unas', 'Unas de gel, acrilicas, esmaltado permanente.', 'Unas', 15000, 30);
CALL sp_insertar_servicio('Depilación de cejas', 'Depilacion de cejas con laser o pinzas', 'Facial', 16000, 20);
CALL sp_insertar_servicio('Mascarilla facial', 'Tratamiento de limpieza para la cara', 'Facial', 32500, 45);
CALL sp_insertar_servicio('Hidratacion facial', 'Tratamiento de hidratacion para la cara', 'Facial', 25000, 45);




CALL sp_insert_producto('Tinte 1', 'Tinte rubio', 18, 39165.07);
CALL sp_insert_producto('Tinte 2', 'Tinte castaño', 6, 28490.41);
CALL sp_insert_producto('Pintauñas 1', 'Pintauñas rojo', 9, 49580.93);
CALL sp_insert_producto('Pintauñas 2', 'Pintauñas blanco', 18, 18784.61);
CALL sp_insert_producto('Shampoo 1', 'Shampoo para cabellos lisos', 11, 43714.08);
CALL sp_insert_producto('Shampoo 2', 'Shampoo para cabellos rizados', 2, 19161.92);
CALL sp_insert_producto('Crema de peinar 1', 'Crema de peinar para cabellos lisos', 2, 42201.83);
CALL sp_insert_producto('Acondicionador 1', 'Acondicionador para cabellos ondulados', 13, 20709.64);
CALL sp_insert_producto('Mascarilla 1', 'Mascarilla facial', 13, 20709.64);



INSERT INTO GASTO_MENSUAL (gas_descripcion, gas_fecha, gas_monto, gas_tipo) VALUES
('Assumenda optio officiis amet numquam.', '2025-02-01', 772312.43, 'Indirecto'),
('Maxime ipsum ab exercitationem blanditiis.', '2024-11-05', 908040.6, 'Indirecto'),
('Consequatur quo quidem consequatur voluptatibus.', '2024-10-30', 425796.8, 'Variable'),
('Occaecati corrupti illum placeat similique.', '2024-10-30', 558573.66, 'Fijo'),
('Et consequuntur eius assumenda mollitia nobis.', '2024-11-15', 780203.94, 'Fijo'),
('Officia quos recusandae dolores harum.', '2025-06-13', 237557.19, 'Variable'),
('Consequatur similique necessitatibus facilis placeat quis.', '2024-07-09', 812871.43, 'Indirecto'),
('Magni occaecati magnam impedit praesentium assumenda.', '2024-10-20', 636768.13, 'Indirecto'),
('Nesciunt quis officiis officia est ipsa.', '2024-10-14', 443457.36, 'Indirecto'),
('Blanditiis provident praesentium cum.', '2024-09-28', 576202.91, 'Fijo'),
('Quo adipisci rem earum. Ea voluptate occaecati libero.', '2025-03-23', 712255.07, 'Fijo'),
('Dolorem magni aliquid sint.', '2024-06-29', 713539.33, 'Directo'),
('Rem quae omnis dolore dolorum totam eum.', '2024-09-10', 791738.86, 'Directo'),
('Itaque fuga eos quos qui doloribus fuga.', '2024-06-25', 200396.96, 'Indirecto'),
('Molestiae odio possimus ab ex.', '2024-07-09', 242341.98, 'Fijo');
INSERT INTO PAGO (pag_fecha, pag_monto, pag_metodo, gas_id, emp_id) VALUES
('2025-06-16', 973293.69, 'Transferencia', 9, 15),
('2025-06-16', 151090.28, 'Tarjeta', 14, 11),
('2025-06-16', 532279.74, 'Transferencia', 3, 6),
('2025-06-16', 774385.26, 'Efectivo', 10, 6),
('2025-06-16', 514175.42, 'Efectivo', 15, 6),
('2025-06-16', 884785.78, 'Tarjeta', 4, 1),
('2025-06-16', 278828.01, 'Efectivo', 2, 12),
('2025-06-16', 511690.94, 'Efectivo', 13, 9),
('2025-06-16', 777542.71, 'Transferencia', 11, 8),
('2025-06-16', 949506.25, 'Transferencia', 5, 9),
('2025-06-16', 878811.39, 'Cheque', 4, 15),
('2025-06-16', 562331.28, 'Transferencia', 12, 5),
('2025-06-16', 429042.68, 'Tarjeta', 8, 15),
('2025-06-16', 541697.05, 'Efectivo', 4, 4),
('2025-06-16', 110824.6, 'Efectivo', 10, 9);


CALL sp_insertar_factura(161250.48, '2025-06-16', '22:07:15', 4);
CALL sp_insertar_factura(63163.97, '2025-06-16', '06:15:41', 12);
CALL sp_insertar_factura(337685.3, '2025-06-16', '13:23:31', 4);
CALL sp_insertar_factura(89656.14, '2025-06-16', '23:50:29', 1);
CALL sp_insertar_factura(438239.58, '2025-06-16', '23:09:30', 2);
CALL sp_insertar_factura(286228.69, '2025-06-16', '09:50:37', 5);
CALL sp_insertar_factura(354350.22, '2025-06-16', '15:06:17', 4);
CALL sp_insertar_factura(297262.93, '2025-06-16', '08:49:09', 12);
CALL sp_insertar_factura(471626.27, '2025-06-16', '11:59:54', 10);
CALL sp_insertar_factura(313533.13, '2025-06-16', '08:47:13', 4);
CALL sp_insertar_factura(405232.55, '2025-06-16', '01:52:41', 13);
CALL sp_insertar_factura(239106.38, '2025-06-16', '12:49:37', 2);
CALL sp_insertar_factura(102649.56, '2025-06-16', '03:18:13', 7);
CALL sp_insertar_factura(215890.93, '2025-06-16', '01:00:34', 7);
CALL sp_insertar_factura(265490.85, '2025-06-16', '08:09:16', 12);


CALL sp_insertar_cita('2025-06-16', '22:16:06', 1, 3, 11);
CALL sp_insertar_cita('2025-07-16', '06:47:00', 11, 2, 1);
CALL sp_insertar_cita('2025-03-16', '11:02:19', 7, 5, 6);
CALL sp_insertar_cita('2025-06-16', '13:00:33', 13, 6, 2);
CALL sp_insertar_cita('2025-06-14', '11:13:32', 4, 2, 4);
CALL sp_insertar_cita('2025-06-13', '13:14:02', 9, 1, 3);
CALL sp_insertar_cita('2025-06-10', '12:47:26', 7, 7, 5);
CALL sp_insertar_cita('2025-06-20', '09:40:12', 8, 3, 14);
CALL sp_insertar_cita('2025-06-12', '08:32:12', 15, 4, 8);
CALL sp_insertar_cita('2025-06-04', '02:36:59', 13, 1, 14);
CALL sp_insertar_cita('2025-06-05', '00:49:19', 9, 2, 1);
CALL sp_insertar_cita('2025-05-25', '02:37:36', 11, 8, 14);
CALL sp_insertar_cita('2025-05-18', '11:37:08', 1, 4, 15);
CALL sp_insertar_cita('2025-06-01', '11:32:14', 13, 5, 4);
CALL sp_insertar_cita('2025-06-07', '13:11:14', 3, 9, 8);

-- Temporarily disable the trigger that causes dynamic SQL issues
DROP TRIGGER IF EXISTS trg_after_insert_usuario_sistema;

CALL insertar_usuario_sistema('jsantamaria', '+8_!Hy)mFd', 'empleado', 20, 15);
CALL insertar_usuario_sistema('figueroavanesa', '&o_7vZeKfO', 'cliente', 7, NULL);
CALL insertar_usuario_sistema('leonardolosada', '269BS%t_*r', 'empleado', NULL, NULL);
CALL insertar_usuario_sistema('alexandra87', 'G^9Qkj%zRi', 'cliente', NULL, 4);
CALL insertar_usuario_sistema('gimenezcoral', '5B5EFeEf&w', 'admin', 12, NULL);
CALL insertar_usuario_sistema('farellano', '@hTXlD1l!3', 'cliente', NULL, 9);
CALL insertar_usuario_sistema('camilo56', 'By1KZjBeT)', 'cliente', 9, 14);
CALL insertar_usuario_sistema('umelero', 'fEw4zx#fu+', 'cliente', 10, 11);
CALL insertar_usuario_sistema('natanaelbermejo', '$5mbfCKfdD', 'empleado', 2, 10);
CALL insertar_usuario_sistema('adelgado', 'F*6ULrLl#@', 'admin', NULL, NULL);
CALL insertar_usuario_sistema('ucuevas', 'VXN8C0k+@3', 'empleado', NULL, NULL);
CALL insertar_usuario_sistema('manuel31', 'o!EJ6aSr@0', 'empleado', NULL, NULL);
CALL insertar_usuario_sistema('qtorrijos', 'G1G1$Urn%+', 'cliente', NULL, 10);
CALL insertar_usuario_sistema('carolinabarrera', 'cN85AHprU&', 'cliente', 9, NULL);
CALL insertar_usuario_sistema('florenciogalan', '^c2m2Bnf$&', 'cliente', NULL, 15);


CALL sp_insertar_detalle_factura(1, 6);
CALL sp_insertar_detalle_factura(2, 5);
CALL sp_insertar_detalle_factura(3, 3);
CALL sp_insertar_detalle_factura(4, 8);
CALL sp_insertar_detalle_factura(5, 14);
CALL sp_insertar_detalle_factura(6, 9);
CALL sp_insertar_detalle_factura(7, 12);
CALL sp_insertar_detalle_factura(8, 5);
CALL sp_insertar_detalle_factura(9, 10);
CALL sp_insertar_detalle_factura(10, 13);
CALL sp_insertar_detalle_factura(11, 11);
CALL sp_insertar_detalle_factura(12, 9);
CALL sp_insertar_detalle_factura(13, 1);
CALL sp_insertar_detalle_factura(14, 11);
CALL sp_insertar_detalle_factura(15, 14);

INSERT INTO PRODUCTO_USADO (ser_id, prod_id, pru_cantidad_usada, pru_botellas_usadas) VALUES
(1, 9, 300, 3),
(2, 2, 200, 2),
(3, 2, 100, 3),
(4, 9, 200, 2),
(5, 5, 600, 1),
(6, 12, 300, 1),
(7, 11, 300, 3),
(8, 8, 300, 1),
(9, 2, 400, 2),


CALL sp_crear_promocion('Promo 1', 'Itaque sit ratione numquam minima in impedit.', '2025-06-16', '2025-06-16', 27.6, 9, 1);
CALL sp_crear_promocion('Promo 2', 'Ratione sint sunt soluta. Fugit laborum non alias eius.', '2025-06-16', '2025-06-16', 25.86, 10, 9);
CALL sp_crear_promocion('Promo 3', 'Quia ullam tempore. Excepturi recusandae est.', '2025-06-16', '2025-06-16', 8.7, 3, 1);
CALL sp_crear_promocion('Promo 4', 'Non at ipsam totam illum laborum.', '2025-06-16', '2025-06-16', 12.71, 15, 1);
CALL sp_crear_promocion('Promo 5', 'Soluta dicta animi alias amet.', '2025-06-16', '2025-06-16', 27.47, 4, 4);
CALL sp_crear_promocion('Promo 6', 'Laborum ipsum vero labore mollitia exercitationem.', '2025-06-16', '2025-06-16', 21.67, 6, 9);
CALL sp_crear_promocion('Promo 7', 'Perspiciatis eaque illum accusantium quos.', '2025-06-16', '2025-06-16', 27.1, 7, 10);
CALL sp_crear_promocion('Promo 8', 'Non velit quae quae eius.', '2025-06-16', '2025-06-16', 23.74, 15, 4);
CALL sp_crear_promocion('Promo 9', 'Voluptatum vitae saepe natus nisi eligendi placeat.', '2025-06-16', '2025-06-16', 26.62, 13, 3);
CALL sp_crear_promocion('Promo 10', 'Maxime dolores animi similique.', '2025-06-16', '2025-06-16', 27.04, 1, 3);
CALL sp_crear_promocion('Promo 11', 'Repellendus exercitationem quae placeat odit labore velit.', '2025-06-16', '2025-06-16', 23.41, 6, 7);
CALL sp_crear_promocion('Promo 12', 'Quis delectus perspiciatis excepturi at explicabo quia.', '2025-06-16', '2025-06-16', 25.06, 14, 4);
CALL sp_crear_promocion('Promo 13', 'Sint nesciunt velit.', '2025-06-16', '2025-06-16', 11.67, 13, 2);
CALL sp_crear_promocion('Promo 14', 'Sit corrupti voluptatibus.', '2025-06-16', '2025-06-16', 14.56, 1, 8);
CALL sp_crear_promocion('Promo 15', 'Occaecati debitis odio a earum quis. Nemo culpa quos quod.', '2025-06-16', '2025-06-16', 10.56, 14, 8);

INSERT INTO COMPRA_PRODUCTO (cop_fecha_compra, cop_total_compra, cop_metodo_pago, prov_id, gas_id) VALUES
('2025-06-16', 191890.7, 'Efectivo', 4, 1),
('2025-06-16', 291210.62, 'Tarjeta', 6, 5),
('2025-06-16', 356592.94, 'Tarjeta', 6, 11),
('2025-06-16', 243009.82, 'Transferencia', 14, 9),
('2025-06-16', 185967.96, 'Efectivo', 2, 15),
('2025-06-16', 390528.2, 'Efectivo', 10, 5),
('2025-06-16', 92242.3, 'Transferencia', 7, 6),
('2025-06-16', 313134.42, 'Tarjeta', 7, 10),
('2025-06-16', 394955.47, 'Efectivo', 7, 15),
('2025-06-16', 264508.17, 'Tarjeta', 1, 12),
('2025-06-16', 219538.4, 'Transferencia', 15, 13),
('2025-06-16', 252304.64, 'Transferencia', 12, 12),
('2025-06-16', 294601.12, 'Tarjeta', 7, 2),
('2025-06-16', 383639.84, 'Tarjeta', 10, 6),
('2025-06-16', 292283.99, 'Efectivo', 12, 15);
INSERT INTO DETALLE_COMPRA (com_id, prod_id, dec_cantidad, dec_precio_unitario) VALUES
(1, 5, 9, 19278.54),
(2, 7, 6, 22072.01),
(3, 5, 9, 13818.63),
(4, 7, 7, 30319.54),
(5, 15, 3, 28465.45),
(6, 5, 7, 26438.12),
(7, 1, 5, 18607.41),
(8, 7, 10, 28199.85),
(9, 6, 8, 23253.58),
(10, 11, 4, 25335.22),
(11, 13, 3, 29765.52),
(12, 5, 9, 29915.62),
(13, 10, 6, 12801.62),
(14, 13, 4, 30183.87),
(15, 4, 4, 14420.62);
INSERT INTO INVENTARIO (inv_fecha_actualizacion, prod_id, inv_cantidad_actual, inv_observaciones) VALUES
('2025-06-16', 1, 2, 'Comprar más producto'),
('2025-06-16', 2, 8, 'Sin observaciones'),
('2025-06-16', 3, 16, 'Sin observaciones'),
('2025-06-16', 4, 20, 'Sin observaciones'),
('2025-06-16', 5, 28, 'Sin observaciones'),
('2025-06-16', 6, 25, 'Sin observaciones'),
('2025-06-16', 7, 3, 'Sin observaciones'),
('2025-06-16', 8, 15, 'Sin observaciones'),
('2025-06-16', 9, 14, 'Sin observaciones'),

INSERT INTO HORARIO_EMPLEADO (hor_dia_semana, hor_hora_entrada, hor_hora_salida, emp_id) VALUES
('Jueves', '13:26:48', '06:05:58', 8),
('Jueves', '08:08:11', '16:23:05', 4),
('Martes', '21:15:40', '09:22:18', 11),
('Sabado', '05:20:19', '01:08:13', 1),
('Lunes', '02:25:04', '13:02:10', 13),
('Jueves', '22:43:11', '20:20:46', 4),
('Martes', '00:25:37', '19:02:08', 13),
('Sabado', '15:39:12', '04:59:01', 9),
('Jueves', '11:17:00', '17:23:55', 1),
('Viernes', '20:12:14', '23:14:46', 4),
('Lunes', '14:53:09', '13:36:19', 8),
('Martes', '22:11:49', '00:12:26', 13),
('Jueves', '06:17:54', '02:41:44', 11),
('Viernes', '19:14:30', '17:21:05', 9),
('Viernes', '12:58:57', '08:00:41', 6);
INSERT INTO HISTORIAL_CITA (his_observaciones, cit_id) VALUES
('Sin observaciones posteriores', 13),
('Sin observaciones posteriores', 15),
('Sin observaciones posteriores', 8),
('Sin observaciones posteriores', 10),
('Tener cuidado con el uso excesivo de producto', 14),
('Sin observaciones posteriores', 12),
('Sin observaciones posteriores', 15),
('Sin observaciones posteriores', 9),
('Sin observaciones posteriores', 7),
('Sin observaciones posteriores', 14),
('El empleado debe tener mayor puntualidad durante la prestación del servicio', 15),
('Sin observaciones posteriores', 9),
('Sin observaciones posteriores', 8),
('Sin observaciones posteriores', 15),
('Sin observaciones posteriores', 3);





-- Log table creation completion
INSERT IGNORE INTO salondb.db_initialization_log (script_name, status) 
VALUES ('06_insert_mock_data.sql', 'SUCCESS');
