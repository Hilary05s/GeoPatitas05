-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: geopatitas
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `geopatitas`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `geopatitas` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;

USE `geopatitas`;

--
-- Table structure for table `adopciones`
--

DROP TABLE IF EXISTS `adopciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `adopciones` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `reporte_id` int(10) unsigned DEFAULT NULL,
  `nombre` varchar(60) NOT NULL,
  `sexo` enum('hembra','macho','desconocido') NOT NULL DEFAULT 'desconocido',
  `edad` enum('cachorro','adulto','mayor') NOT NULL,
  `tamano` enum('pequeno','mediano','grande') NOT NULL,
  `descripcion` text DEFAULT NULL,
  `foto_url` varchar(500) DEFAULT NULL,
  `foto_id` varchar(200) DEFAULT NULL,
  `responsable` varchar(100) NOT NULL,
  `contacto_responsable` varchar(150) NOT NULL,
  `estado` enum('disponible','en_proceso','adoptado') NOT NULL DEFAULT 'disponible',
  `estado_moderacion` enum('pendiente','aprobado','eliminado') NOT NULL DEFAULT 'pendiente',
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_adopciones_reporte` (`reporte_id`),
  KEY `idx_adopciones_lista` (`estado_moderacion`,`estado`),
  CONSTRAINT `fk_adopciones_reporte` FOREIGN KEY (`reporte_id`) REFERENCES `reportes` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adopciones`
--

LOCK TABLES `adopciones` WRITE;
/*!40000 ALTER TABLE `adopciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `adopciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `aliados`
--

DROP TABLE IF EXISTS `aliados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `aliados` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(120) NOT NULL,
  `tipo` enum('veterinaria','negocio') NOT NULL,
  `direccion` varchar(200) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `logo_url` varchar(500) DEFAULT NULL,
  `promocion` varchar(255) DEFAULT NULL,
  `patrocinio_inicio` date DEFAULT NULL,
  `patrocinio_fin` date DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  CONSTRAINT `chk_aliados_fechas` CHECK (`patrocinio_fin` is null or `patrocinio_inicio` is null or `patrocinio_fin` >= `patrocinio_inicio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `aliados`
--

LOCK TABLES `aliados` WRITE;
/*!40000 ALTER TABLE `aliados` DISABLE KEYS */;
/*!40000 ALTER TABLE `aliados` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `avisos`
--

DROP TABLE IF EXISTS `avisos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `avisos` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `tipo` enum('ayuda','atendido','aliado') NOT NULL,
  `reporte_id` int(10) unsigned DEFAULT NULL,
  `mensaje` text DEFAULT NULL,
  `contacto` varchar(150) NOT NULL,
  `ip_hash` char(64) DEFAULT NULL,
  `revisado` tinyint(1) NOT NULL DEFAULT 0,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_avisos_reporte` (`reporte_id`),
  KEY `idx_avisos_pendientes` (`revisado`,`tipo`),
  CONSTRAINT `fk_avisos_reporte` FOREIGN KEY (`reporte_id`) REFERENCES `reportes` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `avisos`
--

LOCK TABLES `avisos` WRITE;
/*!40000 ALTER TABLE `avisos` DISABLE KEYS */;
/*!40000 ALTER TABLE `avisos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `moderaciones`
--

DROP TABLE IF EXISTS `moderaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `moderaciones` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `reporte_id` int(10) unsigned DEFAULT NULL,
  `adopcion_id` int(10) unsigned DEFAULT NULL,
  `moderador_id` int(10) unsigned NOT NULL,
  `accion` enum('aprobar','eliminar') NOT NULL,
  `motivo` enum('falso','duplicado','ofensivo','fuera_de_tema','otro') DEFAULT NULL,
  `nota` varchar(255) DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_moderaciones_reporte` (`reporte_id`),
  KEY `fk_moderaciones_adopcion` (`adopcion_id`),
  KEY `fk_moderaciones_moderador` (`moderador_id`),
  CONSTRAINT `fk_moderaciones_adopcion` FOREIGN KEY (`adopcion_id`) REFERENCES `adopciones` (`id`),
  CONSTRAINT `fk_moderaciones_moderador` FOREIGN KEY (`moderador_id`) REFERENCES `moderadores` (`id`),
  CONSTRAINT `fk_moderaciones_reporte` FOREIGN KEY (`reporte_id`) REFERENCES `reportes` (`id`),
  CONSTRAINT `chk_moderaciones_objetivo` CHECK (`reporte_id` is null <> (`adopcion_id` is null)),
  CONSTRAINT `chk_moderaciones_motivo` CHECK (`accion` = 'aprobar' or `motivo` is not null)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `moderaciones`
--

LOCK TABLES `moderaciones` WRITE;
/*!40000 ALTER TABLE `moderaciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `moderaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `moderadores`
--

DROP TABLE IF EXISTS `moderadores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `moderadores` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `correo` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `rol` enum('admin','moderador') NOT NULL DEFAULT 'moderador',
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_moderadores_correo` (`correo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `moderadores`
--

LOCK TABLES `moderadores` WRITE;
/*!40000 ALTER TABLE `moderadores` DISABLE KEYS */;
/*!40000 ALTER TABLE `moderadores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reportes`
--

DROP TABLE IF EXISTS `reportes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `reportes` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `zona_id` int(10) unsigned NOT NULL,
  `nombre` varchar(60) DEFAULT NULL,
  `raza_aprox` varchar(60) DEFAULT NULL,
  `color` varchar(60) NOT NULL,
  `tamano` enum('pequeno','mediano','grande') NOT NULL,
  `es_cachorro` tinyint(1) NOT NULL DEFAULT 0,
  `salud` enum('sano','herido','enfermo','desnutrido','en_peligro') NOT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha_avistamiento` date NOT NULL,
  `foto_url` varchar(500) DEFAULT NULL,
  `foto_id` varchar(200) DEFAULT NULL,
  `contacto` varchar(150) DEFAULT NULL,
  `ip_hash` char(64) DEFAULT NULL,
  `estado_moderacion` enum('pendiente','aprobado','eliminado') NOT NULL DEFAULT 'pendiente',
  `estado_caso` enum('necesita_ayuda','en_seguimiento','atendido') NOT NULL DEFAULT 'necesita_ayuda',
  `duplicado_de` int(10) unsigned DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_reportes_zona` (`zona_id`),
  KEY `fk_reportes_duplicado` (`duplicado_de`),
  KEY `idx_reportes_mapa` (`estado_moderacion`,`zona_id`),
  KEY `idx_reportes_caso` (`estado_caso`),
  KEY `idx_reportes_fecha` (`creado_en`),
  KEY `idx_reportes_ip` (`ip_hash`,`creado_en`),
  CONSTRAINT `fk_reportes_duplicado` FOREIGN KEY (`duplicado_de`) REFERENCES `reportes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_reportes_zona` FOREIGN KEY (`zona_id`) REFERENCES `zonas` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reportes`
--

LOCK TABLES `reportes` WRITE;
/*!40000 ALTER TABLE `reportes` DISABLE KEYS */;
/*!40000 ALTER TABLE `reportes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seguimiento`
--

DROP TABLE IF EXISTS `seguimiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `seguimiento` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `reporte_id` int(10) unsigned NOT NULL,
  `moderador_id` int(10) unsigned DEFAULT NULL,
  `estado_anterior` enum('necesita_ayuda','en_seguimiento','atendido') DEFAULT NULL,
  `estado_nuevo` enum('necesita_ayuda','en_seguimiento','atendido') NOT NULL,
  `nota` varchar(255) DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_seguimiento_moderador` (`moderador_id`),
  KEY `idx_seguimiento_reporte` (`reporte_id`,`creado_en`),
  CONSTRAINT `fk_seguimiento_moderador` FOREIGN KEY (`moderador_id`) REFERENCES `moderadores` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_seguimiento_reporte` FOREIGN KEY (`reporte_id`) REFERENCES `reportes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seguimiento`
--

LOCK TABLES `seguimiento` WRITE;
/*!40000 ALTER TABLE `seguimiento` DISABLE KEYS */;
/*!40000 ALTER TABLE `seguimiento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary table structure for view `v_adopciones_publicas`
--

DROP TABLE IF EXISTS `v_adopciones_publicas`;
/*!50001 DROP VIEW IF EXISTS `v_adopciones_publicas`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `v_adopciones_publicas` AS SELECT
 1 AS `id`,
  1 AS `nombre`,
  1 AS `sexo`,
  1 AS `edad`,
  1 AS `tamano`,
  1 AS `descripcion`,
  1 AS `foto_url`,
  1 AS `estado`,
  1 AS `creado_en` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_estadisticas`
--

DROP TABLE IF EXISTS `v_estadisticas`;
/*!50001 DROP VIEW IF EXISTS `v_estadisticas`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `v_estadisticas` AS SELECT
 1 AS `perritos_reportados`,
  1 AS `casos_atendidos`,
  1 AS `reportes_semana` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_reportes_por_zona`
--

DROP TABLE IF EXISTS `v_reportes_por_zona`;
/*!50001 DROP VIEW IF EXISTS `v_reportes_por_zona`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `v_reportes_por_zona` AS SELECT
 1 AS `id`,
  1 AS `nombre`,
  1 AS `total`,
  1 AS `necesitan_ayuda`,
  1 AS `urgentes` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_reportes_publicos`
--

DROP TABLE IF EXISTS `v_reportes_publicos`;
/*!50001 DROP VIEW IF EXISTS `v_reportes_publicos`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `v_reportes_publicos` AS SELECT
 1 AS `id`,
  1 AS `folio`,
  1 AS `nombre`,
  1 AS `raza_aprox`,
  1 AS `color`,
  1 AS `tamano`,
  1 AS `es_cachorro`,
  1 AS `salud`,
  1 AS `descripcion`,
  1 AS `fecha_avistamiento`,
  1 AS `foto_url`,
  1 AS `estado_caso`,
  1 AS `creado_en`,
  1 AS `zona_id`,
  1 AS `zona`,
  1 AS `lat_centro`,
  1 AS `lng_centro` */;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `zonas`
--

DROP TABLE IF EXISTS `zonas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `zonas` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `lat_centro` decimal(9,6) NOT NULL,
  `lng_centro` decimal(9,6) NOT NULL,
  `activa` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_zonas_nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `zonas`
--

LOCK TABLES `zonas` WRITE;
/*!40000 ALTER TABLE `zonas` DISABLE KEYS */;
INSERT INTO `zonas` VALUES (1,'Centro',21.811000,-105.209000,1),(2,'Zona norte',21.818000,-105.209000,1),(3,'Zona sur',21.804000,-105.209000,1),(4,'Zona poniente',21.811000,-105.216000,1),(5,'Zona oriente',21.811000,-105.202000,1);
/*!40000 ALTER TABLE `zonas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Current Database: `geopatitas`
--

USE `geopatitas`;

--
-- Final view structure for view `v_adopciones_publicas`
--

/*!50001 DROP VIEW IF EXISTS `v_adopciones_publicas`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_adopciones_publicas` AS select `adopciones`.`id` AS `id`,`adopciones`.`nombre` AS `nombre`,`adopciones`.`sexo` AS `sexo`,`adopciones`.`edad` AS `edad`,`adopciones`.`tamano` AS `tamano`,`adopciones`.`descripcion` AS `descripcion`,`adopciones`.`foto_url` AS `foto_url`,`adopciones`.`estado` AS `estado`,`adopciones`.`creado_en` AS `creado_en` from `adopciones` where `adopciones`.`estado_moderacion` = 'aprobado' and `adopciones`.`estado` <> 'adoptado' */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_estadisticas`
--

/*!50001 DROP VIEW IF EXISTS `v_estadisticas`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_estadisticas` AS select count(0) AS `perritos_reportados`,sum(`reportes`.`estado_caso` = 'atendido') AS `casos_atendidos`,sum(`reportes`.`creado_en` >= current_timestamp() - interval 7 day) AS `reportes_semana` from `reportes` where `reportes`.`estado_moderacion` = 'aprobado' */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_reportes_por_zona`
--

/*!50001 DROP VIEW IF EXISTS `v_reportes_por_zona`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_reportes_por_zona` AS select `z`.`id` AS `id`,`z`.`nombre` AS `nombre`,count(`r`.`id`) AS `total`,coalesce(sum(`r`.`estado_caso` = 'necesita_ayuda'),0) AS `necesitan_ayuda`,coalesce(sum(`r`.`salud` in ('herido','enfermo','en_peligro')),0) AS `urgentes` from (`zonas` `z` left join `reportes` `r` on(`r`.`zona_id` = `z`.`id` and `r`.`estado_moderacion` = 'aprobado')) group by `z`.`id`,`z`.`nombre` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_reportes_publicos`
--

/*!50001 DROP VIEW IF EXISTS `v_reportes_publicos`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_reportes_publicos` AS select `r`.`id` AS `id`,lpad(`r`.`id`,4,'0') AS `folio`,`r`.`nombre` AS `nombre`,`r`.`raza_aprox` AS `raza_aprox`,`r`.`color` AS `color`,`r`.`tamano` AS `tamano`,`r`.`es_cachorro` AS `es_cachorro`,`r`.`salud` AS `salud`,`r`.`descripcion` AS `descripcion`,`r`.`fecha_avistamiento` AS `fecha_avistamiento`,`r`.`foto_url` AS `foto_url`,`r`.`estado_caso` AS `estado_caso`,`r`.`creado_en` AS `creado_en`,`z`.`id` AS `zona_id`,`z`.`nombre` AS `zona`,`z`.`lat_centro` AS `lat_centro`,`z`.`lng_centro` AS `lng_centro` from (`reportes` `r` join `zonas` `z` on(`z`.`id` = `r`.`zona_id`)) where `r`.`estado_moderacion` = 'aprobado' */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-22 17:32:28
