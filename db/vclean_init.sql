-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               10.4.22-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             11.3.0.6295
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for vclean
CREATE DATABASE IF NOT EXISTS `vclean` /*!40100 DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci */;
USE `vclean`;

CREATE DATABASE vclean;

-- Dumping structure for table vclean.tbl_group
CREATE TABLE IF NOT EXISTS `tbl_group` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `desc` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `reg_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `update_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table vclean.tbl_group: ~0 rows (approximately)
/*!40000 ALTER TABLE `tbl_group` DISABLE KEYS */;
/*!40000 ALTER TABLE `tbl_group` ENABLE KEYS */;

-- Dumping structure for table vclean.tbl_group_charge_station
CREATE TABLE IF NOT EXISTS `tbl_group_charge_station` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `gid` int(11) NOT NULL DEFAULT 0,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `address` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `location` text COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `fk_tbl_group_charge_station_tbl_group1_idx` (`gid`),
  CONSTRAINT `fk_tbl_group_charge_station_tbl_group1` FOREIGN KEY (`gid`) REFERENCES `tbl_group` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table vclean.tbl_group_charge_station: ~0 rows (approximately)
/*!40000 ALTER TABLE `tbl_group_charge_station` DISABLE KEYS */;
/*!40000 ALTER TABLE `tbl_group_charge_station` ENABLE KEYS */;

-- Dumping structure for table vclean.tbl_group_garage
CREATE TABLE IF NOT EXISTS `tbl_group_garage` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `gid` int(11) NOT NULL DEFAULT 0,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `address` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `location` text COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `fk_tbl_group_garage_tbl_group1_idx` (`gid`),
  CONSTRAINT `fk_tbl_group_garage_tbl_group1` FOREIGN KEY (`gid`) REFERENCES `tbl_group` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table vclean.tbl_group_garage: ~0 rows (approximately)
/*!40000 ALTER TABLE `tbl_group_garage` DISABLE KEYS */;
/*!40000 ALTER TABLE `tbl_group_garage` ENABLE KEYS */;

-- Dumping structure for table vclean.tbl_route
CREATE TABLE IF NOT EXISTS `tbl_route` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `gid` int(11) NOT NULL DEFAULT 0,
  `name` int(11) NOT NULL DEFAULT 0,
  `start_point` text COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `end_point` text COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `area` longtext COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `fk_tbl_route_tbl_group1_idx` (`gid`),
  CONSTRAINT `fk_tbl_route_tbl_group1` FOREIGN KEY (`gid`) REFERENCES `tbl_group` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table vclean.tbl_route: ~0 rows (approximately)
/*!40000 ALTER TABLE `tbl_route` DISABLE KEYS */;
/*!40000 ALTER TABLE `tbl_route` ENABLE KEYS */;

-- Dumping structure for table vclean.tbl_route_detail
CREATE TABLE IF NOT EXISTS `tbl_route_detail` (
  `rid` int(11) NOT NULL DEFAULT 0,
  `vid` int(11) NOT NULL DEFAULT 0,
  `charge_id` int(11) NOT NULL DEFAULT 0,
  `garage_id` int(11) NOT NULL DEFAULT 0,
  `clean_start_time` int(11) NOT NULL DEFAULT 0,
  `clean_end_time` int(11) NOT NULL DEFAULT 0,
  `estimated_time` int(11) NOT NULL DEFAULT 0,
  KEY `fk_tbl_route_detail_tbl_route1_idx` (`rid`),
  KEY `fk_tbl_route_detail_tbl_vehicle1_idx` (`vid`),
  CONSTRAINT `fk_tbl_route_detail_tbl_route1` FOREIGN KEY (`rid`) REFERENCES `tbl_route` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_tbl_route_detail_tbl_vehicle1` FOREIGN KEY (`vid`) REFERENCES `tbl_vehicle` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table vclean.tbl_route_detail: ~0 rows (approximately)
/*!40000 ALTER TABLE `tbl_route_detail` DISABLE KEYS */;
/*!40000 ALTER TABLE `tbl_route_detail` ENABLE KEYS */;

-- Dumping structure for table vclean.tbl_syslog
CREATE TABLE IF NOT EXISTS `tbl_syslog` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `logcode` int(11) NOT NULL DEFAULT 0,
  `logsubcode` int(11) NOT NULL DEFAULT 0,
  `logtype` int(11) NOT NULL DEFAULT 0,
  `vid` int(11) NOT NULL DEFAULT 0,
  `uid` int(11) NOT NULL DEFAULT 0,
  `logdate` timestamp NOT NULL DEFAULT current_timestamp(),
  `logtimestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table vclean.tbl_syslog: ~0 rows (approximately)
/*!40000 ALTER TABLE `tbl_syslog` DISABLE KEYS */;
/*!40000 ALTER TABLE `tbl_syslog` ENABLE KEYS */;

-- Dumping structure for table vclean.tbl_user
CREATE TABLE IF NOT EXISTS `tbl_user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userid` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `pwd` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `role` int(11) NOT NULL DEFAULT 0,
  `state` int(11) NOT NULL DEFAULT 0,
  `last_login` timestamp NULL DEFAULT NULL,
  `last_logout` timestamp NULL DEFAULT NULL,
  `reg_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `update_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_tbl_user_tbl_user_role_idx` (`role`),
  CONSTRAINT `fk_tbl_user_tbl_user_role` FOREIGN KEY (`role`) REFERENCES `tbl_user_role` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table vclean.tbl_user: ~0 rows (approximately)
/*!40000 ALTER TABLE `tbl_user` DISABLE KEYS */;
INSERT INTO `tbl_user` (`id`, `userid`, `name`, `pwd`, `email`, `phone`, `role`, `state`, `last_login`, `last_logout`, `reg_date`, `update_date`) VALUES
	(1, 'root', 'Root', '*81F5E21E35407D884A6CD4A731AEBFB6AF209E1B', '', '', 1, 0, NULL, NULL, '2021-12-16 16:45:02', '2021-12-16 16:45:40');
/*!40000 ALTER TABLE `tbl_user` ENABLE KEYS */;

-- Dumping structure for table vclean.tbl_user_group
CREATE TABLE IF NOT EXISTS `tbl_user_group` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `gid` int(11) NOT NULL DEFAULT 0,
  `uid` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `fk_tbl_user_group_tbl_user1_idx` (`uid`),
  KEY `fk_tbl_user_group_tbl_group1_idx` (`gid`),
  CONSTRAINT `fk_tbl_user_group_tbl_group1` FOREIGN KEY (`gid`) REFERENCES `tbl_group` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_tbl_user_group_tbl_user1` FOREIGN KEY (`uid`) REFERENCES `tbl_user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table vclean.tbl_user_group: ~0 rows (approximately)
/*!40000 ALTER TABLE `tbl_user_group` DISABLE KEYS */;
/*!40000 ALTER TABLE `tbl_user_group` ENABLE KEYS */;

-- Dumping structure for table vclean.tbl_user_role
CREATE TABLE IF NOT EXISTS `tbl_user_role` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `desc` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table vclean.tbl_user_role: ~0 rows (approximately)
/*!40000 ALTER TABLE `tbl_user_role` DISABLE KEYS */;
INSERT INTO `tbl_user_role` (`id`, `name`, `desc`) VALUES
	(1, 'Super Administrator', ''),
	(2, 'Administrator', ''),
	(3, 'User', '');
/*!40000 ALTER TABLE `tbl_user_role` ENABLE KEYS */;

-- Dumping structure for table vclean.tbl_user_token
CREATE TABLE IF NOT EXISTS `tbl_user_token` (
  `uid` int(11) NOT NULL DEFAULT 0,
  `token` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `refresh_token` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `last_login_ip` int(11) NOT NULL DEFAULT 0,
  `reg_date` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`uid`),
  CONSTRAINT `fk_tbl_user_token_tbl_user1` FOREIGN KEY (`uid`) REFERENCES `tbl_user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table vclean.tbl_user_token: ~0 rows (approximately)
/*!40000 ALTER TABLE `tbl_user_token` DISABLE KEYS */;
/*!40000 ALTER TABLE `tbl_user_token` ENABLE KEYS */;

-- Dumping structure for table vclean.tbl_vehicle
CREATE TABLE IF NOT EXISTS `tbl_vehicle` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `vcode` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `type` int(11) NOT NULL DEFAULT 0,
  `model` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `myear` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `state` int(11) NOT NULL DEFAULT 0,
  `latitude` double NOT NULL DEFAULT 0,
  `longtitude` double NOT NULL DEFAULT 0,
  `voltage` float NOT NULL DEFAULT 0,
  `garbage` int(11) NOT NULL DEFAULT 0,
  `battery` int(11) NOT NULL DEFAULT 0,
  `reg_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `update_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_tbl_vehicle_tbl_vehicle_type1_idx` (`type`),
  CONSTRAINT `fk_tbl_vehicle_tbl_vehicle_type1` FOREIGN KEY (`type`) REFERENCES `tbl_vehicle_type` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table vclean.tbl_vehicle: ~0 rows (approximately)
/*!40000 ALTER TABLE `tbl_vehicle` DISABLE KEYS */;
/*!40000 ALTER TABLE `tbl_vehicle` ENABLE KEYS */;

-- Dumping structure for table vclean.tbl_vehicle_group
CREATE TABLE IF NOT EXISTS `tbl_vehicle_group` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `gid` int(11) NOT NULL DEFAULT 0,
  `vid` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `fk_tbl_vehicle_group_tbl_group1_idx` (`gid`),
  KEY `fk_tbl_vehicle_group_tbl_vehicle1_idx` (`vid`),
  CONSTRAINT `fk_tbl_vehicle_group_tbl_group1` FOREIGN KEY (`gid`) REFERENCES `tbl_group` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_tbl_vehicle_group_tbl_vehicle1` FOREIGN KEY (`vid`) REFERENCES `tbl_vehicle` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table vclean.tbl_vehicle_group: ~0 rows (approximately)
/*!40000 ALTER TABLE `tbl_vehicle_group` DISABLE KEYS */;
/*!40000 ALTER TABLE `tbl_vehicle_group` ENABLE KEYS */;

-- Dumping structure for table vclean.tbl_vehicle_log
CREATE TABLE IF NOT EXISTS `tbl_vehicle_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `log_date` int(11) NOT NULL DEFAULT 0,
  `log_code` int(11) NOT NULL DEFAULT 0 COMMENT '''run'',''stop'',''cancelstop'',''end'',''off'',''clean''',
  `vid` int(11) NOT NULL DEFAULT 0,
  `rid` int(11) NOT NULL DEFAULT 0 COMMENT 'route id',
  `vstate` int(11) NOT NULL DEFAULT 0 COMMENT '''move'',''clean'',''normal''',
  `speed` int(11) NOT NULL DEFAULT 0,
  `latitude` double NOT NULL DEFAULT 0,
  `longtitude` double NOT NULL DEFAULT 0,
  `voltage` float NOT NULL DEFAULT 0,
  `garbage` int(11) NOT NULL DEFAULT 0,
  `battery` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `fk_tbl_vehicle_log_tbl_vehicle1_idx` (`vid`),
  KEY `fk_tbl_vehicle_log_tbl_route1_idx` (`rid`),
  CONSTRAINT `fk_tbl_vehicle_log_tbl_route1` FOREIGN KEY (`rid`) REFERENCES `tbl_route` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_tbl_vehicle_log_tbl_vehicle1` FOREIGN KEY (`vid`) REFERENCES `tbl_vehicle` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table vclean.tbl_vehicle_log: ~0 rows (approximately)
/*!40000 ALTER TABLE `tbl_vehicle_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `tbl_vehicle_log` ENABLE KEYS */;

-- Dumping structure for table vclean.tbl_vehicle_type
CREATE TABLE IF NOT EXISTS `tbl_vehicle_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `desc` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table vclean.tbl_vehicle_type: ~0 rows (approximately)
/*!40000 ALTER TABLE `tbl_vehicle_type` DISABLE KEYS */;
/*!40000 ALTER TABLE `tbl_vehicle_type` ENABLE KEYS */;

-- Dumping structure for table vclean.tbl_vehicle_video
CREATE TABLE IF NOT EXISTS `tbl_vehicle_video` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `vid` int(11) NOT NULL DEFAULT 0,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `length` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `start_time` timestamp NOT NULL DEFAULT current_timestamp(),
  `end_time` timestamp NOT NULL DEFAULT 0,
  `reg_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  PRIMARY KEY (`id`),
  KEY `fk_tbl_vehicle_video_tbl_vehicle1_idx` (`vid`),
  CONSTRAINT `fk_tbl_vehicle_video_tbl_vehicle1` FOREIGN KEY (`vid`) REFERENCES `tbl_vehicle` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table vclean.tbl_vehicle_video: ~0 rows (approximately)
/*!40000 ALTER TABLE `tbl_vehicle_video` DISABLE KEYS */;
/*!40000 ALTER TABLE `tbl_vehicle_video` ENABLE KEYS */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
