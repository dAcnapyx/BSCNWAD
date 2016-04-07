-- MySQL dump 10.13  Distrib 5.6.27, for debian-linux-gnu (x86_64)
--
-- Host: 127.0.0.1    Database: blog_example
-- ------------------------------------------------------
-- Server version	5.6.27-0ubuntu1

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
-- Table structure for table `posts`
--

DROP TABLE IF EXISTS `posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `posts` (
  `id` int(4) unsigned NOT NULL AUTO_INCREMENT,
  `date` date DEFAULT NULL,
  `title` varchar(100) DEFAULT NULL,
  `resume` varchar(255) DEFAULT NULL,
  `content` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `posts`
--

LOCK TABLES `posts` WRITE;
/*!40000 ALTER TABLE `posts` DISABLE KEYS */;
INSERT INTO `posts` VALUES (1,'2001-01-01','Eos nullam assentior','Scripta qualisque assueverit ea sed, possit possim nec at, everti adipisci gloriatur cu quo. Ut vix vivendo tincidunt intellegebat, pro nulla inciderint id, id scaevola nominati sed. Quod quas apeirian te vis. Est sint ancillae cu.','<p>Nam elit recusabo deterruisset no, pri no stet expetendis. At facer facilis temporibus vis, mea aliquip aliquid epicuri id. Usu putent omittantur ei, vim et fugit gloriatur. Cum no corpora adipisci qualisque, usu et tollit adipisci theophrastus, cu virtute mandamus cum.</p><p>Illud veritus accumsan per eu, propriae voluptaria delicatissimi quo ex. Vel cu epicurei pertinax. Ubique numquam theophrastus at mei, sea at qualisque patrioque. Ea dicit saepe usu, at nam exerci nostrud, cu rebum civibus mandamus qui. Ex latine dolorum voluptua mei, vis an alia facilisis.</p><p>Ex diam harum dolore pro. Ne has fugit quando petentium, tation scaevola praesent mea id, in tota salutatus efficiendi pro. Per fugit aperiri tincidunt cu. Vel deserunt pertinacia cu. Ius ad purto detracto reprehendunt, at ludus option sea, exerci audire id nam.</p>'),(2,'2005-01-15','An his harum iriure deterruisset.','Lorem ipsum dolor sit amet, amet alia appareat et mel, ei quo sumo summo definitionem. Discere ponderum et nec, sit illum argumentum ei.','<p>Nec id fugit impetus insolens, ad pro regione veritus eloquentiam, has graeci integre interpretaris cu. Eam bonorum ceteros persequeris ne, oblique delectus usu in, quo modus nominati no. Vide soleat cum in, dicam deterruisset eos no. Scaevola volutpat pri ad, delectus postulant ut vix, vis vivendum facilisis id. Per ipsum nulla eu, ut vim omnes vocent tibique, ex eos meis epicuri. Sit dicat graeci salutandi id, eu sea rebum eruditi quaerendum.</p><p>Placerat expetendis eos ad, ne nec iusto gubergren. Honestatis instructior vim ut, ex vim oratio essent viderer. Dico feugait disputationi eam no, in pri animal tamquam epicurei. In est iriure iudicabit, ut dicit elitr eos, vix ut ornatus fabellas elaboraret. Nisl illud ei eos, equidem percipitur has cu. Ea posse quando invidunt eum.</p>'),(3,'2005-03-22','Delicata signiferumque sea te.','Ad eos dictas bonorum assentior, laudem impedit id sea. Ut fierent elaboraret referrentur vel, eu homero torquatos sed. Sed principes assentior scripserit et,','<p>Eum nobis tation tractatos in, movet dolorum adversarium at eam. Per at prima omnes. Usu autem necessitatibus ad. Duis solum epicurei vim ne, no accumsan atomorum delicata pro. Pro id falli ridens, est platonem postulant an, et homero nominavi tacimates eam. Ea eam probo dicant. Pro habemus intellegat no, copiosae scaevola eleifend vel in, mundi complectitur pri ne.</p><p>Per paulo dolor deseruisse cu, discere nostrum phaedrum ius ut, mentitum electram ne vis. Ei porro error eos, ei augue vidisse eum, ex error luptatum petentium cum. Sit eu omnis ullum adipisci. Melius deseruisse te nec. Tollit exerci vix ex.</p><p>Appareat inciderint est cu, an possit dissentias per, usu omnis quidam dolores ea. Stet aeque ei quo, mel at denique reprimique. Id nec prima virtute. Vim ei saepe detracto.</p>'),(4,'2006-06-12','Sea dicant impetus imperdiet at,','Dolor integre definiebas usu ea. In timeam assentior est,','<p>Agam possit patrioque vis no. Cum et veri adhuc. Te nobis consetetur eam, laoreet appareat antiopam id mea. Movet nostrud noluisse pro et. Falli veritus mnesarchum ad quo, adhuc paulo cum te. Paulo discere disputando ut eum, ne veritus menandri assentior usu, vix lorem nostrud sapientem ex. Inermis antiopam quaerendum ius ad.</p><p>Vidit tollit aliquip et ius. Accusamus suscipiantur mea eu, ne nec ludus omnium fuisset. Eius veri consectetuer mei ex, an quot invidunt vix. Te movet tamquam reprehendunt nam, modo mollis vix ex. Eos quod nemore no.</p>'),(5,'2015-01-22','Te ferri singulis eos, ius quando antiopam no.','Possit iracundia definitiones per an. Ornatus urbanitas moderatius est ea. Pri cu latine elaboraret, verear fabulas ad vix.','<p>Ius ea vidit dissentiunt, ne fierent pertinax interpretaris nec. At erat iuvaret quo. Ex sea paulo putent intellegam. Ne mel eripuit senserit, in vix numquam feugait senserit. Cu usu atqui nulla viris. Solet urbanitas assentior cu vel, ei vim alii expetendis.</p><p>Eu eum molestie percipitur. Admodum intellegebat ad duo, nam novum consul civibus in. Pri ut clita graecis euripidis, ea sit brute dicat. Ex vix regione numquam efficiendi, vim ex rebum utroque euripidis. Omnium philosophia theophrastus an quo. Wisi dictas ea ius.</p><p>Mel audiam utroque quaestio te. Propriae recusabo delicatissimi ea nam. Per ad insolens delicatissimi, eam et denique appellantur. Dico iriure pri id. Accumsan iracundia reprehendunt sea ut, ad tamquam posidonium his, sed duis error zril te. Eos eius doctus comprehensam id, ea mea tale salutandi honestatis, ad quo vidit omnis.</p>'),(6,'2007-05-12','No nec consul consequat assueverit.','Te dico voluptua indoctum per, simul dicant definitiones ex pri.','<p>Id bonorum argumentum pri. Partiendo forensibus referrentur duo ea. Volutpat temporibus eu eum. No qui impedit perpetua theophrastus, vim ut amet utamur. Eam ne elit solet soleat, pri an virtute torquatos.</p><p>Atomorum contentiones an pri, sed no odio illud mollis. Tollit labore elaboraret ea usu, tale albucius eum cu. Id summo salutandi explicari vel, in habeo causae deterruisset his. Graecis forensibus eu qui, deleniti constituto ei mei. Vivendo platonem et vix. Percipitur mediocritatem cum an, mnesarchum reformidans delicatissimi ei sea.</p>'),(7,'2013-07-14','Veri vivendo alienum cum cu.','Et modo paulo phaedrum est, et eos.','<p>Veri vivendo alienum cum cu, doming civibus lucilius mel at, eu exerci accumsan pri. Ea idque facer forensibus nec. Eligendi evertitur ex mel, elit causae reformidans eu sit. Ad denique voluptatum mel, usu ex sint definitiones.</p><p>Enim dicta mel eu, eos ad case dictas, no vis zril putent ponderum. Sea aeque iudico principes at, in oblique omittantur theophrastus qui, ut his meis numquam gloriatur. Accusamus molestiae honestatis ex nec, ad odio mollis graecis has. Cu vide feugiat accusata cum. Mea ex accommodare intellegebat. An nobis regione verterem quo, quo id vocent audire.</p><p>Eu est sint dolor, no mei fastidii facilisi consequat. Duo at tempor convenire, in fastidii legendos constituam duo. Ne vide fastidii prodesset sed, eu sit omnesque dignissim posidonium. Qui ut eirmod integre intellegat, eum vide quaeque necessitatibus ut, pro ne error lobortis gubergren. At novum dissentiunt eos, id qui velit graeci, error eripuit menandri mea ex. Te bonorum senserit mediocritatem vis, in epicurei menandri intellegam mea.</p><p>Mei luptatum concludaturque ea, mei ea laboramus argumentum. Augue signiferumque eu mea, nonumes mediocritatem te nec. Ad novum erroribus complectitur vis, et nibh delenit sit, mel an consul commune. Ius prima nostrud suscipit no, ea mutat error dicit pri, pro an nobis suscipit recteque. Nam id aliquip docendi inimicus.</p>');
/*!40000 ALTER TABLE `posts` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2016-04-06 13:20:54
