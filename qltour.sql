CREATE DATABASE  IF NOT EXISTS `tourpro_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `tourpro_db`;
-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: tourpro_db
-- ------------------------------------------------------
-- Server version	9.3.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint DEFAULT NULL,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `action` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'CREATE, UPDATE, DELETE, LOGIN...',
  `entity_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'User, Employee, Booking...',
  `entity_id` bigint DEFAULT NULL,
  `old_value` json DEFAULT NULL COMMENT 'Giá trị trước khi thay đổi',
  `new_value` json DEFAULT NULL COMMENT 'Giá trị sau khi thay đổi',
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_user` (`user_id`),
  KEY `idx_audit_entity` (`entity_type`,`entity_id`),
  KEY `idx_audit_time` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Nhật ký thao tác hệ thống để kiểm tra và kiểm soát';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `backup_logs`
--

DROP TABLE IF EXISTS `backup_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `backup_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `backup_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `backup_type` enum('AUTO','MANUAL','PRE_DEPLOY') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'AUTO',
  `file_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_size` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('SUCCESS','FAILED','IN_PROGRESS') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'IN_PROGRESS',
  `notes` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Log theo dõi các lần sao lưu CSDL';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `backup_logs`
--

LOCK TABLES `backup_logs` WRITE;
/*!40000 ALTER TABLE `backup_logs` DISABLE KEYS */;
INSERT INTO `backup_logs` VALUES (1,'2026-03-23 04:10:06','AUTO',NULL,NULL,'IN_PROGRESS','Scheduled daily backup – run backup.sh manually or via cron'),(2,'2026-03-27 05:58:46','AUTO',NULL,NULL,'IN_PROGRESS','Scheduled daily backup – run backup.sh manually or via cron'),(3,'2026-04-08 07:13:01','AUTO',NULL,NULL,'IN_PROGRESS','Scheduled daily backup – run backup.sh manually or via cron');
/*!40000 ALTER TABLE `backup_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `adults` int NOT NULL,
  `cancel_reason` varchar(500) DEFAULT NULL,
  `children` int NOT NULL,
  `code` varchar(30) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `deposit` decimal(38,2) NOT NULL,
  `discount` decimal(38,2) NOT NULL,
  `note` text,
  `payment_method` enum('BANK','VNPAY','MOMO','CASH','INSTALLMENT') DEFAULT NULL,
  `payment_status` enum('UNPAID','PARTIALLY_PAID','PAID') NOT NULL,
  `status` enum('PENDING','CONFIRMED','PAID','COMPLETED','CANCELLED') NOT NULL,
  `total_price` decimal(38,2) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `created_by` bigint DEFAULT NULL,
  `customer_id` bigint NOT NULL,
  `tour_schedule_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_dbhy1hjapco4w66anfuxdt55r` (`code`),
  KEY `FK4lsaxxymtu2xxvqp0mg2tqqya` (`created_by`),
  KEY `FKbvfibgflhsb0g2hnjauiv5khs` (`customer_id`),
  KEY `FKmxsc5p1lvpol8ylaosgqb735r` (`tour_schedule_id`),
  CONSTRAINT `FK4lsaxxymtu2xxvqp0mg2tqqya` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `FKbvfibgflhsb0g2hnjauiv5khs` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  CONSTRAINT `FKmxsc5p1lvpol8ylaosgqb735r` FOREIGN KEY (`tour_schedule_id`) REFERENCES `tour_schedules` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (1,2,NULL,0,'DT-2026-1024',NULL,3306000.00,580000.00,'Khách VIP – đặt phòng tầng cao','VNPAY','PAID','PAID',11020000.00,'2026-04-11 16:47:14.070900',4,1,4),(2,4,NULL,0,'DT-2026-1023',NULL,3840000.00,0.00,NULL,'BANK','PAID','PAID',12800000.00,NULL,4,2,1),(3,2,NULL,0,'DT-2026-1022',NULL,7500000.00,0.00,NULL,'BANK','UNPAID','PENDING',25000000.00,NULL,4,3,9),(4,2,NULL,0,'DT-2026-1021',NULL,16800000.00,2800000.00,'KH VIP – ưu tiên ghế máy bay','BANK','PAID','PAID',56000000.00,'2026-04-11 16:47:52.070658',4,5,12),(5,2,NULL,1,'DT-2026-1020',NULL,5124000.00,0.00,NULL,'MOMO','PARTIALLY_PAID','CANCELLED',17080000.00,'2026-04-11 18:03:14.903944',4,4,5),(6,1,NULL,0,'DT-2026-1019',NULL,840000.00,0.00,NULL,'VNPAY','PAID','PAID',2800000.00,NULL,4,6,13),(7,2,NULL,0,'DT-2026-0081',NULL,7500000.00,1250000.00,NULL,'BANK','PAID','COMPLETED',25000000.00,NULL,4,1,16),(8,4,NULL,2,'DT-2026-0080',NULL,16640000.00,0.00,NULL,'BANK','PAID','COMPLETED',16640000.00,NULL,4,2,15),(9,2,NULL,0,'DT-2026-0079',NULL,25000000.00,1250000.00,'Cặp đôi honeymoon','BANK','PAID','COMPLETED',25000000.00,NULL,4,5,17),(10,2,NULL,0,'DT-2026-1018',NULL,3480000.00,0.00,NULL,'BANK','UNPAID','PENDING',11600000.00,NULL,4,7,4),(11,2,NULL,0,'DT-2026-0011','2026-03-22 16:18:05.558826',1824000.00,320000.00,NULL,'BANK','UNPAID','PENDING',6080000.00,'2026-03-22 16:18:05.558826',7,1,2),(12,2,NULL,0,'DT-2026-0012','2026-03-26 21:31:52.816958',1920000.00,0.00,NULL,'BANK','UNPAID','CONFIRMED',6400000.00,'2026-04-11 16:47:54.250908',12,1,2),(13,2,NULL,0,'DT-2026-0013','2026-04-11 18:24:36.945209',26910000.00,0.00,NULL,'BANK','PAID','PAID',89700000.00,'2026-04-11 18:25:11.991499',4,1,22),(14,2,NULL,0,'DT-2026-0014','2026-04-11 20:27:52.614157',25564500.00,4485000.00,NULL,'BANK','UNPAID','PENDING',85215000.00,'2026-04-11 20:27:52.614157',7,1,22),(15,2,NULL,0,'DT-2026-0015','2026-04-11 20:28:34.187590',25564500.00,4485000.00,NULL,'BANK','UNPAID','PENDING',85215000.00,'2026-04-11 20:28:34.187590',7,1,22),(16,9,NULL,0,'DT-2026-0016','2026-04-11 20:57:27.038489',115040250.00,20182500.00,NULL,'BANK','UNPAID','PENDING',383467500.00,'2026-04-11 20:57:27.038489',7,1,22),(17,2,NULL,0,'DT-2026-0017','2026-04-11 21:11:11.824784',26910000.00,0.00,NULL,'BANK','UNPAID','PENDING',89700000.00,'2026-04-11 21:11:11.824784',4,3,22);
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`%`*/ /*!50003 TRIGGER `trg_check_schedule_capacity` BEFORE INSERT ON `bookings` FOR EACH ROW BEGIN
    DECLARE v_capacity INT DEFAULT 0;
    DECLARE v_booked   INT DEFAULT 0;
    DECLARE v_need     INT DEFAULT 0;

    SELECT capacity, booked
    INTO   v_capacity, v_booked
    FROM   tour_schedules
    WHERE  id = NEW.tour_schedule_id;

    SET v_need = NEW.adults + NEW.children;

    IF (v_capacity - v_booked) < v_need THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Không đủ chỗ trống cho lịch khởi hành này';
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`%`*/ /*!50003 TRIGGER `trg_booking_complete_loyalty` AFTER UPDATE ON `bookings` FOR EACH ROW BEGIN
    DECLARE v_points      INT DEFAULT 0;
    DECLARE v_new_balance INT DEFAULT 0;

    IF NEW.status = 'COMPLETED' AND OLD.status != 'COMPLETED' THEN
        -- 1 điểm / 10,000 VND
        SET v_points = FLOOR(NEW.total_price / 10000);

        UPDATE customers
        SET loyalty_points = loyalty_points + v_points
        WHERE id = NEW.customer_id;

        SELECT loyalty_points INTO v_new_balance
        FROM customers WHERE id = NEW.customer_id;

        INSERT INTO loyalty_transactions
            (customer_id, type, points, balance_after, ref_type, ref_id, description)
        VALUES
            (NEW.customer_id, 'EARN', v_points, v_new_balance,
             'BOOKING', NEW.id,
             CONCAT('Tích điểm hoàn thành đơn ', NEW.code));
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `customer_reviews`
--

DROP TABLE IF EXISTS `customer_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer_reviews` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `comment` text,
  `created_at` datetime(6) DEFAULT NULL,
  `food_rating` int DEFAULT NULL,
  `guide_rating` int DEFAULT NULL,
  `is_visible` bit(1) DEFAULT NULL,
  `rating` int DEFAULT NULL,
  `replied_at` datetime(6) DEFAULT NULL,
  `reply` text,
  `service_rating` int DEFAULT NULL,
  `booking_id` bigint DEFAULT NULL,
  `customer_id` bigint NOT NULL,
  `replied_by` bigint DEFAULT NULL,
  `tour_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKdiqvy8lh8p970m2dxu0nymytk` (`booking_id`),
  KEY `FK72gd5byrx77h18l0dpsoqu8nd` (`customer_id`),
  KEY `FKlljm22achdiq00qcfr3a8xg9s` (`replied_by`),
  KEY `FKh8lq8p514deavb4s2nwsjq0r2` (`tour_id`),
  CONSTRAINT `FK72gd5byrx77h18l0dpsoqu8nd` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  CONSTRAINT `FKdiqvy8lh8p970m2dxu0nymytk` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`),
  CONSTRAINT `FKh8lq8p514deavb4s2nwsjq0r2` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`),
  CONSTRAINT `FKlljm22achdiq00qcfr3a8xg9s` FOREIGN KEY (`replied_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_reviews`
--

LOCK TABLES `customer_reviews` WRITE;
/*!40000 ALTER TABLE `customer_reviews` DISABLE KEYS */;
INSERT INTO `customer_reviews` VALUES (1,'Dịch vụ tuyệt vời! Hướng dẫn viên nhiệt tình, khách sạn sạch đẹp. Nhất định sẽ quay lại!',NULL,5,5,NULL,5,'2026-01-16 00:00:00.000000','Cảm ơn anh An đã tin tưởng TourPro! Chúng tôi rất vui khi anh hài lòng. Hẹn gặp lại!',5,7,1,4,4),(2,'Tour đẹp, HDV vui vẻ. Tuy nhiên bữa ăn hơi đơn điệu, nên đa dạng hơn.',NULL,3,5,NULL,4,'2026-01-22 00:00:00.000000','Cảm ơn chị Bích! Chúng tôi đã ghi nhận góp ý về bữa ăn để cải thiện cho các tour sau.',4,8,2,4,1),(3,'Trải nghiệm xuất sắc! Bangkok rất ấn tượng, lịch trình hợp lý. 10/10!',NULL,4,5,NULL,5,'2026-02-16 00:00:00.000000','Cảm ơn chị Diễm! Chúng tôi rất vui khi được phục vụ chị!',5,9,5,4,4),(4,'Tour Phú Quốc tuyệt đỉnh! VinWonders rất vui, biển cực đẹp. Sẽ giới thiệu bạn bè!',NULL,5,5,NULL,5,NULL,NULL,5,2,1,NULL,2),(5,'Trải nghiệm khá ổn nhưng lịch trình hơi dày, nên có thêm thời gian tự do.',NULL,4,4,NULL,3,'2026-03-09 00:00:00.000000','Cảm ơn anh Nam! Chúng tôi sẽ xem xét điều chỉnh lịch trình cho thoải mái hơn.',3,3,3,4,4);
/*!40000 ALTER TABLE `customer_reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `address` varchar(255) DEFAULT NULL,
  `cccd_passport` varchar(20) DEFAULT NULL,
  `code` varchar(20) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `full_name` varchar(100) NOT NULL,
  `gender` enum('MALE','FEMALE','OTHER') DEFAULT NULL,
  `loyalty_points` int NOT NULL,
  `phone` varchar(20) NOT NULL,
  `preferences` text,
  `segment` enum('NEW','REGULAR','LOYAL','VIP') NOT NULL,
  `source` enum('WEBSITE','ZALO','FACEBOOK','REFERRAL','DIRECT','OTHER') DEFAULT NULL,
  `special_request` text,
  `updated_at` datetime(6) DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_mkwx1x9mthieapj92cpxq5msc` (`code`),
  UNIQUE KEY `UK_euat1oase6eqv195jvb71a93s` (`user_id`),
  CONSTRAINT `FKrh1g1a20omjmn6kurd35o3eit` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (1,'45 Nguyễn Trãi, Q.1, TP.HCM','079185012345','KH-00001',NULL,'1985-08-12','an.nguyen@gmail.com','Nguyễn Văn An','MALE',66846,'0901234567','Biển đảo, nghỉ dưỡng cao cấp','VIP','ZALO','Phòng không hút thuốc, tầng cao','2026-04-11 20:57:27.114698',7),(2,'12 Lê Duẩn, Q.1, TP.HCM','079190054321','KH-00002',NULL,'1990-03-25','bich.tran@yahoo.com','Trần Thị Bích','FEMALE',650,'0912456789','Tour gia đình, trong nước','LOYAL','WEBSITE','Phòng rộng cho gia đình 4 người',NULL,8),(3,'78 Võ Văn Tần, Q.3, TP.HCM','079188067890','KH-00003',NULL,'1988-11-05','nam.le@company.vn','Lê Hoàng Nam','MALE',9220,'0978111222','Tour quốc tế, văn hóa','VIP','FACEBOOK',NULL,'2026-04-11 21:11:11.834821',9),(4,'33 Cách Mạng Tháng 8, Q.10, TP.HCM','079195023456','KH-00004',NULL,'1995-06-18','lan.pham@gmail.com','Phạm Thị Lan','FEMALE',58,'0909333444',NULL,'NEW','ZALO',NULL,NULL,NULL),(5,'15 Đinh Tiên Hoàng, Q. Bình Thạnh','079182034567','KH-00005',NULL,'1982-04-30','diem.vo@outlook.com','Võ Thị Diễm','FEMALE',2450,'0888555666','Châu Âu, Nhật Bản, nghỉ dưỡng','LOYAL','REFERRAL','Nhu cầu phòng đặc biệt',NULL,NULL),(6,'88 Phan Đình Phùng, Q. Phú Nhuận','079192078901','KH-00006',NULL,'1992-09-14','tuan.ng@gmail.com','Nguyễn Minh Tuấn','MALE',180,'0877444555','Mạo hiểm, leo núi','NEW','WEBSITE',NULL,NULL,NULL),(7,'23 Trần Hưng Đạo, Q.5, TP.HCM','079187090123','KH-00007',NULL,'1987-12-21','hanh.ht@mail.vn','Hoàng Thị Hạnh','FEMALE',420,'0866333444','Tour biển, cặp đôi','NEW','DIRECT','Phòng honeymoon nếu có',NULL,NULL),(8,'56 Nguyễn Văn Cừ, Q.5, TP.HCM','079191045678','KH-00008',NULL,'1991-07-07','hung.dv@gmail.com','Đặng Văn Hùng','MALE',30,'0855222333',NULL,'NEW','ZALO',NULL,NULL,NULL);
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `manager_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK56q3esufky8u69xbmo4n63c4r` (`manager_id`),
  CONSTRAINT `FK56q3esufky8u69xbmo4n63c4r` FOREIGN KEY (`manager_id`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
INSERT INTO `departments` VALUES (1,NULL,'Ban Giám đốc',10),(2,NULL,'Kinh doanh',1),(3,NULL,'Hướng dẫn viên',6),(4,NULL,'Kế toán – Tài chính',7),(5,NULL,'Kho vận – Dịch vụ',8),(6,NULL,'Hành chính – Nhân sự',5);
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employees` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `address` varchar(255) DEFAULT NULL,
  `allowance` decimal(38,2) NOT NULL,
  `base_salary` decimal(38,2) NOT NULL,
  `cccd` varchar(20) DEFAULT NULL,
  `code` varchar(20) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `full_name` varchar(100) NOT NULL,
  `gender` enum('MALE','FEMALE','OTHER') DEFAULT NULL,
  `hire_date` date DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `status` enum('ACTIVE','ON_LEAVE','RESIGNED','TERMINATED') NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `department_id` bigint DEFAULT NULL,
  `position_id` bigint DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_3um79qgwg340lpaw7phtwudtc` (`code`),
  UNIQUE KEY `UK_j2dmgsma6pont6kf7nic9elpd` (`user_id`),
  KEY `FKgy4qe3dnqrm3ktd76sxp7n4c2` (`department_id`),
  KEY `FKngcpgx7fx5kednw3m7u0u8of3` (`position_id`),
  CONSTRAINT `FK69x3vjuy1t5p18a5llb8h2fjx` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKgy4qe3dnqrm3ktd76sxp7n4c2` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`),
  CONSTRAINT `FKngcpgx7fx5kednw3m7u0u8of3` FOREIGN KEY (`position_id`) REFERENCES `positions` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
INSERT INTO `employees` VALUES (1,NULL,2000000.00,18000000.00,'079190012345','NV001',NULL,'1990-05-15','hoa@tourpro.vn','Nguyễn Thị Hoa','FEMALE','2020-03-01','0901234567','ACTIVE',NULL,2,2,5),(2,NULL,1500000.00,12000000.00,'079195054321','NV002',NULL,'1995-08-20','binh@tourpro.vn','Trần Văn Bình','MALE','2022-07-15','0912456789','ACTIVE',NULL,3,6,6),(3,NULL,1000000.00,14000000.00,'079192067890','NV003',NULL,'1992-12-03','thu@tourpro.vn','Lê Thị Thu','FEMALE','2021-01-20','0978111222','ON_LEAVE',NULL,4,8,NULL),(4,NULL,800000.00,10000000.00,'079198023456','NV004',NULL,'1998-03-10','cuong@tourpro.vn','Phạm Văn Cường','MALE','2023-05-10','0909333444','ACTIVE',NULL,2,5,NULL),(5,NULL,500000.00,9000000.00,'079193078901','NV005',NULL,'1993-07-22','dung@tourpro.vn','Nguyễn Thị Dung','FEMALE','2022-11-01','0888777666','ACTIVE',NULL,6,5,NULL),(6,NULL,1200000.00,13000000.00,'079191034567','NV006',NULL,'1991-09-14','tuan@tourpro.vn','Võ Minh Tuấn','MALE','2019-06-01','0977888999','ACTIVE',NULL,3,6,NULL),(7,NULL,2500000.00,17000000.00,'079194090123','NV007',NULL,'1994-02-28','lan@tourpro.vn','Đặng Thị Lan','FEMALE','2018-09-15','0966555444','ACTIVE',NULL,4,7,NULL),(8,NULL,700000.00,9500000.00,'079196045678','NV008',NULL,'1996-11-05','nam@tourpro.vn','Hoàng Văn Nam','MALE','2023-02-20','0955444333','ACTIVE',NULL,5,9,NULL),(9,NULL,500000.00,8500000.00,'079197012345','NV009',NULL,'1997-04-18','mai@tourpro.vn','Trịnh Thị Mai','FEMALE','2023-08-01','0944333222','ACTIVE',NULL,2,5,NULL),(10,NULL,5000000.00,35000000.00,'079188067890','NV010',NULL,'1988-01-30','son@tourpro.vn','Bùi Thanh Sơn','MALE','2015-04-01','0933222111','ACTIVE',NULL,1,1,NULL);
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `export_details`
--

DROP TABLE IF EXISTS `export_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `export_details` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `amount` decimal(38,2) DEFAULT NULL,
  `qty` int DEFAULT NULL,
  `unit_price` decimal(38,2) DEFAULT NULL,
  `product_id` bigint NOT NULL,
  `voucher_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKex2q5nkwi7eoit8kqbvxith0a` (`product_id`),
  KEY `FKrqbgrtsih8vrv1kif6vrft4fc` (`voucher_id`),
  CONSTRAINT `FKex2q5nkwi7eoit8kqbvxith0a` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `FKrqbgrtsih8vrv1kif6vrft4fc` FOREIGN KEY (`voucher_id`) REFERENCES `export_vouchers` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `export_details`
--

LOCK TABLES `export_details` WRITE;
/*!40000 ALTER TABLE `export_details` DISABLE KEYS */;
INSERT INTO `export_details` VALUES (1,126000000.00,70,1800000.00,1,1),(2,105000000.00,84,1250000.00,3,2),(3,10080000.00,84,120000.00,5,2),(4,16000000.00,10,1600000.00,4,3),(5,7500000.00,10,750000.00,6,3),(6,1200000.00,10,120000.00,5,3);
/*!40000 ALTER TABLE `export_details` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`%`*/ /*!50003 TRIGGER `trg_after_export_insert` AFTER INSERT ON `export_details` FOR EACH ROW BEGIN
    UPDATE products
    SET stock_qty = stock_qty - NEW.qty
    WHERE id = NEW.product_id;

    UPDATE products
    SET status = 'OUT_OF_STOCK'
    WHERE id = NEW.product_id AND stock_qty <= 0;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`%`*/ /*!50003 TRIGGER `trg_after_export_detail_insert` AFTER INSERT ON `export_details` FOR EACH ROW BEGIN
    UPDATE products
    SET
        stock_qty = stock_qty - NEW.qty,
        status    = IF(stock_qty - NEW.qty <= 0, 'OUT_OF_STOCK', status)
    WHERE id = NEW.product_id;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `export_vouchers`
--

DROP TABLE IF EXISTS `export_vouchers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `export_vouchers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `code` varchar(30) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `date` date NOT NULL,
  `note` text,
  `total` decimal(38,2) DEFAULT NULL,
  `booking_id` bigint DEFAULT NULL,
  `created_by` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_1b4lgyax64t58qx9411foqjp0` (`code`),
  KEY `FKo5kq29lknujraym1xr2a30inp` (`booking_id`),
  KEY `FKeqan1ywmum475bad80les5xsx` (`created_by`),
  CONSTRAINT `FKeqan1ywmum475bad80les5xsx` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `FKo5kq29lknujraym1xr2a30inp` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `export_vouchers`
--

LOCK TABLES `export_vouchers` WRITE;
/*!40000 ALTER TABLE `export_vouchers` DISABLE KEYS */;
INSERT INTO `export_vouchers` VALUES (1,'PX-2026-088',NULL,'2026-03-15',NULL,126000000.00,2,3),(2,'PX-2026-087',NULL,'2026-03-14',NULL,96000000.00,1,3),(3,'PX-2026-086',NULL,'2026-03-10',NULL,25000000.00,7,3),(4,'PX-2026-085',NULL,'2026-02-20',NULL,32000000.00,8,3);
/*!40000 ALTER TABLE `export_vouchers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `import_details`
--

DROP TABLE IF EXISTS `import_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `import_details` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `amount` decimal(38,2) DEFAULT NULL,
  `qty` int DEFAULT NULL,
  `unit_price` decimal(38,2) DEFAULT NULL,
  `product_id` bigint NOT NULL,
  `voucher_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK13vxgtbffkj8acalfah5sxe1b` (`product_id`),
  KEY `FKkbchxu999h9627lhr559jkna` (`voucher_id`),
  CONSTRAINT `FK13vxgtbffkj8acalfah5sxe1b` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `FKkbchxu999h9627lhr559jkna` FOREIGN KEY (`voucher_id`) REFERENCES `import_vouchers` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `import_details`
--

LOCK TABLES `import_details` WRITE;
/*!40000 ALTER TABLE `import_details` DISABLE KEYS */;
INSERT INTO `import_details` VALUES (1,28500000.00,30,950000.00,3,1),(2,18750000.00,25,750000.00,9,1),(3,18000000.00,15,1200000.00,1,2),(4,18000000.00,20,900000.00,2,2),(5,8000000.00,100,80000.00,5,3),(6,8000000.00,40,200000.00,10,3),(7,30000000.00,60,500000.00,6,4),(8,30000000.00,40,750000.00,9,5),(9,17500000.00,5,3500000.00,7,6);
/*!40000 ALTER TABLE `import_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `import_vouchers`
--

DROP TABLE IF EXISTS `import_vouchers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `import_vouchers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `approved_at` datetime(6) DEFAULT NULL,
  `code` varchar(30) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `date` date NOT NULL,
  `note` text,
  `status` enum('PENDING','APPROVED','REJECTED') NOT NULL,
  `total` decimal(38,2) DEFAULT NULL,
  `approved_by` bigint DEFAULT NULL,
  `created_by` bigint DEFAULT NULL,
  `supplier_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_pvo56438duf5eqfetuu0oopnx` (`code`),
  KEY `FK8pg8dk4xb63i7krplmjv85mw1` (`approved_by`),
  KEY `FKd8mbjt1nsyhj92x9d0el3v2dg` (`created_by`),
  KEY `FKcdajo1m0upxleo27kgxcxa7hl` (`supplier_id`),
  CONSTRAINT `FK8pg8dk4xb63i7krplmjv85mw1` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`),
  CONSTRAINT `FKcdajo1m0upxleo27kgxcxa7hl` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`),
  CONSTRAINT `FKd8mbjt1nsyhj92x9d0el3v2dg` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `import_vouchers`
--

LOCK TABLES `import_vouchers` WRITE;
/*!40000 ALTER TABLE `import_vouchers` DISABLE KEYS */;
INSERT INTO `import_vouchers` VALUES (1,NULL,'PN-2026-031',NULL,'2026-03-15',NULL,'APPROVED',47500000.00,NULL,3,2),(2,NULL,'PN-2026-030',NULL,'2026-03-14',NULL,'APPROVED',36000000.00,NULL,3,1),(3,NULL,'PN-2026-029',NULL,'2026-03-10',NULL,'APPROVED',16000000.00,NULL,3,3),(4,NULL,'PN-2026-028',NULL,'2026-03-05',NULL,'APPROVED',30000000.00,NULL,3,4),(5,NULL,'PN-2026-027',NULL,'2026-02-28',NULL,'APPROVED',30000000.00,NULL,3,7),(6,NULL,'PN-2026-026',NULL,'2026-02-20',NULL,'PENDING',17500000.00,NULL,3,5);
/*!40000 ALTER TABLE `import_vouchers` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`%`*/ /*!50003 TRIGGER `trg_after_import_approve` AFTER UPDATE ON `import_vouchers` FOR EACH ROW BEGIN
    IF NEW.status = 'APPROVED' AND OLD.status != 'APPROVED' THEN
        UPDATE products p
        INNER JOIN import_details d ON p.id = d.product_id
        SET p.stock_qty = p.stock_qty + d.qty,
            p.status    = IF(p.stock_qty + d.qty > 0, 'ACTIVE', p.status)
        WHERE d.voucher_id = NEW.id;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `leave_requests`
--

DROP TABLE IF EXISTS `leave_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leave_requests` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `approved_at` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `days` int DEFAULT NULL,
  `from_date` date NOT NULL,
  `reason` text,
  `reject_reason` varchar(255) DEFAULT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') NOT NULL,
  `to_date` date NOT NULL,
  `type` enum('ANNUAL','SICK','MATERNITY','PATERNITY','RESIGNATION','OTHER') NOT NULL,
  `approved_by` bigint DEFAULT NULL,
  `employee_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKjbbwxkm0urfei0eo02iv6x946` (`approved_by`),
  KEY `FKrxff2xg1kffbjfh5maxwoqyhw` (`employee_id`),
  CONSTRAINT `FKjbbwxkm0urfei0eo02iv6x946` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`),
  CONSTRAINT `FKrxff2xg1kffbjfh5maxwoqyhw` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leave_requests`
--

LOCK TABLES `leave_requests` WRITE;
/*!40000 ALTER TABLE `leave_requests` DISABLE KEYS */;
INSERT INTO `leave_requests` VALUES (1,NULL,NULL,3,'2026-03-18','Việc gia đình',NULL,'PENDING','2026-03-20','ANNUAL',NULL,3),(2,NULL,NULL,3,'2026-03-15','Sốt, cần nghỉ ngơi',NULL,'PENDING','2026-03-17','SICK',NULL,4),(3,NULL,NULL,180,'2026-04-01','Nghỉ thai sản theo luật',NULL,'PENDING','2026-09-30','MATERNITY',NULL,5),(4,NULL,NULL,3,'2026-02-10','Du lịch cá nhân',NULL,'APPROVED','2026-02-12','ANNUAL',NULL,2),(5,NULL,NULL,2,'2026-01-20','Cảm cúm',NULL,'APPROVED','2026-01-21','SICK',NULL,9),(6,NULL,NULL,5,'2025-12-26','Nghỉ tết dương lịch',NULL,'APPROVED','2025-12-31','ANNUAL',NULL,1),(7,NULL,NULL,1,'2026-05-01','Xin nghỉ việc để học thêm',NULL,'PENDING','2026-05-01','RESIGNATION',NULL,8);
/*!40000 ALTER TABLE `leave_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loyalty_transactions`
--

DROP TABLE IF EXISTS `loyalty_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loyalty_transactions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `customer_id` bigint NOT NULL,
  `type` enum('EARN','REDEEM','ADJUST') COLLATE utf8mb4_unicode_ci NOT NULL,
  `points` int NOT NULL COMMENT 'Dương = tích, Âm = dùng',
  `balance_after` int NOT NULL,
  `ref_type` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'BOOKING, REVIEW, MANUAL...',
  `ref_id` bigint DEFAULT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` bigint DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_loyalty_customer` (`customer_id`),
  CONSTRAINT `fk_loyalty_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Lịch sử tích/dùng điểm thưởng của khách hàng';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loyalty_transactions`
--

LOCK TABLES `loyalty_transactions` WRITE;
/*!40000 ALTER TABLE `loyalty_transactions` DISABLE KEYS */;
INSERT INTO `loyalty_transactions` VALUES (1,1,'EARN',500,500,'BOOKING',7,'Tích điểm đặt tour Bangkok',NULL,'2026-03-22 07:31:36'),(2,1,'EARN',1160,1660,'BOOKING',2,'Tích điểm đặt tour Phú Quốc',NULL,'2026-03-22 07:31:36'),(3,1,'REDEEM',-420,1240,'BOOKING',1,'Dùng điểm giảm giá đặt tour Phú Quốc 4N',NULL,'2026-03-22 07:31:36'),(4,2,'EARN',640,640,'BOOKING',8,'Tích điểm đặt tour Đà Nẵng',NULL,'2026-03-22 07:31:36'),(5,2,'EARN',50,690,'REVIEW',1,'Thưởng điểm viết đánh giá',NULL,'2026-03-22 07:31:36'),(6,2,'REDEEM',-40,650,'BOOKING',10,'Dùng điểm giảm giá',NULL,'2026-03-22 07:31:36'),(7,5,'EARN',2500,2500,'BOOKING',9,'Tích điểm đặt tour Bangkok VIP',NULL,'2026-03-22 07:31:36'),(8,5,'REDEEM',-50,2450,'BOOKING',4,'Dùng điểm giảm giá tour Nhật Bản',NULL,'2026-03-22 07:31:36');
/*!40000 ALTER TABLE `loyalty_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `body` text COLLATE utf8mb4_unicode_ci,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'BOOKING, LEAVE, SALARY, SYSTEM...',
  `ref_id` bigint DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notif_user` (`user_id`),
  KEY `idx_notif_is_read` (`is_read`),
  CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Thông báo nội bộ hệ thống';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,7,'Tour Phú Quốc sắp khởi hành','Tour Phú Quốc 4N3Đ của bạn sẽ khởi hành ngày 25/03/2026. Vui lòng có mặt đúng giờ!','BOOKING',1,0,'2026-03-22 07:31:36'),(2,7,'Thanh toán đặt cọc thành công','Chúng tôi đã nhận được thanh toán đặt cọc 3,306,000 ₫ cho đơn DT-2026-1024.','BOOKING',1,1,'2026-03-22 07:31:36'),(3,1,'Đơn xin nghỉ mới','Nhân viên Lê Thị Thu đã nộp đơn xin nghỉ phép. Vui lòng xem xét và duyệt.','LEAVE',1,0,'2026-03-22 07:31:36'),(4,2,'Yêu cầu duyệt đơn nghỉ','Có 3 đơn xin nghỉ đang chờ phê duyệt.','LEAVE',NULL,0,'2026-03-22 07:31:36'),(5,3,'Tồn kho sắp hết','Sản phẩm DV012 – Phòng Standard chỉ còn 3 phòng. Vui lòng liên hệ nhà cung cấp.','SYSTEM',12,0,'2026-03-22 07:31:36');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `position_history`
--

DROP TABLE IF EXISTS `position_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `position_history` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `effective_date` date NOT NULL,
  `note` text,
  `salary` decimal(38,2) DEFAULT NULL,
  `employee_id` bigint NOT NULL,
  `position_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKheovufpa6yogwla0766eaei6o` (`employee_id`),
  KEY `FKdffey7l9ofunmp9rwv1bpac25` (`position_id`),
  CONSTRAINT `FKdffey7l9ofunmp9rwv1bpac25` FOREIGN KEY (`position_id`) REFERENCES `positions` (`id`),
  CONSTRAINT `FKheovufpa6yogwla0766eaei6o` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `position_history`
--

LOCK TABLES `position_history` WRITE;
/*!40000 ALTER TABLE `position_history` DISABLE KEYS */;
INSERT INTO `position_history` VALUES (1,NULL,'2020-03-01','Tuyển dụng ban đầu',12000000.00,1,5),(2,NULL,'2022-01-01','Thăng chức chuyên viên',15000000.00,1,4),(3,NULL,'2023-07-01','Thăng chức trưởng phòng',18000000.00,1,2),(4,NULL,'2022-07-15','Tuyển dụng ban đầu',12000000.00,2,6),(5,NULL,'2021-01-20','Tuyển dụng ban đầu',14000000.00,3,8),(6,NULL,'2023-05-10','Tuyển dụng ban đầu',10000000.00,4,5),(7,NULL,'2015-04-01','Bổ nhiệm Giám đốc',35000000.00,10,1);
/*!40000 ALTER TABLE `position_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `positions`
--

DROP TABLE IF EXISTS `positions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `positions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `base_salary_max` decimal(38,2) DEFAULT NULL,
  `base_salary_min` decimal(38,2) DEFAULT NULL,
  `title` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `positions`
--

LOCK TABLES `positions` WRITE;
/*!40000 ALTER TABLE `positions` DISABLE KEYS */;
INSERT INTO `positions` VALUES (1,50000000.00,30000000.00,'Giám đốc'),(2,25000000.00,15000000.00,'Trưởng phòng'),(3,20000000.00,12000000.00,'Phó phòng'),(4,18000000.00,10000000.00,'Chuyên viên'),(5,12000000.00,8000000.00,'Nhân viên'),(6,16000000.00,10000000.00,'Hướng dẫn viên du lịch'),(7,22000000.00,14000000.00,'Kế toán trưởng'),(8,14000000.00,9000000.00,'Nhân viên kế toán'),(9,11000000.00,8000000.00,'Nhân viên kho'),(10,10000000.00,7000000.00,'Lễ tân');
/*!40000 ALTER TABLE `positions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `buy_price` decimal(38,2) NOT NULL,
  `code` varchar(20) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `description` text,
  `min_stock` int NOT NULL,
  `name` varchar(200) NOT NULL,
  `sell_price` decimal(38,2) NOT NULL,
  `status` enum('ACTIVE','INACTIVE','OUT_OF_STOCK') NOT NULL,
  `stock_qty` int NOT NULL,
  `type` enum('HOTEL','FLIGHT','FOOD','VEHICLE','ACTIVITY','OTHER') NOT NULL,
  `unit` varchar(30) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `supplier_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_57ivhy5aj3qfmdvl6vxdfjs4p` (`code`),
  KEY `FK6i174ixi9087gcvvut45em7fd` (`supplier_id`),
  CONSTRAINT `FK6i174ixi9087gcvvut45em7fd` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,1250000.00,'DV001',NULL,NULL,5,'Phòng Deluxe Sea View – Mường Thanh ĐN',1800000.00,'ACTIVE',45,'HOTEL','Đêm','2026-04-01 11:42:39.215453',1),(2,900000.00,'DV002',NULL,NULL,5,'Phòng Superior – Mường Thanh ĐN',1400000.00,'ACTIVE',30,'HOTEL','Đêm',NULL,1),(3,950000.00,'DV003',NULL,NULL,5,'Vé bay HAN-DAD khứ hồi – VNA',1250000.00,'ACTIVE',12,'FLIGHT','Vé',NULL,2),(4,1200000.00,'DV004',NULL,NULL,5,'Vé bay SGN-PQC khứ hồi – VNA',1600000.00,'ACTIVE',20,'FLIGHT','Vé',NULL,2),(5,80000.00,'DV005',NULL,NULL,20,'Set ăn sáng buffet – Biển Xanh',120000.00,'ACTIVE',200,'FOOD','Suất',NULL,3),(6,500000.00,'DV006',NULL,NULL,10,'Vé VinWonders Phú Quốc',750000.00,'ACTIVE',60,'ACTIVITY','Vé',NULL,4),(7,3500000.00,'DV007',NULL,NULL,2,'Xe 29 chỗ HCM – Nha Trang',5000000.00,'ACTIVE',8,'VEHICLE','Chuyến',NULL,5),(8,3000000.00,'DV008',NULL,NULL,3,'Phòng Beach Villa – Vinpearl PQ',4500000.00,'ACTIVE',15,'HOTEL','Đêm',NULL,6),(9,750000.00,'DV009',NULL,NULL,5,'Vé bay SGN-HAN khứ hồi – VietJet',1050000.00,'ACTIVE',40,'FLIGHT','Vé',NULL,7),(10,200000.00,'DV010',NULL,NULL,15,'Bữa tối BBQ bãi biển – Biển Xanh',320000.00,'ACTIVE',100,'FOOD','Suất',NULL,3),(11,350000.00,'DV011',NULL,NULL,10,'Vé lặn ngắm san hô – Phú Quốc',550000.00,'ACTIVE',50,'ACTIVITY','Vé',NULL,4),(12,700000.00,'DV012',NULL,NULL,5,'Phòng Standard – Mường Thanh ĐN',1100000.00,'OUT_OF_STOCK',3,'HOTEL','Đêm',NULL,1);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `salary_records`
--

DROP TABLE IF EXISTS `salary_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `salary_records` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `actual_days` int DEFAULT NULL,
  `allowance` decimal(38,2) DEFAULT NULL,
  `approved_at` datetime(6) DEFAULT NULL,
  `base_salary` decimal(38,2) DEFAULT NULL,
  `bonus` decimal(38,2) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `deduction` decimal(38,2) DEFAULT NULL,
  `month` int NOT NULL,
  `net_pay` decimal(38,2) DEFAULT NULL,
  `status` enum('DRAFT','APPROVED','PAID') NOT NULL,
  `working_days` int DEFAULT NULL,
  `year` int NOT NULL,
  `approved_by` bigint DEFAULT NULL,
  `employee_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKgb2efv1m7q9kuhc39xcwpu8qe` (`employee_id`,`month`,`year`),
  KEY `FKm3gw746j9wbjngx96k8kd8tcs` (`approved_by`),
  CONSTRAINT `FKdglsilrqla44otqyp86elb7el` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`),
  CONSTRAINT `FKm3gw746j9wbjngx96k8kd8tcs` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salary_records`
--

LOCK TABLES `salary_records` WRITE;
/*!40000 ALTER TABLE `salary_records` DISABLE KEYS */;
INSERT INTO `salary_records` VALUES (1,26,2000000.00,NULL,18000000.00,3500000.00,NULL,2340000.00,3,21160000.00,'APPROVED',26,2026,NULL,1),(2,26,1500000.00,NULL,12000000.00,1800000.00,NULL,1560000.00,3,13740000.00,'APPROVED',26,2026,NULL,2),(3,20,1000000.00,NULL,14000000.00,0.00,NULL,1470000.00,3,13530000.00,'DRAFT',26,2026,NULL,3),(4,26,800000.00,NULL,10000000.00,500000.00,NULL,1050000.00,3,10250000.00,'DRAFT',26,2026,NULL,4),(5,26,500000.00,NULL,9000000.00,300000.00,NULL,945000.00,3,8855000.00,'DRAFT',26,2026,NULL,5),(6,26,1200000.00,NULL,13000000.00,2000000.00,NULL,1365000.00,3,14835000.00,'APPROVED',26,2026,NULL,6),(7,26,2500000.00,NULL,17000000.00,1500000.00,NULL,1785000.00,3,19215000.00,'APPROVED',26,2026,NULL,7),(8,26,700000.00,NULL,9500000.00,200000.00,NULL,997500.00,3,9402500.00,'DRAFT',26,2026,NULL,8),(9,26,500000.00,NULL,8500000.00,100000.00,NULL,892500.00,3,8207500.00,'DRAFT',26,2026,NULL,9),(10,26,5000000.00,NULL,35000000.00,8000000.00,NULL,3675000.00,3,44325000.00,'APPROVED',26,2026,NULL,10);
/*!40000 ALTER TABLE `salary_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suppliers`
--

DROP TABLE IF EXISTS `suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suppliers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `address` varchar(255) DEFAULT NULL,
  `code` varchar(20) NOT NULL,
  `contact_person` varchar(100) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `name` varchar(150) NOT NULL,
  `note` text,
  `phone` varchar(20) DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') NOT NULL,
  `tax_code` varchar(20) DEFAULT NULL,
  `type` enum('HOTEL','TRANSPORT','FOOD','ENTERTAINMENT','OTHER') NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_8kh5crh75ye2imfi5yv37p61o` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suppliers`
--

LOCK TABLES `suppliers` WRITE;
/*!40000 ALTER TABLE `suppliers` DISABLE KEYS */;
INSERT INTO `suppliers` VALUES (1,'60 Bạch Đằng, Đà Nẵng','NCC001','Nguyễn Văn A',NULL,'muongthanh.dn@mail.vn','Khách sạn Mường Thanh Đà Nẵng',NULL,'0901234567','ACTIVE','0400123456','HOTEL',NULL),(2,'200 Nguyễn Sơn, Hà Nội','NCC002','Phòng B2B',NULL,'b2b@vietnamairlines.vn','Vietnam Airlines',NULL,'19001100','ACTIVE','0100107518','TRANSPORT',NULL),(3,'15 Trần Phú, Nha Trang','NCC003','Trần Thị B',NULL,'bienxanh@mail.vn','Nhà hàng Biển Xanh Nha Trang',NULL,'0912456789','ACTIVE','0400234567','FOOD',NULL),(4,'Bãi Dài, Phú Quốc, Kiên Giang','NCC004','Phòng Đối tác',NULL,'b2b@vinwonders.vn','VinWonders Phú Quốc',NULL,'1900232239','ACTIVE','0100234567','ENTERTAINMENT',NULL),(5,'45 Lê Lợi, TP.HCM','NCC005','Hùng',NULL,'hungmanh@mail.vn','Công ty Vận chuyển Hùng Mạnh',NULL,'0978555666','ACTIVE','0500345678','TRANSPORT',NULL),(6,'Phú Quốc, Kiên Giang','NCC006','Phòng B2B',NULL,'vinpearl.pq@mail.vn','Khách sạn Vinpearl Phú Quốc',NULL,'1900232239','ACTIVE','0100345678','HOTEL',NULL),(7,'302/3 Kim Mã, Hà Nội','NCC007','Phòng đại lý',NULL,'b2b@vietjetair.com','VietJet Air',NULL,'19001886','ACTIVE','0100456789','TRANSPORT',NULL),(8,'Thị trấn Sapa, Lào Cai','NCC008','Mã A',NULL,'banmuong@mail.vn','Nhà hàng Bản Mường Sapa',NULL,'0914777888','INACTIVE','0400456789','FOOD',NULL);
/*!40000 ALTER TABLE `suppliers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tour_schedules`
--

DROP TABLE IF EXISTS `tour_schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tour_schedules` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `booked` int NOT NULL,
  `capacity` int NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `departure_date` date NOT NULL,
  `note` text,
  `status` enum('OPEN','FULL','CANCELLED','COMPLETED') NOT NULL,
  `guide_id` bigint DEFAULT NULL,
  `tour_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKtrtjfluuntkva634d9cso62cu` (`guide_id`),
  KEY `FKa7bvkxeyqhbppi24qimguq9un` (`tour_id`),
  CONSTRAINT `FKa7bvkxeyqhbppi24qimguq9un` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`),
  CONSTRAINT `FKtrtjfluuntkva634d9cso62cu` FOREIGN KEY (`guide_id`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tour_schedules`
--

LOCK TABLES `tour_schedules` WRITE;
/*!40000 ALTER TABLE `tour_schedules` DISABLE KEYS */;
INSERT INTO `tour_schedules` VALUES (1,26,40,NULL,'2026-03-20',NULL,'OPEN',2,1),(2,16,40,NULL,'2026-04-05',NULL,'OPEN',6,1),(3,0,40,NULL,'2026-04-20',NULL,'OPEN',NULL,1),(4,27,35,NULL,'2026-03-25',NULL,'OPEN',2,2),(5,5,35,NULL,'2026-04-10',NULL,'OPEN',6,2),(6,0,35,NULL,'2026-05-01',NULL,'OPEN',NULL,2),(7,8,30,NULL,'2026-03-28',NULL,'OPEN',2,3),(8,0,30,NULL,'2026-04-15',NULL,'OPEN',NULL,3),(9,22,25,NULL,'2026-04-01',NULL,'OPEN',6,4),(10,0,25,NULL,'2026-05-10',NULL,'OPEN',NULL,4),(11,11,40,NULL,'2026-04-15',NULL,'OPEN',2,5),(12,5,20,NULL,'2026-04-20',NULL,'OPEN',6,6),(13,8,35,NULL,'2026-03-28',NULL,'OPEN',2,7),(14,0,20,NULL,'2026-06-01',NULL,'OPEN',NULL,8),(15,40,40,NULL,'2026-01-15',NULL,'COMPLETED',2,1),(16,35,35,NULL,'2026-01-20',NULL,'COMPLETED',6,2),(17,22,25,NULL,'2026-02-14',NULL,'COMPLETED',2,4),(18,0,50,'2026-03-26 22:11:56.984514','2026-03-26',NULL,'OPEN',NULL,1),(19,0,50,'2026-03-26 22:12:42.782361','1901-01-03',NULL,'OPEN',NULL,1),(20,0,25,'2026-04-08 00:14:49.801291','2026-04-08',NULL,'OPEN',NULL,4),(21,0,25,'2026-04-08 00:15:34.943759','2026-04-08',NULL,'OPEN',NULL,1),(22,17,35,'2026-04-11 18:05:34.721393','2026-04-20',NULL,'OPEN',NULL,7);
/*!40000 ALTER TABLE `tour_schedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tour_services`
--

DROP TABLE IF EXISTS `tour_services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tour_services` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tour_id` bigint NOT NULL COMMENT 'Tour chứa dịch vụ này',
  `product_id` bigint NOT NULL COMMENT 'Dịch vụ thuộc tour',
  `quantity` int NOT NULL DEFAULT '1' COMMENT 'Số lượng dịch vụ dùng cho 1 tour',
  `note` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Ghi chú riêng (vd: phòng đôi, bữa trưa...)',
  `sort_order` int NOT NULL DEFAULT '0' COMMENT 'Thứ tự hiển thị trong tour',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tour_product` (`tour_id`,`product_id`),
  UNIQUE KEY `UKc90hfp0g3tyu8b4siwbiwd2ba` (`tour_id`,`product_id`),
  KEY `idx_ts_tour` (`tour_id`),
  KEY `idx_ts_product` (`product_id`),
  CONSTRAINT `fk_ts_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_ts_tour` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng trung gian: 1 tour gồm nhiều dịch vụ, 1 dịch vụ thuộc nhiều tour';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tour_services`
--

LOCK TABLES `tour_services` WRITE;
/*!40000 ALTER TABLE `tour_services` DISABLE KEYS */;
INSERT INTO `tour_services` VALUES (1,1,3,1,'Vé máy bay khứ hồi HAN-DAD mỗi người',1,'2026-04-01 05:22:25'),(2,1,1,2,'Phòng Deluxe – 2 đêm',2,'2026-04-01 05:22:25'),(3,1,5,6,'Ăn sáng 3 ngày × 2 người',3,'2026-04-01 05:22:25'),(4,2,4,1,'Vé bay khứ hồi SGN-PQC mỗi người',1,'2026-04-01 05:22:25'),(5,2,1,3,'Phòng Deluxe – 3 đêm',2,'2026-04-01 05:22:25'),(6,2,6,1,'Vé VinWonders (tham quan)',3,'2026-04-01 05:22:25'),(7,2,5,8,'Ăn sáng 4 ngày × 2 người',4,'2026-04-01 05:22:25'),(8,3,9,1,'Vé bay khứ hồi SGN-HAN mỗi người',1,'2026-04-01 05:22:25'),(9,3,2,2,'Phòng Superior – 2 đêm',2,'2026-04-01 05:22:25'),(10,3,5,6,'Ăn sáng 3 ngày',3,'2026-04-01 05:22:25'),(11,4,7,1,'Xe đưa đón sân bay và tham quan',1,'2026-04-01 05:22:25'),(12,4,5,10,'Ăn sáng 5 ngày',2,'2026-04-01 05:22:25'),(13,4,10,2,'Bữa tối BBQ bãi biển Pattaya',3,'2026-04-01 05:22:25'),(15,7,3,25,'vé máy bay Đà Lạt',1,'2026-04-11 18:21:59'),(16,7,5,25,'Ăn',2,'2026-04-11 18:22:14'),(17,7,11,25,'chơi',3,'2026-04-11 18:22:31');
/*!40000 ALTER TABLE `tour_services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tours`
--

DROP TABLE IF EXISTS `tours`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tours` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `capacity` int NOT NULL,
  `code` varchar(20) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `days` int DEFAULT NULL,
  `description` text,
  `destination` varchar(100) NOT NULL,
  `included` text,
  `itinerary` text,
  `name` varchar(200) NOT NULL,
  `nights` int DEFAULT NULL,
  `not_included` text,
  `origin` varchar(100) DEFAULT NULL,
  `price_adult` decimal(38,2) NOT NULL,
  `price_child` decimal(38,2) DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE','FULL') NOT NULL,
  `thumbnail_url` varchar(500) DEFAULT NULL,
  `type` enum('DOMESTIC','INTERNATIONAL','MICE') NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `created_by` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_7q7jsqdnkhiw9xd2s2wgjbogj` (`code`),
  KEY `FKiacs56q9m5figgjdtq61w2qxr` (`created_by`),
  CONSTRAINT `FKiacs56q9m5figgjdtq61w2qxr` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tours`
--

LOCK TABLES `tours` WRITE;
/*!40000 ALTER TABLE `tours` DISABLE KEYS */;
INSERT INTO `tours` VALUES (1,40,'T001',NULL,3,'Khám phá thành phố biển Đà Nẵng và phố cổ Hội An huyền bí. Tour lý tưởng cho gia đình và cặp đôi.','Đà Nẵng','Vé máy bay khứ hồi, KS 3 sao, 3 bữa/ngày, xe đưa đón, HDV, bảo hiểm','Ngày 1: Đón sân bay, tham quan Bà Nà Hills, cáp treo, Cầu Vàng\nNgày 2: Phố cổ Hội An, thả đèn lồng sông Hoài\nNgày 3: Bãi biển Mỹ Khê, mua sắm, bay về','Đà Nẵng – Hội An 3N2Đ – Phố Cổ Huyền Bí',2,'Vé tham quan riêng lẻ, đồ uống, chi phí cá nhân','TP.HCM',3200000.00,2000000.00,'FULL',NULL,'DOMESTIC','2026-04-08 00:16:19.468009',4),(2,35,'T002',NULL,4,'Thiên đường nghỉ dưỡng Phú Quốc với bãi biển trong xanh và VinWonders đẳng cấp.','Phú Quốc','Vé máy bay khứ hồi, resort 4 sao, 3 bữa/ngày, xe đưa đón, HDV, bảo hiểm','Ngày 1: Đón sân bay Phú Quốc, nhận phòng resort\nNgày 2: Lặn ngắm san hô, bãi Sao, chợ đêm Dinh Cậu\nNgày 3: VinWonders, Safari\nNgày 4: Tự do mua sắm, bay về','Phú Quốc 4N3Đ – Hòn Đảo Ngọc',3,'Vé VinWonders, đồ uống, massage','TP.HCM',5800000.00,3500000.00,'ACTIVE',NULL,'DOMESTIC',NULL,4),(3,30,'T003',NULL,3,'Khám phá Sapa thơ mộng giữa mùa lúa chín vàng với ruộng bậc thang kỳ vĩ.','Sapa','Vé máy bay, KS 3 sao, 3 bữa/ngày, xe đưa đón, HDV, bảo hiểm','Ngày 1: Bay HCM → Hà Nội, tàu/xe Sapa\nNgày 2: Bản Cát Cát, ruộng bậc thang, chợ Sapa\nNgày 3: Chinh phục Fansipan, về Hà Nội, bay về HCM','Hà Nội – Sapa 3N2Đ – Mùa Lúa Chín',2,'Vé cáp treo Fansipan, đồ uống','TP.HCM',4100000.00,2500000.00,'ACTIVE',NULL,'DOMESTIC',NULL,4),(4,25,'T004',NULL,5,'Hành trình khám phá xứ sở chùa vàng với Bangkok náo nhiệt và Pattaya biển xanh.','Thái Lan','Vé máy bay, KS 4 sao, 3 bữa/ngày, xe đưa đón, HDV người Việt, bảo hiểm, visa','Ngày 1: Bay đến Bangkok, nhận phòng\nNgày 2: Cung điện Hoàng gia, chùa Phật Ngọc, chợ nổi\nNgày 3: Chuyển Pattaya, biển\nNgày 4: Show Alcazar, mua sắm\nNgày 5: Về Bangkok, bay về','Bangkok – Pattaya 5N4Đ – Đất Thái Kỳ Diệu',4,'Vé tham quan riêng, đồ uống, tips HDV','TP.HCM',12500000.00,8000000.00,'ACTIVE',NULL,'INTERNATIONAL',NULL,4),(5,40,'T005',NULL,5,'Nghỉ dưỡng tại thiên đường biển Nha Trang với các hoạt động đa dạng trên biển.','Nha Trang','Xe giường nằm khứ hồi, KS 3 sao, 3 bữa/ngày, xe đưa đón, HDV, bảo hiểm','Ngày 1: Đón xe Nha Trang, nhận phòng resort\nNgày 2: Lặn ngắm san hô, đảo Hòn Mun\nNgày 3: Tháp Bà Ponagar, bùn khoáng nóng\nNgày 4: Vinpearl Land\nNgày 5: Mua sắm, về','Nha Trang 5N4Đ – Biển Xanh Cát Trắng',4,'Vé Vinpearl, đồ uống','TP.HCM',6200000.00,4000000.00,'ACTIVE',NULL,'DOMESTIC',NULL,4),(6,20,'T006',NULL,7,'Hành trình Nhật Bản mùa hoa anh đào nở rộ với Tokyo hiện đại và Kyoto cổ kính.','Nhật Bản','Vé máy bay, KS 3-4 sao, 3 bữa/ngày, xe đưa đón, HDV, bảo hiểm, visa, shinkansen','Ngày 1: Bay đến Tokyo\nNgày 2: Shinjuku, Harajuku, Shibuya\nNgày 3: Núi Phú Sĩ, Hakone\nNgày 4: Chuyển Kyoto, chùa Kinkaku-ji\nNgày 5: Nara, chùa Todai-ji\nNgày 6: Osaka, mua sắm\nNgày 7: Bay về','Tokyo – Kyoto – Osaka 7N6Đ – Mùa Hoa Anh Đào',6,'Đồ ăn thêm, tips, chi phí cá nhân','TP.HCM',28000000.00,18000000.00,'ACTIVE',NULL,'INTERNATIONAL',NULL,4),(7,35,'T007',NULL,3,'Thành phố ngàn hoa với khí hậu mát mẻ quanh năm, lý tưởng cho gia đình.','Đà Lạt','Xe khách, KS 3 sao, 3 bữa, xe đưa đón, HDV, bảo hiểm','Ngày 1: Xe Đà Lạt, hồ Xuân Hương, chợ đêm\nNgày 2: Thung lũng Tình Yêu, làng Cù Lần\nNgày 3: Vườn hoa thành phố, về HCM','Đà Lạt 3N2Đ – Thành Phố Ngàn Hoa',2,'Vé tham quan riêng, đồ uống','TP.HCM',44850000.00,1800000.00,'ACTIVE',NULL,'DOMESTIC','2026-04-11 18:23:38.222966',4),(8,20,'T008',NULL,5,'Hành trình khám phá 2 quốc gia Singapore tiên tiến và Malaysia đa văn hóa.','Singapore','Vé máy bay, KS 4 sao, 3 bữa, xe đưa đón, HDV, bảo hiểm, visa','Ngày 1: Bay Singapore\nNgày 2: Gardens by the Bay, Sentosa\nNgày 3: Chuyển Kuala Lumpur\nNgày 4: Tháp đôi Petronas, mua sắm\nNgày 5: Bay về','Singapore – Malaysia 5N4Đ – Đông Nam Á Sáng Ngời',4,'Vé tham quan riêng, tips','TP.HCM',18000000.00,12000000.00,'INACTIVE',NULL,'INTERNATIONAL',NULL,4);
/*!40000 ALTER TABLE `tours` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `full_name` varchar(100) NOT NULL,
  `last_login_at` datetime(6) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('ADMIN','HR_MANAGER','WAREHOUSE_MANAGER','SALES_MANAGER','EMPLOYEE','CUSTOMER','USER') DEFAULT NULL,
  `status` enum('ACTIVE','LOCKED','INACTIVE') NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `username` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_r43af9ap4edm43mmtq01oddj6` (`username`),
  UNIQUE KEY `UK_6dotkott2kjsp8vw4d0m25fb7` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,NULL,'admin@tourpro.vn','Quản trị viên','2026-04-11 18:42:51.690288','$2y$10$sobv4k/4yjxEEEYJ.Qc2AuI6Lej.F35DvOvUquqQhiHZITV21AC3y','ADMIN','ACTIVE','2026-04-11 18:42:51.693341','admin'),(2,NULL,'hr@tourpro.vn','Trần Thị Hương','2026-04-11 19:10:42.288833','$2y$10$sobv4k/4yjxEEEYJ.Qc2AuI6Lej.F35DvOvUquqQhiHZITV21AC3y','HR_MANAGER','ACTIVE','2026-04-11 19:10:42.291076','hr_manager'),(3,NULL,'warehouse@tourpro.vn','Lê Văn Kho','2026-04-08 00:18:09.778654','$2y$10$sobv4k/4yjxEEEYJ.Qc2AuI6Lej.F35DvOvUquqQhiHZITV21AC3y','WAREHOUSE_MANAGER','ACTIVE','2026-04-08 00:18:09.780286','warehouse1'),(4,NULL,'sales@tourpro.vn','Phạm Thị Kinh Doanh','2026-04-11 20:57:35.659714','$2y$10$sobv4k/4yjxEEEYJ.Qc2AuI6Lej.F35DvOvUquqQhiHZITV21AC3y','SALES_MANAGER','ACTIVE','2026-04-11 20:57:35.662464','sales1'),(5,NULL,'hoa@tourpro.vn','Nguyễn Thị Hoa','2026-04-11 18:33:44.439209','$2y$10$sobv4k/4yjxEEEYJ.Qc2AuI6Lej.F35DvOvUquqQhiHZITV21AC3y','EMPLOYEE','ACTIVE','2026-04-11 18:33:44.440788','nv_hoa'),(6,NULL,'binh@tourpro.vn','Trần Văn Bình',NULL,'$2y$10$sobv4k/4yjxEEEYJ.Qc2AuI6Lej.F35DvOvUquqQhiHZITV21AC3y','EMPLOYEE','ACTIVE',NULL,'nv_binh'),(7,NULL,'an@gmail.com','Nguyễn Văn An','2026-04-11 20:32:55.486831','$2y$10$sobv4k/4yjxEEEYJ.Qc2AuI6Lej.F35DvOvUquqQhiHZITV21AC3y','CUSTOMER','ACTIVE','2026-04-11 20:32:55.488453','cust_an'),(8,NULL,'bich@yahoo.com','Trần Thị Bích',NULL,'$2y$10$sobv4k/4yjxEEEYJ.Qc2AuI6Lej.F35DvOvUquqQhiHZITV21AC3y','CUSTOMER','ACTIVE',NULL,'cust_bich'),(9,NULL,'nam@gmail.com','Lê Hoàng Nam',NULL,'$2y$10$sobv4k/4yjxEEEYJ.Qc2AuI6Lej.F35DvOvUquqQhiHZITV21AC3y','CUSTOMER','ACTIVE',NULL,'cust_nam'),(10,NULL,'sales2@tourpro.vn','Nguyễn Văn Sales',NULL,'$2y$10$sobv4k/4yjxEEEYJ.Qc2AuI6Lej.F35DvOvUquqQhiHZITV21AC3y','SALES_MANAGER','ACTIVE',NULL,'sales2'),(12,'2026-03-26 21:04:03.975260','tranphap0407@gmail.com','Trần Anh Pháp','2026-04-11 15:27:59.715282','$2a$10$/vpMl1s3Vx4m4TTOgtYtceVEztXc7r76iouBf0BSmb5Kv3QSykliq','CUSTOMER','LOCKED','2026-04-11 18:43:19.733681','tranphap0407@gmail.com'),(15,'2026-04-11 20:02:19.593964','tranphap04asda07@gmail.com','Trần Pháp','2026-04-11 20:11:24.812392','$2a$10$kP.HrAArdlZDAKD13Mnxs.4uSPdnQd3que.EBIQJAr7.9KHhM02iK','USER','ACTIVE','2026-04-11 20:11:24.848091','user');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `v_customer_analysis`
--

DROP TABLE IF EXISTS `v_customer_analysis`;
/*!50001 DROP VIEW IF EXISTS `v_customer_analysis`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_customer_analysis` AS SELECT
 1 AS `id`,
 1 AS `code`,
 1 AS `full_name`,
 1 AS `phone`,
 1 AS `email`,
 1 AS `segment`,
 1 AS `source`,
 1 AS `loyalty_points`,
 1 AS `total_bookings`,
 1 AS `total_spending`,
 1 AS `last_booking_date`,
 1 AS `avg_review_rating`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_inventory_summary`
--

DROP TABLE IF EXISTS `v_inventory_summary`;
/*!50001 DROP VIEW IF EXISTS `v_inventory_summary`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_inventory_summary` AS SELECT
 1 AS `id`,
 1 AS `code`,
 1 AS `name`,
 1 AS `type`,
 1 AS `supplier_name`,
 1 AS `buy_price`,
 1 AS `sell_price`,
 1 AS `stock_qty`,
 1 AS `inventory_value`,
 1 AS `profit_margin`,
 1 AS `margin_pct`,
 1 AS `status`,
 1 AS `stock_status`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_monthly_revenue`
--

DROP TABLE IF EXISTS `v_monthly_revenue`;
/*!50001 DROP VIEW IF EXISTS `v_monthly_revenue`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_monthly_revenue` AS SELECT
 1 AS `year`,
 1 AS `month`,
 1 AS `total_bookings`,
 1 AS `total_revenue`,
 1 AS `total_discount`,
 1 AS `net_revenue`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_salary_summary`
--

DROP TABLE IF EXISTS `v_salary_summary`;
/*!50001 DROP VIEW IF EXISTS `v_salary_summary`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_salary_summary` AS SELECT
 1 AS `month`,
 1 AS `year`,
 1 AS `total_employees`,
 1 AS `total_base`,
 1 AS `total_allowance`,
 1 AS `total_bonus`,
 1 AS `total_deduction`,
 1 AS `total_net_pay`,
 1 AS `paid_count`,
 1 AS `approved_count`,
 1 AS `draft_count`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_tour_cost`
--

DROP TABLE IF EXISTS `v_tour_cost`;
/*!50001 DROP VIEW IF EXISTS `v_tour_cost`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_tour_cost` AS SELECT
 1 AS `tour_id`,
 1 AS `tour_name`,
 1 AS `service_count`,
 1 AS `total_cost`,
 1 AS `total_sell_price`,
 1 AS `listed_price_adult`,
 1 AS `cost_per_person`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_tour_stats`
--

DROP TABLE IF EXISTS `v_tour_stats`;
/*!50001 DROP VIEW IF EXISTS `v_tour_stats`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_tour_stats` AS SELECT
 1 AS `id`,
 1 AS `code`,
 1 AS `name`,
 1 AS `destination`,
 1 AS `type`,
 1 AS `price_adult`,
 1 AS `total_bookings`,
 1 AS `total_passengers`,
 1 AS `total_revenue`,
 1 AS `avg_rating`,
 1 AS `review_count`*/;
SET character_set_client = @saved_cs_client;

--
-- Dumping events for database 'tourpro_db'
--
/*!50106 SET @save_time_zone= @@TIME_ZONE */ ;
/*!50106 DROP EVENT IF EXISTS `evt_daily_backup_log` */;
DELIMITER ;;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;;
/*!50003 SET character_set_client  = utf8mb4 */ ;;
/*!50003 SET character_set_results = utf8mb4 */ ;;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;;
/*!50003 SET @saved_time_zone      = @@time_zone */ ;;
/*!50003 SET time_zone             = 'SYSTEM' */ ;;
/*!50106 CREATE*/ /*!50117 DEFINER=`root`@`%`*/ /*!50106 EVENT `evt_daily_backup_log` ON SCHEDULE EVERY 1 DAY STARTS '2026-03-23 02:00:00' ON COMPLETION NOT PRESERVE ENABLE DO BEGIN
    INSERT INTO backup_logs (backup_time, backup_type, status, notes)
    VALUES (NOW(), 'AUTO', 'IN_PROGRESS',
            'Scheduled daily backup – run backup.sh manually or via cron');
END */ ;;
/*!50003 SET time_zone             = @saved_time_zone */ ;;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;;
/*!50003 SET character_set_client  = @saved_cs_client */ ;;
/*!50003 SET character_set_results = @saved_cs_results */ ;;
/*!50003 SET collation_connection  = @saved_col_connection */ ;;
/*!50106 DROP EVENT IF EXISTS `evt_salary_reminder` */;;
DELIMITER ;;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;;
/*!50003 SET character_set_client  = utf8mb4 */ ;;
/*!50003 SET character_set_results = utf8mb4 */ ;;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;;
/*!50003 SET @saved_time_zone      = @@time_zone */ ;;
/*!50003 SET time_zone             = 'SYSTEM' */ ;;
/*!50106 CREATE*/ /*!50117 DEFINER=`root`@`%`*/ /*!50106 EVENT `evt_salary_reminder` ON SCHEDULE EVERY 1 MONTH STARTS '2026-04-25 08:00:00' ON COMPLETION NOT PRESERVE ENABLE DO BEGIN
    INSERT INTO notifications (user_id, title, body, type, is_read)
    SELECT id,
           'Nhắc nhở: Tính lương tháng này',
           CONCAT('Đã đến ngày 25, vui lòng tính lương cho tháng ',
                  MONTH(NOW()), '/', YEAR(NOW())),
           'SYSTEM',
           FALSE
    FROM users
    WHERE role IN ('ADMIN', 'HR_MANAGER')
      AND status = 'ACTIVE';
END */ ;;
/*!50003 SET time_zone             = @saved_time_zone */ ;;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;;
/*!50003 SET character_set_client  = @saved_cs_client */ ;;
/*!50003 SET character_set_results = @saved_cs_results */ ;;
/*!50003 SET collation_connection  = @saved_col_connection */ ;;
/*!50106 DROP EVENT IF EXISTS `evt_update_customer_segment` */;;
DELIMITER ;;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;;
/*!50003 SET character_set_client  = utf8mb4 */ ;;
/*!50003 SET character_set_results = utf8mb4 */ ;;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;;
/*!50003 SET @saved_time_zone      = @@time_zone */ ;;
/*!50003 SET time_zone             = 'SYSTEM' */ ;;
/*!50106 CREATE*/ /*!50117 DEFINER=`root`@`%`*/ /*!50106 EVENT `evt_update_customer_segment` ON SCHEDULE EVERY 1 DAY STARTS '2026-03-23 03:00:00' ON COMPLETION NOT PRESERVE ENABLE DO BEGIN
    CALL sp_update_customer_segment();
END */ ;;
/*!50003 SET time_zone             = @saved_time_zone */ ;;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;;
/*!50003 SET character_set_client  = @saved_cs_client */ ;;
/*!50003 SET character_set_results = @saved_cs_results */ ;;
/*!50003 SET collation_connection  = @saved_col_connection */ ;;
DELIMITER ;
/*!50106 SET TIME_ZONE= @save_time_zone */ ;

--
-- Dumping routines for database 'tourpro_db'
--
/*!50003 DROP PROCEDURE IF EXISTS `sp_approve_leave` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_approve_leave`(
    IN p_leave_id      BIGINT,
    IN p_approved_by   BIGINT,
    IN p_status        VARCHAR(10),   -- 'APPROVED' hoặc 'REJECTED'
    IN p_reject_reason VARCHAR(500)
)
BEGIN
    DECLARE v_emp_id BIGINT;
    DECLARE v_type   VARCHAR(20);

    SELECT employee_id, type
    INTO   v_emp_id, v_type
    FROM   leave_requests
    WHERE  id = p_leave_id;

    UPDATE leave_requests
    SET
        status        = p_status,
        approved_by   = p_approved_by,
        approved_at   = NOW(),
        reject_reason = IF(p_status = 'REJECTED', p_reject_reason, NULL)
    WHERE id = p_leave_id;

    -- Nếu duyệt và là nghỉ phép → cập nhật trạng thái nhân viên
    IF p_status = 'APPROVED' THEN
        IF v_type = 'RESIGNATION' THEN
            UPDATE employees SET status = 'RESIGNED'   WHERE id = v_emp_id;
        ELSE
            UPDATE employees SET status = 'ON_LEAVE'   WHERE id = v_emp_id;
        END IF;
    END IF;

    SELECT CONCAT('Đơn nghỉ #', p_leave_id, ' đã được ', p_status) AS result;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_calculate_all_salaries` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_calculate_all_salaries`(
    IN p_month TINYINT,
    IN p_year  SMALLINT
)
BEGIN
    DECLARE v_done    INT DEFAULT FALSE;
    DECLARE v_emp_id  BIGINT;
    DECLARE v_count   INT DEFAULT 0;

    DECLARE cur CURSOR FOR
        SELECT id FROM employees WHERE status = 'ACTIVE';

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;

    OPEN cur;

    read_loop: LOOP
        FETCH cur INTO v_emp_id;
        IF v_done THEN
            LEAVE read_loop;
        END IF;

        CALL sp_calculate_salary(v_emp_id, p_month, p_year, 0, 0);
        SET v_count = v_count + 1;
    END LOOP;

    CLOSE cur;

    SELECT CONCAT('Đã tính lương cho ', v_count,
                  ' nhân viên – tháng ', p_month, '/', p_year) AS result;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_calculate_salary` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_calculate_salary`(
    IN p_employee_id     BIGINT,
    IN p_month           TINYINT,
    IN p_year            SMALLINT,
    IN p_bonus           DECIMAL(15,0),
    IN p_extra_deduction DECIMAL(15,0)
)
BEGIN
    DECLARE v_base        DECIMAL(15,0) DEFAULT 0;
    DECLARE v_allowance   DECIMAL(15,0) DEFAULT 0;
    DECLARE v_insurance   DECIMAL(15,0) DEFAULT 0;
    DECLARE v_net         DECIMAL(15,0) DEFAULT 0;
    DECLARE v_deduction   DECIMAL(15,0) DEFAULT 0;

    -- Lấy thông tin lương nhân viên
    SELECT base_salary, IFNULL(allowance, 0)
    INTO   v_base, v_allowance
    FROM   employees
    WHERE  id = p_employee_id;

    -- BHXH 8% + BHYT 1.5% + BHTN 1% = 10.5%
    SET v_insurance   = ROUND(v_base * 0.105);
    SET v_deduction   = v_insurance + IFNULL(p_extra_deduction, 0);
    SET v_net         = v_base + v_allowance + IFNULL(p_bonus, 0) - v_deduction;

    INSERT INTO salary_records
        (employee_id, month, year, base_salary, allowance, bonus, deduction, net_pay, status)
    VALUES
        (p_employee_id, p_month, p_year,
         v_base, v_allowance, IFNULL(p_bonus, 0), v_deduction, v_net, 'DRAFT')
    ON DUPLICATE KEY UPDATE
        base_salary = v_base,
        allowance   = v_allowance,
        bonus       = IFNULL(p_bonus, 0),
        deduction   = v_deduction,
        net_pay     = v_net,
        status      = 'DRAFT';

    SELECT CONCAT('Đã tính lương cho nhân viên ID=', p_employee_id,
                  ' tháng ', p_month, '/', p_year,
                  ' – Thực lĩnh: ', FORMAT(v_net, 0)) AS result;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_monthly_report` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_monthly_report`(
    IN p_month TINYINT,
    IN p_year  SMALLINT
)
BEGIN
    -- Tổng doanh thu
    SELECT
        p_month                                         AS report_month,
        p_year                                          AS report_year,
        COUNT(id)                                       AS total_bookings,
        IFNULL(SUM(total_price), 0)                    AS total_revenue,
        IFNULL(SUM(discount),    0)                    AS total_discount,
        IFNULL(SUM(total_price) - SUM(discount), 0)   AS net_revenue
    FROM bookings
    WHERE MONTH(created_at) = p_month
      AND YEAR(created_at)  = p_year
      AND status IN ('PAID', 'COMPLETED');

    -- Top 5 tour
    SELECT
        t.name                 AS tour_name,
        COUNT(b.id)            AS bookings,
        SUM(b.total_price)     AS revenue
    FROM bookings b
    JOIN tour_schedules ts ON b.tour_schedule_id = ts.id
    JOIN tours t           ON ts.tour_id         = t.id
    WHERE MONTH(b.created_at) = p_month
      AND YEAR(b.created_at)  = p_year
      AND b.status IN ('PAID', 'COMPLETED')
    GROUP BY t.id, t.name
    ORDER BY revenue DESC
    LIMIT 5;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_update_customer_segment` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_update_customer_segment`()
BEGIN
    DECLARE v_updated INT DEFAULT 0;

    UPDATE customers c
    LEFT JOIN (
        SELECT
            customer_id,
            COUNT(*)        AS booking_count,
            SUM(total_price) AS total_spent
        FROM bookings
        WHERE status IN ('PAID', 'COMPLETED')
        GROUP BY customer_id
    ) stats ON c.id = stats.customer_id
    SET c.segment = CASE
        WHEN IFNULL(stats.booking_count, 0) >= 8
          OR IFNULL(stats.total_spent, 0) >= 50000000 THEN 'VIP'
        WHEN IFNULL(stats.booking_count, 0) >= 4
          OR IFNULL(stats.total_spent, 0) >= 20000000 THEN 'LOYAL'
        WHEN IFNULL(stats.booking_count, 0) >= 2     THEN 'REGULAR'
        ELSE 'NEW'
    END;

    SET v_updated = ROW_COUNT();
    SELECT CONCAT('Đã cập nhật phân khúc cho ', v_updated, ' khách hàng') AS result;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Final view structure for view `v_customer_analysis`
--

/*!50001 DROP VIEW IF EXISTS `v_customer_analysis`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_customer_analysis` AS select `c`.`id` AS `id`,`c`.`code` AS `code`,`c`.`full_name` AS `full_name`,`c`.`phone` AS `phone`,`c`.`email` AS `email`,`c`.`segment` AS `segment`,`c`.`source` AS `source`,`c`.`loyalty_points` AS `loyalty_points`,count(`b`.`id`) AS `total_bookings`,sum(`b`.`total_price`) AS `total_spending`,max(`b`.`created_at`) AS `last_booking_date`,avg(`r`.`rating`) AS `avg_review_rating` from ((`customers` `c` left join `bookings` `b` on(((`c`.`id` = `b`.`customer_id`) and (`b`.`status` in ('PAID','COMPLETED','CONFIRMED'))))) left join `customer_reviews` `r` on((`c`.`id` = `r`.`customer_id`))) group by `c`.`id`,`c`.`code`,`c`.`full_name`,`c`.`phone`,`c`.`email`,`c`.`segment`,`c`.`source`,`c`.`loyalty_points` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_inventory_summary`
--

/*!50001 DROP VIEW IF EXISTS `v_inventory_summary`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_inventory_summary` AS select `p`.`id` AS `id`,`p`.`code` AS `code`,`p`.`name` AS `name`,`p`.`type` AS `type`,`s`.`name` AS `supplier_name`,`p`.`buy_price` AS `buy_price`,`p`.`sell_price` AS `sell_price`,`p`.`stock_qty` AS `stock_qty`,(`p`.`stock_qty` * `p`.`buy_price`) AS `inventory_value`,(`p`.`sell_price` - `p`.`buy_price`) AS `profit_margin`,round((((`p`.`sell_price` - `p`.`buy_price`) / `p`.`sell_price`) * 100),2) AS `margin_pct`,`p`.`status` AS `status`,(case when (`p`.`stock_qty` <= `p`.`min_stock`) then 'LOW' else 'OK' end) AS `stock_status` from (`products` `p` left join `suppliers` `s` on((`p`.`supplier_id` = `s`.`id`))) where (`p`.`status` <> 'INACTIVE') */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_monthly_revenue`
--

/*!50001 DROP VIEW IF EXISTS `v_monthly_revenue`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_monthly_revenue` AS select year(`b`.`created_at`) AS `year`,month(`b`.`created_at`) AS `month`,count(`b`.`id`) AS `total_bookings`,sum(`b`.`total_price`) AS `total_revenue`,sum(`b`.`discount`) AS `total_discount`,sum((`b`.`total_price` - `b`.`discount`)) AS `net_revenue` from `bookings` `b` where (`b`.`status` in ('PAID','COMPLETED')) group by year(`b`.`created_at`),month(`b`.`created_at`) order by `year` desc,`month` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_salary_summary`
--

/*!50001 DROP VIEW IF EXISTS `v_salary_summary`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_salary_summary` AS select `sr`.`month` AS `month`,`sr`.`year` AS `year`,count(`sr`.`id`) AS `total_employees`,sum(`sr`.`base_salary`) AS `total_base`,sum(`sr`.`allowance`) AS `total_allowance`,sum(`sr`.`bonus`) AS `total_bonus`,sum(`sr`.`deduction`) AS `total_deduction`,sum(`sr`.`net_pay`) AS `total_net_pay`,count((case when (`sr`.`status` = 'PAID') then 1 end)) AS `paid_count`,count((case when (`sr`.`status` = 'APPROVED') then 1 end)) AS `approved_count`,count((case when (`sr`.`status` = 'DRAFT') then 1 end)) AS `draft_count` from `salary_records` `sr` group by `sr`.`month`,`sr`.`year` order by `sr`.`year` desc,`sr`.`month` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_tour_cost`
--

/*!50001 DROP VIEW IF EXISTS `v_tour_cost`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_tour_cost` AS select `t`.`id` AS `tour_id`,`t`.`name` AS `tour_name`,count(`ts`.`id`) AS `service_count`,sum((`p`.`buy_price` * `ts`.`quantity`)) AS `total_cost`,sum((`p`.`sell_price` * `ts`.`quantity`)) AS `total_sell_price`,`t`.`price_adult` AS `listed_price_adult`,round((sum((`p`.`buy_price` * `ts`.`quantity`)) / nullif(`t`.`capacity`,0)),0) AS `cost_per_person` from ((`tours` `t` left join `tour_services` `ts` on((`t`.`id` = `ts`.`tour_id`))) left join `products` `p` on((`ts`.`product_id` = `p`.`id`))) group by `t`.`id`,`t`.`name`,`t`.`price_adult`,`t`.`capacity` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_tour_stats`
--

/*!50001 DROP VIEW IF EXISTS `v_tour_stats`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_tour_stats` AS select `t`.`id` AS `id`,`t`.`code` AS `code`,`t`.`name` AS `name`,`t`.`destination` AS `destination`,`t`.`type` AS `type`,`t`.`price_adult` AS `price_adult`,count(`b`.`id`) AS `total_bookings`,sum((`b`.`adults` + `b`.`children`)) AS `total_passengers`,sum(`b`.`total_price`) AS `total_revenue`,avg(`r`.`rating`) AS `avg_rating`,count(`r`.`id`) AS `review_count` from (((`tours` `t` left join `tour_schedules` `ts` on((`t`.`id` = `ts`.`tour_id`))) left join `bookings` `b` on(((`ts`.`id` = `b`.`tour_schedule_id`) and (`b`.`status` in ('PAID','COMPLETED'))))) left join `customer_reviews` `r` on((`t`.`id` = `r`.`tour_id`))) group by `t`.`id`,`t`.`code`,`t`.`name`,`t`.`destination`,`t`.`type`,`t`.`price_adult` */;
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

-- Dump completed on 2026-04-11 21:25:22
