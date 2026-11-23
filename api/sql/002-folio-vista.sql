-- =====================================================================
-- GeoPatitas · Cambio 002: folio sin recortes en v_reportes_publicos
--
-- Orden de ejecución: 1) geopatitas.sql  2) 002-folio-vista.sql
--
-- Problema: la vista calculaba el folio con LPAD(id, 4, '0'). En MySQL/MariaDB,
-- LPAD RECORTA el texto si es más largo que el tamaño pedido, así que el
-- reporte 12345 tenía folio "1234" (igual que el reporte 1234).
--
-- Solución: rellenar con ceros hasta 4 dígitos como mínimo, sin recortar:
--   7 → "0007"   ·   142 → "0142"   ·   12345 → "12345"
--
-- Solo recrea la vista. No cambia tablas ni datos. Se puede ejecutar varias veces.
-- Las columnas y su orden son exactamente las mismas que en geopatitas.sql.
-- =====================================================================

USE `geopatitas`;

CREATE OR REPLACE
  ALGORITHM = UNDEFINED
  SQL SECURITY DEFINER
VIEW `v_reportes_publicos` AS
SELECT
  `r`.`id`                                                   AS `id`,
  LPAD(`r`.`id`, GREATEST(4, CHAR_LENGTH(`r`.`id`)), '0')    AS `folio`,
  `r`.`nombre`                                               AS `nombre`,
  `r`.`raza_aprox`                                           AS `raza_aprox`,
  `r`.`color`                                                AS `color`,
  `r`.`tamano`                                               AS `tamano`,
  `r`.`es_cachorro`                                          AS `es_cachorro`,
  `r`.`salud`                                                AS `salud`,
  `r`.`descripcion`                                          AS `descripcion`,
  `r`.`fecha_avistamiento`                                   AS `fecha_avistamiento`,
  `r`.`foto_url`                                             AS `foto_url`,
  `r`.`estado_caso`                                          AS `estado_caso`,
  `r`.`creado_en`                                            AS `creado_en`,
  `z`.`id`                                                   AS `zona_id`,
  `z`.`nombre`                                               AS `zona`,
  `z`.`lat_centro`                                           AS `lat_centro`,
  `z`.`lng_centro`                                           AS `lng_centro`
FROM `reportes` `r`
JOIN `zonas` `z` ON `z`.`id` = `r`.`zona_id`
WHERE `r`.`estado_moderacion` = 'aprobado';
