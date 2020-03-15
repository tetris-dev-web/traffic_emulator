-- MySQL dump 10.13  Distrib 5.6.35, for Linux (x86_64)
--
-- Host: 127.0.0.1    Database: 20_2_0_0_1_0
-- ------------------------------------------------------
-- Server version	5.6.35 Source distribution

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `dc`
--

DROP TABLE IF EXISTS `dc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dc` (
  `op16` smallint(5) unsigned DEFAULT '0',
  `cla16` smallint(5) unsigned DEFAULT '0',
  `clb16` smallint(5) unsigned DEFAULT '0',
  `tick16` smallint(5) unsigned DEFAULT '0',
  `cab64` bigint(20) unsigned DEFAULT '0',
  `ref64` bigint(20) unsigned DEFAULT '0',
  `id64` bigint(20) unsigned DEFAULT '0',
  `stamp64` bigint(20) unsigned DEFAULT '0',
  `cab32` int(10) unsigned DEFAULT '0',
  `ref32` int(10) unsigned DEFAULT '0',
  `id32` int(10) unsigned DEFAULT '0',
  `tick32` int(10) unsigned DEFAULT '0',
  `etick32` int(10) unsigned DEFAULT '0',
  `str256` varchar(256) COLLATE latin1_bin NOT NULL DEFAULT '',
  `jstr60k` varchar(61440) COLLATE latin1_bin NOT NULL DEFAULT ''
) ENGINE=ROCKSDB DEFAULT CHARSET=latin1 COLLATE=latin1_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dc`
--

LOCK TABLES `dc` WRITE;
/*!40000 ALTER TABLE `dc` DISABLE KEYS */;
INSERT INTO `dc` VALUES (1,0,0,0,1441714830712045568,0,0,0,0,0,0,0,0,'',''),(2,0,0,0,1441714830711980032,0,0,0,0,0,0,0,0,'tcp://127.0.0.1:50000',''),(2,0,0,0,1441714830711980033,0,0,0,0,0,0,0,0,'tcp://127.0.0.1:50001',''),(2,0,0,0,1441714830711980034,0,0,0,0,0,0,0,0,'tcp://127.0.0.1:50002',''),(2,0,0,0,1441714830712012800,0,0,0,0,0,0,0,0,'tcp://127.0.0.1:51000',''),(2,0,0,0,1441714830712012801,0,0,0,0,0,0,0,0,'tcp://127.0.0.1:51001',''),(2,0,0,0,1441714830712012802,0,0,0,0,0,0,0,0,'tcp://127.0.0.1:51002',''),(4,0,0,0,1441714830712045568,0,0,0,0,0,0,0,0,'',''),(5,0,0,0,1441714830712045568,0,1441714830711980032,0,0,0,0,0,0,'',''),(5,4,0,0,1441714830712045568,0,1441714830711980033,0,1,0,0,0,0,'',''),(5,8,0,0,1441714830712045568,0,1441714830711980034,0,2,0,0,0,0,'',''),(4,0,0,0,1441724726323249153,0,0,0,0,0,0,0,0,'',''),(5,1,0,0,1441724726323249153,0,1441714830711980032,0,0,0,0,0,0,'',''),(5,5,0,0,1441724726323249153,0,1441714830711980033,0,1,0,0,0,0,'',''),(5,9,0,0,1441724726323249153,0,1441714830711980034,0,2,0,0,0,0,'',''),(4,0,0,0,1441714830725152775,0,0,0,0,0,0,0,0,'',''),(5,2,0,0,1441714830725152775,0,1441714830711980032,0,0,0,0,0,0,'',''),(5,6,0,0,1441714830725152775,0,1441714830711980033,0,1,0,0,0,0,'',''),(5,10,0,0,1441714830725152775,0,1441714830711980034,0,2,0,0,0,0,'','');
/*!40000 ALTER TABLE `dc` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Rows found for dc: 19
--

--
-- Table structure for table `log`
--

DROP TABLE IF EXISTS `log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `log` (
  `op16` smallint(5) unsigned DEFAULT '0',
  `ref64` bigint(20) unsigned DEFAULT '0',
  `cla16` smallint(5) unsigned DEFAULT '0',
  `blob16m` mediumblob
) ENGINE=ROCKSDB DEFAULT CHARSET=latin1 COLLATE=latin1_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `log`
--

LOCK TABLES `log` WRITE;
/*!40000 ALTER TABLE `log` DISABLE KEYS */;
/*!40000 ALTER TABLE `log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Rows found for log: 0
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2019-12-30 10:41:58
