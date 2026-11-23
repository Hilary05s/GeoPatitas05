-- =====================================================================
-- GeoPatitas · DATOS DE PRUEBA (ficticios)
--
-- ⚠️  SOLO PARA DESARROLLO LOCAL. NUNCA CARGAR EN PRODUCCIÓN.
--
-- - Requiere haber cargado antes geopatitas.sql (usa las zonas 1 a 5).
-- - Solo contiene INSERT: no cambia la estructura de la base.
-- - Todos los ids empiezan en 9001 para distinguirlos de datos reales.
--   Por eso, en local, los siguientes reportes que crees tendrán ids > 9000.
-- - Usa INSERT IGNORE: se puede cargar dos veces sin duplicar filas.
-- - Correos con dominio .invalid y teléfonos 555-000-xxxx: no existen.
-- - El moderador de prueba está INACTIVO y su contraseña no es un hash
--   válido: no se puede iniciar sesión con él. Solo existe porque
--   `moderaciones` y `seguimiento` necesitan un moderador.
--
-- Cargar (XAMPP):  C:\xampp\mysql\bin\mysql.exe -u root geopatitas < sql/datos-prueba.sql
--   o en phpMyAdmin → base geopatitas → Importar.
-- =====================================================================

SET NAMES utf8mb4;

-- ---------------------------------------------------------------------
-- Moderador de prueba (inactivo, sin acceso)
-- ---------------------------------------------------------------------
INSERT IGNORE INTO moderadores (id, nombre, correo, password_hash, rol, activo) VALUES
  (9001, 'Moderador de prueba', 'moderador.prueba@geopatitas.invalid', '!SIN-ACCESO-datos-de-prueba', 'moderador', 0);

-- ---------------------------------------------------------------------
-- Reportes
--   9001-9006 aprobados (aparecen en el mapa)
--   9007-9008 pendientes (solo en moderación)
--   9009      eliminado por duplicado de 9002 (no aparece en ningún lado)
-- ---------------------------------------------------------------------
INSERT IGNORE INTO reportes
  (id, zona_id, nombre, raza_aprox, color, tamano, es_cachorro, salud, descripcion,
   fecha_avistamiento, foto_url, foto_id, contacto, ip_hash,
   estado_moderacion, estado_caso, duplicado_de, creado_en)
VALUES
  (9001, 2, NULL, 'Mestizo', 'Café con blanco', 'mediano', 0, 'herido',
   '[PRUEBA] Herida leve en una pata. Collar azul gastado, oreja izquierda caída.',
   CURDATE() - INTERVAL 1 DAY, NULL, NULL, '555-000-0001 (ficticio)', NULL,
   'aprobado', 'necesita_ayuda', NULL, NOW() - INTERVAL 2 HOUR),

  (9002, 2, NULL, NULL, 'Negro', 'grande', 0, 'desnutrido',
   '[PRUEBA] Se ve desnutrido. Collar rojo, muy tranquilo.',
   CURDATE() - INTERVAL 2 DAY, NULL, NULL, NULL, NULL,
   'aprobado', 'necesita_ayuda', NULL, NOW() - INTERVAL 1 DAY),

  (9003, 1, 'Manchitas (prueba)', 'Mestizo', 'Blanco con manchas cafés', 'pequeno', 0, 'sano',
   '[PRUEBA] Asustadizo, cola corta.',
   CURDATE() - INTERVAL 2 DAY, NULL, NULL, NULL, NULL,
   'aprobado', 'en_seguimiento', NULL, NOW() - INTERVAL 30 HOUR),

  (9004, 1, NULL, NULL, 'Canela', 'pequeno', 1, 'en_peligro',
   '[PRUEBA] Cachorro solo, posible abandono. Sin collar.',
   CURDATE(), NULL, NULL, '555-000-0004 (ficticio)', NULL,
   'aprobado', 'necesita_ayuda', NULL, NOW() - INTERVAL 5 HOUR),

  (9005, 3, NULL, 'Mestizo', 'Canela', 'mediano', 0, 'sano',
   '[PRUEBA] Atendido por veterinaria aliada. Mancha blanca en el pecho.',
   CURDATE() - INTERVAL 20 DAY, NULL, NULL, NULL, NULL,
   'aprobado', 'atendido', NULL, NOW() - INTERVAL 20 DAY),

  (9006, 3, NULL, NULL, 'Gris', 'grande', 0, 'enfermo',
   '[PRUEBA] Cojea un poco. Pelo largo, collar café.',
   CURDATE() - INTERVAL 3 DAY, NULL, NULL, NULL, NULL,
   'aprobado', 'en_seguimiento', NULL, NOW() - INTERVAL 3 DAY),

  (9007, 4, NULL, NULL, 'Blanco', 'mediano', 0, 'sano',
   '[PRUEBA] Pendiente de moderación.',
   CURDATE(), NULL, NULL, 'prueba.pendiente@geopatitas.invalid', NULL,
   'pendiente', 'necesita_ayuda', NULL, NOW() - INTERVAL 20 MINUTE),

  (9008, 1, NULL, NULL, 'Café', 'pequeno', 1, 'desnutrido',
   '[PRUEBA] Tres cachorros cafés. Pendiente de moderación.',
   CURDATE(), NULL, NULL, NULL, NULL,
   'pendiente', 'necesita_ayuda', NULL, NOW() - INTERVAL 1 HOUR),

  (9009, 2, NULL, NULL, 'Negro', 'grande', 0, 'desnutrido',
   '[PRUEBA] Duplicado del reporte 9002.',
   CURDATE() - INTERVAL 1 DAY, NULL, NULL, NULL, NULL,
   'eliminado', 'necesita_ayuda', 9002, NOW() - INTERVAL 3 HOUR);

-- ---------------------------------------------------------------------
-- Bitácora de moderación
-- ---------------------------------------------------------------------
INSERT IGNORE INTO moderaciones (id, reporte_id, adopcion_id, moderador_id, accion, motivo, nota, creado_en) VALUES
  (9001, 9001, NULL, 9001, 'aprobar',  NULL,        NULL, NOW() - INTERVAL 90 MINUTE),
  (9002, 9002, NULL, 9001, 'aprobar',  NULL,        NULL, NOW() - INTERVAL 23 HOUR),
  (9003, 9003, NULL, 9001, 'aprobar',  NULL,        NULL, NOW() - INTERVAL 29 HOUR),
  (9004, 9004, NULL, 9001, 'aprobar',  NULL,        NULL, NOW() - INTERVAL 4 HOUR),
  (9005, 9005, NULL, 9001, 'aprobar',  NULL,        NULL, NOW() - INTERVAL 20 DAY),
  (9006, 9006, NULL, 9001, 'aprobar',  NULL,        NULL, NOW() - INTERVAL 3 DAY),
  (9007, 9009, NULL, 9001, 'eliminar', 'duplicado', '[PRUEBA] Mismo perrito que el 9002', NOW() - INTERVAL 2 HOUR);

-- ---------------------------------------------------------------------
-- Seguimiento de casos (línea de tiempo de la ficha)
-- ---------------------------------------------------------------------
INSERT IGNORE INTO seguimiento (id, reporte_id, moderador_id, estado_anterior, estado_nuevo, nota, creado_en) VALUES
  (9001, 9003, 9001, 'necesita_ayuda', 'en_seguimiento', '[PRUEBA] Una rescatista lo está alimentando.', NOW() - INTERVAL 20 HOUR),
  (9002, 9005, 9001, 'necesita_ayuda', 'en_seguimiento', '[PRUEBA] Llevado a valoración.',              NOW() - INTERVAL 18 DAY),
  (9003, 9005, 9001, 'en_seguimiento', 'atendido',       '[PRUEBA] Vacunado y desparasitado.',          NOW() - INTERVAL 15 DAY),
  (9004, 9006, 9001, 'necesita_ayuda', 'en_seguimiento', NULL,                                           NOW() - INTERVAL 2 DAY);

-- ---------------------------------------------------------------------
-- Adopciones
--   9001-9003 aprobadas y visibles · 9004 pendiente · 9005 ya adoptada (no visible)
-- ---------------------------------------------------------------------
INSERT IGNORE INTO adopciones
  (id, reporte_id, nombre, sexo, edad, tamano, descripcion, foto_url, foto_id,
   responsable, contacto_responsable, estado, estado_moderacion, creado_en)
VALUES
  (9001, NULL, 'Canela (prueba)', 'hembra', 'adulto',   'mediano', '[PRUEBA] Cariñosa, sociable con niños.',
   NULL, NULL, 'Rescatista ficticia', 'rescate.prueba@geopatitas.invalid', 'disponible', 'aprobado', NOW() - INTERVAL 6 DAY),
  (9002, NULL, 'Bruno (prueba)',  'macho',  'adulto',   'grande',  '[PRUEBA] Tranquilo, ideal para patio amplio.',
   NULL, NULL, 'Rescatista ficticia', 'rescate.prueba@geopatitas.invalid', 'en_proceso', 'aprobado', NOW() - INTERVAL 5 DAY),
  (9003, 9005, 'Luna (prueba)',   'hembra', 'cachorro', 'pequeno', '[PRUEBA] Juguetona, ya vacunada.',
   NULL, NULL, 'Organización ficticia', '555-000-0010 (ficticio)', 'disponible', 'aprobado', NOW() - INTERVAL 2 DAY),
  (9004, NULL, 'Max (prueba)',    'macho',  'adulto',   'mediano', '[PRUEBA] Pendiente de moderación.',
   NULL, NULL, 'Rescatista ficticia', 'rescate.prueba@geopatitas.invalid', 'disponible', 'pendiente', NOW() - INTERVAL 1 HOUR),
  (9005, NULL, 'Toby (prueba)',   'macho',  'mayor',    'pequeno', '[PRUEBA] Ya fue adoptado: no debe aparecer.',
   NULL, NULL, 'Rescatista ficticia', 'rescate.prueba@geopatitas.invalid', 'adoptado', 'aprobado', NOW() - INTERVAL 30 DAY);

-- ---------------------------------------------------------------------
-- Aliados
--   9001-9002 activos y vigentes · 9003 patrocinio vencido · 9004 inactivo
-- ---------------------------------------------------------------------
INSERT IGNORE INTO aliados
  (id, nombre, tipo, direccion, telefono, logo_url, promocion, patrocinio_inicio, patrocinio_fin, activo)
VALUES
  (9001, 'Veterinaria de Prueba', 'veterinaria', 'Calle Ficticia 123, Centro', '555-000-0020', NULL,
   '[PRUEBA] 20 % de descuento en consulta para perritos rescatados', CURDATE() - INTERVAL 30 DAY, CURDATE() + INTERVAL 335 DAY, 1),
  (9002, 'Negocio de Prueba', 'negocio', 'Av. Imaginaria 45, Zona norte', NULL, NULL,
   '[PRUEBA] Un costal de croquetas al mes para rescates', NULL, NULL, 1),
  (9003, 'Veterinaria Vencida (prueba)', 'veterinaria', NULL, NULL, NULL,
   '[PRUEBA] Patrocinio vencido: no debe aparecer', CURDATE() - INTERVAL 400 DAY, CURDATE() - INTERVAL 35 DAY, 1),
  (9004, 'Negocio Inactivo (prueba)', 'negocio', NULL, NULL, NULL,
   '[PRUEBA] Inactivo: no debe aparecer', NULL, NULL, 0);
