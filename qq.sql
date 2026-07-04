-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: elitebank
-- ------------------------------------------------------
-- Server version	8.0.45

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
-- Table structure for table `account_holders`
--

DROP TABLE IF EXISTS `account_holders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `account_holders` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `can_approve_transaction` bit(1) DEFAULT NULL,
  `can_deposit` bit(1) DEFAULT NULL,
  `can_withdraw` bit(1) DEFAULT NULL,
  `holder_type` enum('INTER_BANK_SETTLEMENT','INTER_BRANCH_SETTLEMENT','OPTIONAL','PRIMARY','SECONDARY') DEFAULT NULL,
  `account_id` bigint DEFAULT NULL,
  `customer_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKcvr366fdflsfmgurxy7n6c8yg` (`account_id`),
  KEY `FK4yge9f0c17hq0huu99u9v781h` (`customer_id`),
  CONSTRAINT `FK4yge9f0c17hq0huu99u9v781h` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  CONSTRAINT `FKcvr366fdflsfmgurxy7n6c8yg` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account_holders`
--

LOCK TABLES `account_holders` WRITE;
/*!40000 ALTER TABLE `account_holders` DISABLE KEYS */;
INSERT INTO `account_holders` VALUES (1,'2026-07-04 18:30:12.370734','2026-07-04 18:30:12.370734',_binary '',_binary '',_binary '','INTER_BRANCH_SETTLEMENT',NULL,NULL),(2,'2026-07-04 18:33:05.125220','2026-07-04 18:33:05.125220',_binary '',_binary '',_binary '','PRIMARY',2,1);
/*!40000 ALTER TABLE `account_holders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `account_transactions`
--

DROP TABLE IF EXISTS `account_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `account_transactions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `bank_name` varchar(255) DEFAULT NULL,
  `receiver_account_number` varchar(255) DEFAULT NULL,
  `receiver_name` varchar(255) DEFAULT NULL,
  `account_id` bigint DEFAULT NULL,
  `transaction_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKjvxu8dxvrticq6kljvfpv64mb` (`transaction_id`),
  KEY `FK1n6ys6f08bm5km34nlb09fs2y` (`account_id`),
  CONSTRAINT `FK1n6ys6f08bm5km34nlb09fs2y` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`),
  CONSTRAINT `FKfdtdj5mpy67vbl8qcp2e1a03` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account_transactions`
--

LOCK TABLES `account_transactions` WRITE;
/*!40000 ALTER TABLE `account_transactions` DISABLE KEYS */;
INSERT INTO `account_transactions` VALUES (1,'2026-07-04 18:38:05.456637','2026-07-04 18:38:05.456637','EnsarBank','br-683003067','Tanvir',2,1),(2,'2026-07-04 18:49:03.017420','2026-07-04 18:49:03.017420','EnsarBank','acc_683001044082','Badrul Amin',1,2),(3,'2026-07-04 18:49:29.256664','2026-07-04 18:49:29.256664','EnsarBank','br-683003067','Tanvir',2,3);
/*!40000 ALTER TABLE `account_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `accounts`
--

DROP TABLE IF EXISTS `accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accounts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `acc_number` varchar(255) NOT NULL,
  `account_status` enum('ACTIVE','BLOCKED','CLOSED','FREEZE','INACTIVE','PENDING') DEFAULT NULL,
  `account_type` enum('ATM_VAULT','BRANCH_VAULT','BUSINESS','CURRENT','FIXED_DEPOSIT','INTER_BANK_VAULT','JOINT_ACCOUNT','LOAN_VAULT','SAVINGS','STUDENT') DEFAULT NULL,
  `available_balance` decimal(19,4) NOT NULL,
  `current_balance` decimal(19,4) DEFAULT NULL,
  `hold_balance` decimal(19,4) DEFAULT NULL,
  `branch_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKd9o5cs1ijbd13u7kpj57fic6v` (`acc_number`),
  KEY `FK6s1ks79nqt6d16ub5ygm7nm7t` (`branch_id`),
  CONSTRAINT `FK6s1ks79nqt6d16ub5ygm7nm7t` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounts`
--

LOCK TABLES `accounts` WRITE;
/*!40000 ALTER TABLE `accounts` DISABLE KEYS */;
INSERT INTO `accounts` VALUES (1,'2026-07-04 18:30:12.368743','2026-07-04 18:49:29.259656','br-683003067','ACTIVE','BRANCH_VAULT',4996000.0000,4996000.0000,0.0000,1),(2,'2026-07-04 18:33:05.124222','2026-07-04 18:49:29.258659','acc_683001044082',NULL,'STUDENT',4500.0000,4500.0000,500.0000,1);
/*!40000 ALTER TABLE `accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `addresses`
--

DROP TABLE IF EXISTS `addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `addresses` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `address_type` enum('PERMANENT','PRESENT') DEFAULT NULL,
  `area` varchar(255) DEFAULT NULL,
  `holding_no` varchar(255) DEFAULT NULL,
  `postal_code` varchar(255) DEFAULT NULL,
  `policestation_id` bigint DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK3q1lul7sk1ic3vxvtx5hl7tia` (`policestation_id`),
  KEY `FK1fa36y2oqhao3wgg2rw1pi459` (`user_id`),
  CONSTRAINT `FK1fa36y2oqhao3wgg2rw1pi459` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FK3q1lul7sk1ic3vxvtx5hl7tia` FOREIGN KEY (`policestation_id`) REFERENCES `policestations` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `addresses`
--

LOCK TABLES `addresses` WRITE;
/*!40000 ALTER TABLE `addresses` DISABLE KEYS */;
INSERT INTO `addresses` VALUES (1,'2026-07-04 18:31:15.876402','2026-07-04 18:31:15.876402','PRESENT','Basila','Basila','1205',1,NULL),(2,'2026-07-04 18:31:15.878396','2026-07-04 18:31:15.878396','PERMANENT','Basila','Basila','1205',1,NULL),(3,'2026-07-04 18:32:33.418877','2026-07-04 18:32:33.418877','PRESENT','Basila','Basila','1205',1,NULL),(4,'2026-07-04 18:32:33.419869','2026-07-04 18:32:33.419869','PERMANENT','Basila','Basila','1205',1,NULL);
/*!40000 ALTER TABLE `addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `beneficiaries`
--

DROP TABLE IF EXISTS `beneficiaries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `beneficiaries` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `acc_number` varchar(255) DEFAULT NULL,
  `beneficiary_type` enum('BANK','BKASH','CARD','NAGAD') DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `provider` varchar(255) DEFAULT NULL,
  `customer_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKmm45xj9n6sed6pswp1iotl8dq` (`customer_id`),
  CONSTRAINT `FKmm45xj9n6sed6pswp1iotl8dq` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `beneficiaries`
--

LOCK TABLES `beneficiaries` WRITE;
/*!40000 ALTER TABLE `beneficiaries` DISABLE KEYS */;
/*!40000 ALTER TABLE `beneficiaries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `branches`
--

DROP TABLE IF EXISTS `branches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `branches` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `branch_code` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `phone_number` varchar(255) NOT NULL,
  `routing_number` varchar(255) DEFAULT NULL,
  `status` enum('ACTIVE','CLOSED') DEFAULT NULL,
  `type` enum('BRANCH','HEAD_OFFICE','SUB_BRANCH') DEFAULT NULL,
  `police_stationid` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKko4isjnlqhfiubc4n3s5s2dfn` (`email`),
  UNIQUE KEY `UK38tkcayf39evh4mgf71lh010c` (`phone_number`),
  KEY `FKrd34sav9pm9cttid7eacuk9vs` (`police_stationid`),
  CONSTRAINT `FKrd34sav9pm9cttid7eacuk9vs` FOREIGN KEY (`police_stationid`) REFERENCES `policestations` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `branches`
--

LOCK TABLES `branches` WRITE;
/*!40000 ALTER TABLE `branches` DISABLE KEYS */;
INSERT INTO `branches` VALUES (1,'2026-07-04 18:30:12.357450','2026-07-04 18:30:12.357450','Motijheel','HEA0692','superadmin@rnrbank.com','Head Office','+8801531767052','683003067','ACTIVE','HEAD_OFFICE',1);
/*!40000 ALTER TABLE `branches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cards`
--

DROP TABLE IF EXISTS `cards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cards` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `card_network` enum('MASTERCARD','VISA') DEFAULT NULL,
  `card_number` varchar(255) NOT NULL,
  `card_type` enum('CREDIT','DEBIT') DEFAULT NULL,
  `current_daily_usage` double NOT NULL,
  `current_monthly_usage` double NOT NULL,
  `cvv` varchar(255) DEFAULT NULL,
  `daily_limit` double NOT NULL,
  `expiry_date` date DEFAULT NULL,
  `is_international_enabled` bit(1) NOT NULL,
  `is_online_transaction_enabled` bit(1) NOT NULL,
  `monthly_limit` double NOT NULL,
  `pin_hash` varchar(255) DEFAULT NULL,
  `status` enum('ACTIVE','BLOCKED','DISABLED','EXPIRED','PENDING') DEFAULT NULL,
  `account_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKqualp9iflk959u561wanavuj1` (`card_number`),
  UNIQUE KEY `UKra8oohxt2tbbk56h9fxiq493e` (`account_id`),
  CONSTRAINT `FKdjw7dinkpc0f01yk4m57uq2u2` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cards`
--

LOCK TABLES `cards` WRITE;
/*!40000 ALTER TABLE `cards` DISABLE KEYS */;
/*!40000 ALTER TABLE `cards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `dob` datetime(6) DEFAULT NULL,
  `gender` enum('FEMALE','MALE','OTHER') DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `occupation` enum('ACCOUNTANT','ACTOR','ARCHITECT','ARTIST','BANKER','BUSINESS_OWNER','CIVIL_SERVANT','CONSULTANT','DOCTOR','DRIVER','ELECTRICIAN','ENGINEER','EXPATRIATE','FARMER','FOREIGN_EMPLOYEE','FREELANCER','GOVERNMENT_EMPLOYEE','HOMEMAKER','JOURNALIST','LABORER','LAWYER','MECHANIC','MILITARY','MUSICIAN','NGO_EMPLOYEE','OTHERS','PLUMBER','POLICE','POLITICIAN','RELIGIOUS_LEADER','RETIRED','SELF_EMPLOYED','SERVICE_HOLDER','STUDENT','TEACHER','UNEMPLOYED','WRITER') DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `profile` varchar(255) DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKeuat1oase6eqv195jvb71a93s` (`user_id`),
  CONSTRAINT `FKrh1g1a20omjmn6kurd35o3eit` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (1,'2026-07-04 18:32:33.421864','2026-07-04 18:32:33.421864','2026-07-27 06:00:00.000000','MALE','Badrul Amin','STUDENT','01712345678','Badrul_Amin_60038334-39d6-4966-880b-fb4316a85bd3.png',2);
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `districts`
--

DROP TABLE IF EXISTS `districts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `districts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `divisionid` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKd107o8vh2gcyb9tgjuw56pc0n` (`name`),
  KEY `FKkj05lkosbeqc12y3iw35ki7mn` (`divisionid`),
  CONSTRAINT `FKkj05lkosbeqc12y3iw35ki7mn` FOREIGN KEY (`divisionid`) REFERENCES `divisions` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `districts`
--

LOCK TABLES `districts` WRITE;
/*!40000 ALTER TABLE `districts` DISABLE KEYS */;
INSERT INTO `districts` VALUES (1,'2026-07-04 18:29:42.261522','2026-07-04 18:29:42.261522','Motijheel',1);
/*!40000 ALTER TABLE `districts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `divisions`
--

DROP TABLE IF EXISTS `divisions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `divisions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKoujei63okkb767mmtbv0rrx7p` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `divisions`
--

LOCK TABLES `divisions` WRITE;
/*!40000 ALTER TABLE `divisions` DISABLE KEYS */;
INSERT INTO `divisions` VALUES (1,'2026-07-04 18:29:30.511349','2026-07-04 18:29:30.511349','Dhaka');
/*!40000 ALTER TABLE `divisions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employees` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `designation` enum('ACCOUNTS_OFFICER','ADMIN_OFFICER','ASSISTANT_BRANCH_MANAGER','ASSISTANT_GENERAL_MANAGER','AUDIT_OFFICER','BRANCH_MANAGER','CASH_OFFICER','CHIEF_EXECUTIVE_OFFICER','COMPLIANCE_OFFICER','CUSTOMER_SERVICE_OFFICER','DATABASE_ADMINISTRATOR','DEPUTY_GENERAL_MANAGER','DEPUTY_MANAGING_DIRECTOR','FINANCE_OFFICER','GENERAL_MANAGER','HR_OFFICER','INTERN','LOAN_OFFICER','MANAGING_DIRECTOR','NETWORK_ENGINEER','OFFICE_ASSISTANT','OPERATIONS_MANAGER','RELATIONSHIP_MANAGER','SECURITY_OFFICER','SOFTWARE_ENGINEER','SYSTEM_ADMINISTRATOR','TELLER','TREASURY_OFFICER') DEFAULT NULL,
  `dob` datetime(6) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `gender` enum('FEMALE','MALE','OTHER') DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `phone_number` varchar(255) DEFAULT NULL,
  `profile_photo` varchar(255) DEFAULT NULL,
  `branch_id` bigint DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKj9xgmd0ya5jmus09o0b8pqrpb` (`email`),
  UNIQUE KEY `UKg6512s2t9cous2oxa17he4irp` (`phone_number`),
  UNIQUE KEY `UKj2dmgsma6pont6kf7nic9elpd` (`user_id`),
  KEY `FKmef7fp4oyblw7d2y3g1whac3o` (`branch_id`),
  CONSTRAINT `FK69x3vjuy1t5p18a5llb8h2fjx` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKmef7fp4oyblw7d2y3g1whac3o` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
INSERT INTO `employees` VALUES (1,'2026-07-04 18:31:15.884353','2026-07-04 18:31:15.885350','MANAGING_DIRECTOR','2026-07-21 06:00:00.000000','superadmin@rnrbank.com','MALE','Emon Sarkar','0987654321','Emon_Sarkar_8bce6213-1005-4be7-b61a-5d7c89b5c814.png',1,1);
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `journal_entries`
--

DROP TABLE IF EXISTS `journal_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `journal_entries` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `amount` decimal(19,4) NOT NULL,
  `entry_type` enum('CREDIT','DEBIT') NOT NULL,
  `account_id` bigint NOT NULL,
  `transaction_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKbkluuke61pgleg376yb9leuka` (`account_id`),
  KEY `FK3e8cn4ge26el53tmpf8pian0m` (`transaction_id`),
  CONSTRAINT `FK3e8cn4ge26el53tmpf8pian0m` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`),
  CONSTRAINT `FKbkluuke61pgleg376yb9leuka` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `journal_entries`
--

LOCK TABLES `journal_entries` WRITE;
/*!40000 ALTER TABLE `journal_entries` DISABLE KEYS */;
INSERT INTO `journal_entries` VALUES (1,'2026-07-04 18:38:05.453645','2026-07-04 18:38:05.453645',500.0000,'DEBIT',2,1),(2,'2026-07-04 18:38:05.455677','2026-07-04 18:38:05.455677',500.0000,'CREDIT',1,1),(3,'2026-07-04 18:49:03.014451','2026-07-04 18:49:03.014451',5000.0000,'DEBIT',1,2),(4,'2026-07-04 18:49:03.015444','2026-07-04 18:49:03.015444',5000.0000,'CREDIT',2,2),(5,'2026-07-04 18:49:29.253698','2026-07-04 18:49:29.253698',500.0000,'DEBIT',2,3),(6,'2026-07-04 18:49:29.254670','2026-07-04 18:49:29.254670',500.0000,'CREDIT',1,3);
/*!40000 ALTER TABLE `journal_entries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kyc`
--

DROP TABLE IF EXISTS `kyc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kyc` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `status` enum('EXPIRED','PENDING','REJECTED','UNDER_REVIEW','VERIFIED') DEFAULT NULL,
  `customer_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK5plosanxn2vawddmmc5fkha07` (`customer_id`),
  CONSTRAINT `FK2qhciw6flmi7mamir7g88jv0q` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kyc`
--

LOCK TABLES `kyc` WRITE;
/*!40000 ALTER TABLE `kyc` DISABLE KEYS */;
INSERT INTO `kyc` VALUES (1,'2026-07-04 18:32:33.423859','2026-07-04 18:32:33.423859','PENDING',1);
/*!40000 ALTER TABLE `kyc` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kyc_documents`
--

DROP TABLE IF EXISTS `kyc_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kyc_documents` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `doc_type` enum('BIRTH_CERTIFICATE','DRIVING_LICENSE','NID','PASSPORT') NOT NULL,
  `path` varchar(255) NOT NULL,
  `kyc_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKe80n18oea46s5hxspijo0jb5w` (`doc_type`),
  KEY `FKqtngolm4h285jp3on0ymmp878` (`kyc_id`),
  CONSTRAINT `FKqtngolm4h285jp3on0ymmp878` FOREIGN KEY (`kyc_id`) REFERENCES `kyc` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kyc_documents`
--

LOCK TABLES `kyc_documents` WRITE;
/*!40000 ALTER TABLE `kyc_documents` DISABLE KEYS */;
/*!40000 ALTER TABLE `kyc_documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loan_applications`
--

DROP TABLE IF EXISTS `loan_applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loan_applications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `annual_interest_rate` decimal(5,2) NOT NULL,
  `application_date` date DEFAULT NULL,
  `approval_date` date DEFAULT NULL,
  `disbursement_date` date DEFAULT NULL,
  `disbursement_transaction_ref` varchar(255) DEFAULT NULL,
  `emi_amount` decimal(19,2) NOT NULL,
  `next_due_date` date DEFAULT NULL,
  `outstanding_balance` decimal(19,2) NOT NULL,
  `principal_amount` decimal(19,2) NOT NULL,
  `rejection_reason` varchar(255) DEFAULT NULL,
  `status` enum('ACTIVE','APPROVED','CLOSED','DEFAULTED','DISBURSED','OVERDUE','PENDING','REJECTED') NOT NULL,
  `tenure_months` int NOT NULL,
  `total_payable` decimal(19,2) NOT NULL,
  `account_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKl0d4j5nepu459bfrqwq8wxo5h` (`account_id`),
  CONSTRAINT `FKl0d4j5nepu459bfrqwq8wxo5h` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loan_applications`
--

LOCK TABLES `loan_applications` WRITE;
/*!40000 ALTER TABLE `loan_applications` DISABLE KEYS */;
/*!40000 ALTER TABLE `loan_applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loan_repayments`
--

DROP TABLE IF EXISTS `loan_repayments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loan_repayments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `due_date` date NOT NULL,
  `emi_amount` decimal(19,2) NOT NULL,
  `installment_number` int NOT NULL,
  `interest_component` decimal(19,2) NOT NULL,
  `paid_date` date DEFAULT NULL,
  `principal_component` decimal(19,2) NOT NULL,
  `remaining_balance_after` decimal(19,2) DEFAULT NULL,
  `status` enum('LATE','MISSED','PAID','PENDING') NOT NULL,
  `transaction_ref` varchar(255) DEFAULT NULL,
  `loan_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKk61sxs1t0kkr3y6t48xu9waib` (`loan_id`),
  CONSTRAINT `FKk61sxs1t0kkr3y6t48xu9waib` FOREIGN KEY (`loan_id`) REFERENCES `loan_applications` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loan_repayments`
--

LOCK TABLES `loan_repayments` WRITE;
/*!40000 ALTER TABLE `loan_repayments` DISABLE KEYS */;
/*!40000 ALTER TABLE `loan_repayments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nominees`
--

DROP TABLE IF EXISTS `nominees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nominees` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `nid_back` varchar(255) NOT NULL,
  `nid_front` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `photo` varchar(255) NOT NULL,
  `account_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKacclyhh3onwtg1jcgt8m6kicc` (`account_id`),
  CONSTRAINT `FKrc30ecflgnqrd3rcuf2ymd84l` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nominees`
--

LOCK TABLES `nominees` WRITE;
/*!40000 ALTER TABLE `nominees` DISABLE KEYS */;
INSERT INTO `nominees` VALUES (1,'2026-07-04 18:33:05.127215','2026-07-04 18:33:05.127215','e@e.c','Emon','Badrul_Amin_0b278051-c12a-4958-bd2f-504e55975a62.png','Badrul_Amin_92935d30-c4db-4c8e-b9b4-d29142e0f3d2.png','01875215562','Badrul_Amin_b0aceb1c-5979-41bf-9621-4e89efbecfe7.png',2);
/*!40000 ALTER TABLE `nominees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `policestations`
--

DROP TABLE IF EXISTS `policestations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `policestations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `district_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKa8qg39gnjde9t8dc8m9a4qbsb` (`district_id`),
  CONSTRAINT `FKa8qg39gnjde9t8dc8m9a4qbsb` FOREIGN KEY (`district_id`) REFERENCES `districts` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `policestations`
--

LOCK TABLES `policestations` WRITE;
/*!40000 ALTER TABLE `policestations` DISABLE KEYS */;
INSERT INTO `policestations` VALUES (1,'2026-07-04 18:29:50.652281','2026-07-04 18:29:50.652281','Motijheel',1);
/*!40000 ALTER TABLE `policestations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transactions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `amount` decimal(19,4) NOT NULL,
  `channel` enum('AGENT_BANKING','API','ATM','BEFTN','BRANCH','CARD','E_COMMERCE','INTERNET_BANKING','MOBILE_BANKING','NPSB','POS','QR_PAYMENT','RTGS','SWIFT','SYSTEM') NOT NULL,
  `charge_amount` decimal(19,4) DEFAULT NULL,
  `reference_no` varchar(255) NOT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `status` enum('CANCELLED','FAILED','PENDING','REVERSED','SUCCESS') NOT NULL,
  `transaction_id` varchar(255) DEFAULT NULL,
  `transaction_type` enum('ATM_DEPOSIT','ATM_WITHDRAW','DEPOSIT','LOAN_DISBURSEMENT','LOAN_REPAYMENT','PAYMENT','REFUND','TRANSFER','WITHDRAW') NOT NULL,
  `vat_amount` decimal(19,4) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK1467v9jokuyrdfd3irs87tcub` (`reference_no`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
INSERT INTO `transactions` VALUES (1,'2026-07-04 18:38:05.437712','2026-07-04 18:38:05.437712',500.0000,'INTERNET_BANKING',0.0000,'E3B1FA28794D','eg','SUCCESS','F996ED802723','TRANSFER',0.0000),(2,'2026-07-04 18:49:03.012433','2026-07-04 18:49:03.012433',5000.0000,'BRANCH',0.0000,'4A9CF638A880','dd','SUCCESS','8C941D8E33BC','TRANSFER',0.0000),(3,'2026-07-04 18:49:29.251677','2026-07-04 18:49:29.251677',500.0000,'INTERNET_BANKING',0.0000,'23FC8B75E38A','','SUCCESS','EC339DEB0E17','TRANSFER',0.0000);
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
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
  `updated_at` datetime(6) DEFAULT NULL,
  `active` bit(1) NOT NULL,
  `email` varchar(255) NOT NULL,
  `is_email_verified` bit(1) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('ACCOUNTANT','ADMIN','ATM_MANAGER','AUDITOR','BRANCH_MANAGER','CASHIER','CUSTOMER','CUSTOMER_SERVICE','LOAN_OFFICER','SUPER_ADMIN') NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK6dotkott2kjsp8vw4d0m25fb7` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'2026-07-04 18:31:15.874379','2026-07-04 18:31:15.874379',_binary '\0','superadmin@rnrbank.com',_binary '\0','12345678','ADMIN'),(2,'2026-07-04 18:32:33.417843','2026-07-04 18:32:33.417843',_binary '\0','badrulamin69@gmail.com',_binary '\0','12345678','CUSTOMER');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-04 18:50:59
