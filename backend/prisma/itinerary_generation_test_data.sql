-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 26, 2026 at 02:41 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `intellitrip`
--

-- --------------------------------------------------------

--
-- Table structure for table `tbl_attraction`
--

CREATE TABLE `tbl_attraction` (
  `attraction_id` int(10) UNSIGNED NOT NULL,
  `attraction_code` varchar(50) NOT NULL,
  `attraction_name` varchar(255) NOT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `cost` decimal(10,2) NOT NULL,
  `duration_minutes` int(11) NOT NULL,
  `open_time` time NOT NULL,
  `close_time` time NOT NULL,
  `category_id` int(10) UNSIGNED NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `modified_at` datetime NOT NULL DEFAULT current_timestamp(),
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `is_test` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tbl_attraction`
--

INSERT INTO `tbl_attraction` (`attraction_id`, `attraction_code`, `attraction_name`, `latitude`, `longitude`, `cost`, `duration_minutes`, `open_time`, `close_time`, `category_id`, `created_at`, `modified_at`, `is_deleted`, `is_test`) VALUES
(1, 'ATTR-TEST-ANANDA', 'Ananda Temple', 21.17068591, 94.86781085, 5000.00, 75, '06:00:00', '18:30:00', 2, '2026-05-25 21:25:29', '2026-05-25 21:25:29', 0, 1),
(2, 'ATTR-TEST-SHWEZIGON', 'Shwezigon Pagoda', 21.19530550, 94.89388582, 5000.00, 75, '05:30:00', '20:00:00', 2, '2026-05-25 21:25:29', '2026-05-25 21:25:29', 0, 1),
(3, 'ATTR-TEST-DHAMMAYANGYI', 'Dhammayangyi Temple', 21.16203656, 94.87288948, 5000.00, 90, '06:00:00', '18:30:00', 2, '2026-05-25 21:25:29', '2026-05-25 21:25:29', 0, 1),
(4, 'ATTR-TEST-THATBYINNYU', 'Thatbyinnyu Temple', 21.16861491, 94.86298923, 5000.00, 60, '06:00:00', '18:30:00', 2, '2026-05-25 21:25:29', '2026-05-25 21:25:29', 0, 1),
(5, 'ATTR-TEST-SULAMANI', 'Sulamani Temple', 21.16493307, 94.88130292, 5000.00, 75, '06:00:00', '18:30:00', 2, '2026-05-25 21:25:29', '2026-05-25 21:25:29', 0, 1),
(6, 'ATTR-TEST-HTILOMINLO', 'Htilominlo Temple', 21.17853941, 94.87929716, 5000.00, 75, '06:00:00', '18:30:00', 2, '2026-05-25 21:25:29', '2026-05-25 21:25:29', 0, 1),
(7, 'ATTR-TEST-BUPAYA', 'Bupaya Pagoda', 21.17616840, 94.85788328, 3000.00, 45, '06:00:00', '19:00:00', 2, '2026-05-25 21:25:29', '2026-05-25 21:25:29', 0, 1),
(8, 'ATTR-TEST-LAWKANANDA', 'Lawkananda Pagoda', 21.12709887, 94.85040596, 3000.00, 60, '06:00:00', '19:30:00', 2, '2026-05-25 21:25:29', '2026-05-25 21:25:29', 0, 1),
(9, 'ATTR-TEST-MUSEUM', 'Bagan Archaeological Museum', 21.16796459, 94.85637943, 7000.00, 120, '09:00:00', '16:30:00', 6, '2026-05-25 21:25:29', '2026-05-25 21:25:29', 0, 1),
(10, 'ATTR-TEST-GUBYAUKGYI', 'Gubyaukgyi Temple', 21.15724093, 94.86077110, 5000.00, 75, '06:00:00', '18:00:00', 6, '2026-05-25 21:25:29', '2026-05-25 21:25:29', 0, 1),
(11, 'ATTR-TEST-THARABAR', 'Tharabar Gate', 21.17215159, 94.86453119, 2000.00, 45, '06:00:00', '18:30:00', 6, '2026-05-25 21:25:29', '2026-05-25 21:25:29', 0, 1),
(12, 'ATTR-TEST-PALACE', 'Bagan Palace Site', 21.17345719, 94.86311969, 5000.00, 90, '09:00:00', '17:00:00', 6, '2026-05-25 21:25:29', '2026-05-25 21:25:29', 0, 1),
(13, 'ATTR-TEST-LACQUERWARE', 'Lacquerware Workshop', 21.17417251, 94.86934655, 8000.00, 90, '09:00:00', '17:00:00', 1, '2026-05-25 21:25:29', '2026-05-25 21:25:29', 0, 1),
(14, 'ATTR-TEST-VILLAGE', 'Minnathu Village', 21.15886584, 94.90203178, 6000.00, 120, '08:00:00', '17:00:00', 1, '2026-05-25 21:25:29', '2026-05-25 21:25:29', 0, 1),
(15, 'ATTR-TEST-HORSE-CART', 'Horse Cart Heritage Ride', 21.16691707, 94.87061368, 15000.00, 120, '08:00:00', '17:30:00', 1, '2026-05-25 21:25:29', '2026-05-25 21:25:29', 0, 1),
(16, 'ATTR-TEST-VIEWING-TOWER', 'Bagan Viewing Tower', 21.17170338, 94.90248050, 15000.00, 60, '05:30:00', '20:00:00', 3, '2026-05-25 21:25:29', '2026-05-25 21:25:29', 0, 1),
(17, 'ATTR-TEST-IRRAWADDY', 'Irrawaddy River Viewpoint', 21.18164268, 94.86363875, 3000.00, 60, '06:00:00', '19:00:00', 3, '2026-05-25 21:25:29', '2026-05-25 21:25:29', 0, 1),
(18, 'ATTR-TEST-MOUNT-POPA', 'Mount Popa Viewpoint', 20.92080000, 95.25390000, 20000.00, 180, '08:00:00', '17:00:00', 3, '2026-05-25 21:25:29', '2026-05-25 21:25:29', 0, 1),
(19, 'ATTR-TEST-SUNSET-HILL', 'Sunset Hill Viewpoint', 21.16284999, 94.88012829, 3000.00, 60, '06:00:00', '19:00:00', 3, '2026-05-25 21:25:29', '2026-05-25 21:25:29', 0, 1),
(20, 'ATTR-TEST-FOOD-STREET', 'Nyaung U Food Street', 21.19317684, 94.89673963, 12000.00, 90, '17:00:00', '22:00:00', 4, '2026-05-25 21:25:29', '2026-05-25 21:25:29', 0, 1),
(21, 'ATTR-TEST-DINNER-SHOW', 'Cultural Dinner Show', 21.15680000, 94.86190000, 45000.00, 150, '18:00:00', '22:00:00', 4, '2026-05-25 21:25:29', '2026-05-25 21:25:29', 0, 1),
(22, 'ATTR-TEST-MARKET', 'Mani Sithu Market', 21.20074707, 94.90880706, 3000.00, 75, '07:00:00', '12:00:00', 5, '2026-05-25 21:25:29', '2026-05-25 21:25:29', 0, 1),
(23, 'ATTR-0001', 'Testing new Data', 21.17943779, 94.86598758, 15000.00, 75, '09:00:00', '21:00:00', 4, '2026-05-26 04:23:27', '2026-05-26 04:23:27', 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `tbl_attraction_experience`
--

CREATE TABLE `tbl_attraction_experience` (
  `experience_id` int(10) UNSIGNED NOT NULL,
  `experience_code` varchar(50) NOT NULL,
  `attraction_id` int(10) UNSIGNED NOT NULL,
  `experience_type` varchar(100) NOT NULL,
  `best_time_start` time NOT NULL,
  `best_time_end` time NOT NULL,
  `experience_score_weight` float NOT NULL,
  `time_bonus_multiplier` float NOT NULL DEFAULT 1,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `description` varchar(1000) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tbl_attraction_experience`
--

INSERT INTO `tbl_attraction_experience` (`experience_id`, `experience_code`, `attraction_id`, `experience_type`, `best_time_start`, `best_time_end`, `experience_score_weight`, `time_bonus_multiplier`, `is_deleted`, `description`) VALUES
(1, 'EXP-TEST-ANANDA-MORN', 1, 'Quiet morning', '07:00:00', '09:30:00', 0.85, 1.15, 0, 'Best early morning'),
(2, 'EXP-TEST-SHWEZIGON-SUNSET', 2, 'Golden hour pagoda', '16:30:00', '18:30:00', 1, 1.3, 0, 'Sunset experience'),
(3, 'EXP-TEST-DHAMMA-MORN', 3, 'Morning photography', '08:00:00', '10:30:00', 0.8, 1.15, 0, 'Best morning light'),
(4, 'EXP-TEST-THATBYI-AFT', 4, 'Afternoon temple', '14:00:00', '16:30:00', 0.75, 1.1, 0, 'Afternoon slot'),
(5, 'EXP-TEST-SULAMANI-SUNSET', 5, 'Late afternoon murals', '15:30:00', '17:30:00', 0.9, 1.2, 0, 'Good for late day'),
(6, 'EXP-TEST-MUSEUM-MIDDAY', 9, 'Indoor midday', '10:00:00', '14:00:00', 0.85, 1.15, 0, 'Avoid heat'),
(7, 'EXP-TEST-LACQUER-AFT', 13, 'Afternoon craft demo', '13:00:00', '16:00:00', 0.9, 1.2, 0, 'Workshop timing'),
(8, 'EXP-TEST-VILLAGE-MORN', 14, 'Morning village walk', '08:30:00', '11:30:00', 0.8, 1.15, 0, 'Local life'),
(9, 'EXP-TEST-TOWER-SUNRISE', 16, 'Sunrise panorama', '05:30:00', '07:00:00', 1, 1.35, 0, 'Best at sunrise'),
(10, 'EXP-TEST-IRRAWADDY-SUNSET', 17, 'River sunset', '16:30:00', '18:30:00', 0.95, 1.25, 0, 'Sunset on river'),
(11, 'EXP-TEST-POPA-DAY', 18, 'Day viewpoint', '09:00:00', '13:00:00', 0.9, 1.15, 0, 'Full morning trip'),
(12, 'EXP-TEST-MARKET-MORN', 22, 'Morning market', '07:30:00', '10:30:00', 0.8, 1.15, 0, 'Market only morning'),
(13, 'EXP-TEST-FOOD-DINNER', 20, 'Evening food walk', '18:00:00', '21:00:00', 0.95, 1.25, 0, 'Dinner time'),
(14, 'EXP-TEST-DINNER-EVENING', 21, 'Evening cultural dinner', '18:30:00', '21:30:00', 1, 1.3, 0, 'Main evening activity'),
(15, 'EXP-TEST-HTILOMINLO-AFT', 6, 'Afternoon temple', '14:30:00', '17:00:00', 0.85, 1.15, 0, 'Quiet afternoon'),
(16, 'EXP-TEST-BUPAYA-SUNSET', 7, 'Riverside sunset', '16:30:00', '18:30:00', 0.9, 1.25, 0, 'Sunset view'),
(17, 'EXP-TEST-LAWKANANDA-MORN', 8, 'Morning riverside', '07:00:00', '09:30:00', 0.8, 1.15, 0, 'Fresh morning'),
(18, 'EXP-TEST-GUBYAUK-MIDDAY', 10, 'Mural history', '10:00:00', '13:00:00', 0.85, 1.15, 0, 'Indoor midday'),
(19, 'EXP-TEST-THARABAR-MORN', 11, 'Morning heritage gate', '08:00:00', '10:00:00', 0.7, 1.1, 0, 'Short morning'),
(20, 'EXP-TEST-PALACE-MIDDAY', 12, 'Midday palace ruins', '10:00:00', '14:00:00', 0.8, 1.1, 0, 'Historical midday'),
(21, 'EXP-TEST-HORSE-AFT', 15, 'Afternoon heritage ride', '14:00:00', '17:00:00', 0.9, 1.2, 0, 'Long afternoon'),
(22, 'EXP-TEST-SUNSET-HILL', 19, 'Sunset viewpoint', '16:30:00', '18:30:00', 1, 1.3, 0, 'Prime sunset spot');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_category`
--

CREATE TABLE `tbl_category` (
  `category_id` int(10) UNSIGNED NOT NULL,
  `category_code` varchar(50) NOT NULL,
  `category_name` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `modified_at` datetime NOT NULL DEFAULT current_timestamp(),
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tbl_category`
--

INSERT INTO `tbl_category` (`category_id`, `category_code`, `category_name`, `created_at`, `modified_at`, `is_deleted`) VALUES
(1, 'CAT-CULTURE', 'Culture', '2026-05-25 21:25:29', '2026-05-25 21:25:29', 0),
(2, 'CAT-RELIGIOUS', 'Religious', '2026-05-25 21:25:29', '2026-05-25 21:25:29', 0),
(3, 'CAT-NATURE', 'Nature', '2026-05-25 21:25:29', '2026-05-25 21:25:29', 0),
(4, 'CAT-FOOD', 'Food', '2026-05-25 21:25:29', '2026-05-25 21:25:29', 0),
(5, 'CAT-SHOPPING', 'Shopping', '2026-05-25 21:25:29', '2026-05-25 21:25:29', 0),
(6, 'CAT-HISTORY', 'History', '2026-05-25 21:25:29', '2026-05-25 21:25:29', 0),
(7, 'CAT-0001', 'TESTING CATEGORY (UPDATE)', '2026-05-26 04:26:01', '2026-05-26 04:26:01', 0);

-- --------------------------------------------------------

--
-- Table structure for table `tbl_itinerary`
--

CREATE TABLE `tbl_itinerary` (
  `itinerary_id` int(10) UNSIGNED NOT NULL,
  `itinerary_code` varchar(50) NOT NULL,
  `trip_id` int(10) UNSIGNED NOT NULL,
  `generated_at` datetime NOT NULL DEFAULT current_timestamp(),
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `total_cost` decimal(10,2) NOT NULL,
  `travel_cost` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total_distance` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total_travel_time` int(11) NOT NULL DEFAULT 0,
  `total_visit_time` int(11) NOT NULL DEFAULT 0,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tbl_itinerary`
--

INSERT INTO `tbl_itinerary` (`itinerary_id`, `itinerary_code`, `trip_id`, `generated_at`, `created_at`, `is_active`, `total_cost`, `travel_cost`, `total_distance`, `total_travel_time`, `total_visit_time`, `is_deleted`) VALUES
(1, 'ITIN-0001', 1, '2026-05-26 11:27:49', '2026-05-26 11:27:49', 1, 32000.00, 0.00, 0.00, 0, 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `tbl_itinerary_item`
--

CREATE TABLE `tbl_itinerary_item` (
  `item_id` int(10) UNSIGNED NOT NULL,
  `item_code` varchar(50) NOT NULL,
  `itinerary_id` int(10) UNSIGNED NOT NULL,
  `day_number` int(11) NOT NULL,
  `visit_start_time` time NOT NULL,
  `visit_end_time` time NOT NULL,
  `attraction_id` int(10) UNSIGNED NOT NULL,
  `distance_from_previous` decimal(8,2) NOT NULL,
  `final_score` float NOT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tbl_itinerary_item`
--

INSERT INTO `tbl_itinerary_item` (`item_id`, `item_code`, `itinerary_id`, `day_number`, `visit_start_time`, `visit_end_time`, `attraction_id`, `distance_from_previous`, `final_score`, `is_deleted`) VALUES
(1, 'ITEM-0001', 1, 1, '08:02:00', '08:47:00', 11, 0.64, 0.743685, 0),
(2, 'ITEM-0002', 1, 1, '08:48:00', '10:03:00', 1, 0.38, 0.765361, 0),
(3, 'ITEM-0003', 1, 1, '10:06:00', '11:36:00', 3, 1.10, 0.755157, 0),
(4, 'ITEM-0004', 1, 1, '12:10:00', '13:40:00', 12, 1.62, 0.777057, 0),
(5, 'ITEM-0005', 1, 1, '13:42:00', '15:42:00', 9, 0.93, 0.771423, 0),
(6, 'ITEM-0006', 1, 1, '15:44:00', '16:44:00', 4, 0.69, 0.813145, 0),
(7, 'ITEM-0007', 1, 1, '16:46:00', '17:31:00', 7, 0.99, 0.82184, 0);

-- --------------------------------------------------------

--
-- Table structure for table `tbl_system_config`
--

CREATE TABLE `tbl_system_config` (
  `config_id` int(10) UNSIGNED NOT NULL,
  `travel_speed_kmh` decimal(5,2) NOT NULL DEFAULT 20.00,
  `break_minutes` int(11) NOT NULL DEFAULT 45,
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_system_config`
--

INSERT INTO `tbl_system_config` (`config_id`, `travel_speed_kmh`, `break_minutes`, `updated_at`) VALUES
(1, 15.00, 20, '2026-04-27 15:34:21');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_trip`
--

CREATE TABLE `tbl_trip` (
  `trip_id` int(10) UNSIGNED NOT NULL,
  `trip_code` varchar(50) NOT NULL,
  `trip_name` varchar(255) NOT NULL,
  `start_lat` decimal(9,6) NOT NULL,
  `start_lng` decimal(9,6) NOT NULL,
  `end_lat` decimal(9,6) NOT NULL,
  `end_lng` decimal(9,6) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `budget` decimal(10,2) NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `modified_at` datetime NOT NULL DEFAULT current_timestamp(),
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tbl_trip`
--

INSERT INTO `tbl_trip` (`trip_id`, `trip_code`, `trip_name`, `start_lat`, `start_lng`, `end_lat`, `end_lng`, `start_date`, `end_date`, `budget`, `user_id`, `created_at`, `modified_at`, `is_deleted`) VALUES
(1, 'TRIP-IG01-NORMAL', 'IG01 Normal Bagan Trip', 21.171000, 94.858500, 21.171000, 94.858500, '2026-06-01', '2026-06-01', 80000.00, 10, '2026-05-25 21:25:29', '2026-05-25 21:25:29', 0),
(2, 'TRIP-IG02-LIMITED', 'IG02 Limited Budget Bagan', 21.171000, 94.858500, 21.171000, 94.858500, '2026-06-02', '2026-06-02', 10000.00, 10, '2026-05-25 21:25:29', '2026-05-25 21:25:29', 0),
(3, 'TRIP-IG03-PREFERENCE', 'IG03 Religious Preference', 21.171000, 94.858500, 21.171000, 94.858500, '2026-06-03', '2026-06-03', 60000.00, 10, '2026-05-25 21:25:29', '2026-05-25 21:25:29', 0),
(4, 'TRIP-IG04-EXPERIENCE', 'IG04 Experience Timing', 21.171000, 94.858500, 21.171000, 94.858500, '2026-06-04', '2026-06-04', 100000.00, 10, '2026-05-25 21:25:29', '2026-05-25 21:25:29', 0),
(5, 'TRIP-IG05-MULTI-DAY', 'IG05 Multi Day Bagan', 21.171000, 94.858500, 21.171000, 94.858500, '2026-06-05', '2026-06-06', 120000.00, 10, '2026-05-25 21:25:29', '2026-05-25 21:25:29', 0),
(6, 'TRIP-IG06-RESTRICTED', 'IG06 Restricted Bagan', 21.171000, 94.858500, 21.171000, 94.858500, '2026-06-07', '2026-06-07', 1000.00, 10, '2026-05-25 21:25:29', '2026-05-25 21:25:29', 0);

-- --------------------------------------------------------

--
-- Table structure for table `tbl_trip_preference`
--

CREATE TABLE `tbl_trip_preference` (
  `trip_pref_id` int(10) UNSIGNED NOT NULL,
  `trip_pref_code` varchar(50) NOT NULL,
  `trip_id` int(10) UNSIGNED NOT NULL,
  `category_id` int(10) UNSIGNED NOT NULL,
  `preference_weight` float NOT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tbl_trip_preference`
--

INSERT INTO `tbl_trip_preference` (`trip_pref_id`, `trip_pref_code`, `trip_id`, `category_id`, `preference_weight`, `is_deleted`) VALUES
(1, 'TPREF-IG01-CULTURE', 1, 1, 0.5, 0),
(2, 'TPREF-IG01-RELIGIOUS', 1, 2, 0.7, 0),
(3, 'TPREF-IG01-NATURE', 1, 3, 0.4, 0),
(4, 'TPREF-IG01-FOOD', 1, 4, 0.3, 0),
(5, 'TPREF-IG01-SHOPPING', 1, 5, 0.1, 0),
(6, 'TPREF-IG01-HISTORY', 1, 6, 0.6, 0),
(8, 'TPREF-IG02-CULTURE', 2, 1, 0, 0),
(9, 'TPREF-IG02-RELIGIOUS', 2, 2, 0.6, 0),
(10, 'TPREF-IG02-NATURE', 2, 3, 0.8, 0),
(11, 'TPREF-IG02-FOOD', 2, 4, 0, 0),
(12, 'TPREF-IG02-SHOPPING', 2, 5, 0.5, 0),
(13, 'TPREF-IG02-HISTORY', 2, 6, 0, 0),
(15, 'TPREF-IG03-CULTURE', 3, 1, 0.3, 0),
(16, 'TPREF-IG03-RELIGIOUS', 3, 2, 1, 0),
(17, 'TPREF-IG03-NATURE', 3, 3, 0.2, 0),
(18, 'TPREF-IG03-FOOD', 3, 4, 0, 0),
(19, 'TPREF-IG03-SHOPPING', 3, 5, 0, 0),
(20, 'TPREF-IG03-HISTORY', 3, 6, 0.3, 0),
(22, 'TPREF-IG04-CULTURE', 4, 1, 0, 0),
(23, 'TPREF-IG04-RELIGIOUS', 4, 2, 0.8, 0),
(24, 'TPREF-IG04-NATURE', 4, 3, 0.9, 0),
(25, 'TPREF-IG04-FOOD', 4, 4, 0.7, 0),
(26, 'TPREF-IG04-SHOPPING', 4, 5, 0, 0),
(27, 'TPREF-IG04-HISTORY', 4, 6, 0, 0),
(29, 'TPREF-IG05-CULTURE', 5, 1, 0.7, 0),
(30, 'TPREF-IG05-RELIGIOUS', 5, 2, 0.8, 0),
(31, 'TPREF-IG05-NATURE', 5, 3, 0.7, 0),
(32, 'TPREF-IG05-FOOD', 5, 4, 0.5, 0),
(33, 'TPREF-IG05-SHOPPING', 5, 5, 0, 0),
(34, 'TPREF-IG05-HISTORY', 5, 6, 0.6, 0),
(36, 'TPREF-IG06-CULTURE', 6, 1, 0, 0),
(37, 'TPREF-IG06-RELIGIOUS', 6, 2, 1, 0),
(38, 'TPREF-IG06-NATURE', 6, 3, 0, 0),
(39, 'TPREF-IG06-FOOD', 6, 4, 0, 0),
(40, 'TPREF-IG06-SHOPPING', 6, 5, 0, 0),
(41, 'TPREF-IG06-HISTORY', 6, 6, 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `tbl_trip_settings`
--

CREATE TABLE `tbl_trip_settings` (
  `setting_id` int(10) UNSIGNED NOT NULL,
  `travel_speed_kmh` decimal(5,2) NOT NULL,
  `break_minutes` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_user`
--

CREATE TABLE `tbl_user` (
  `user_id` int(10) UNSIGNED NOT NULL,
  `user_code` varchar(50) NOT NULL,
  `user_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `user_role` enum('admin','customer') NOT NULL DEFAULT 'customer',
  `profile_image` varchar(255) DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `modified_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tbl_user`
--

INSERT INTO `tbl_user` (`user_id`, `user_code`, `user_name`, `email`, `password`, `user_role`, `profile_image`, `is_deleted`, `created_at`, `modified_at`) VALUES
(1, 'USR-0001', '21mk', '21mk@gmail.com', '$2b$10$BtRhFO87Z3J5REHVkOGC7efy7m0gFkoeOuo74z8GNw3IL5g1LNe86', 'customer', NULL, 0, '2026-03-08 18:57:33', '2026-03-08 18:57:33'),
(2, 'USR-0002', '21mk_admin', '21mk@admin.com', '$2b$10$9Xbou3hyeLhOWVYmELNFHu6q8JYHXZoTLj0kPz1vY1VzMccaiMcMa', 'admin', NULL, 0, '2026-03-08 19:25:20', '2026-03-08 19:25:20'),
(3, 'USR-0003', 'delete user', 'asdfsadf@gmail.com', '$2b$10$6coqriJnMa3S9A5YqIdb0uIzAgo7WGo/TGnrpeG0lUgiuMeVijKju', 'customer', NULL, 1, '2026-03-12 18:07:31', '2026-03-12 18:07:31'),
(4, 'USR-0004', 'ryan', 'ryan@gmail.com', '$2b$10$G7pVQcsjl7MRvUMUYXVxhOfPxlN2UVwJQNT2KVKyOvaIicwR1WiNC', 'customer', NULL, 0, '2026-03-20 14:24:06', '2026-03-20 14:24:06'),
(5, 'USR-0005', 'testing_user', 'testinguser@gmail.com', '$2b$10$i1oZp6t0lELzyminQBrj/eGdSykwGBzxn18TLOmZ5BNOcgwfLFEma', 'customer', NULL, 0, '2026-04-30 17:04:08', '2026-04-30 17:04:08'),
(6, 'USR-0006', 'testing_admin', 'testingadmin@gmail.com', '$2b$10$M6XDmOJyTv/pgFQ4U.Fsw.Wb5z0SZXvhizLZCscw301SUUemocWyS', 'admin', NULL, 0, '2026-05-20 08:36:15', '2026-05-20 08:36:15'),
(7, 'USR-0007', 'user kst', 'userkst@gmail.com', '$2b$10$yWRhrCBFPcnBFjCWwWKPkeT.Txz0IDhg9CoJmTPHfK0uFRKR7m4sO', 'customer', 'asdfadsf', 0, '2026-05-23 22:14:07', '2026-05-23 22:14:07'),
(8, 'USR-0008', 'testing1', 'testing1@gmail.com', '$2b$10$fz4FKPkkTSeu.zZf5A0O8elZ3Pc1Xlxc/PlkANxcDdONHiZ5XXuTq', 'customer', NULL, 0, '2026-05-24 06:20:41', '2026-05-24 06:20:41'),
(10, 'USR-0009', 'Itinerary QA User', 'johnstone@gmail.com', '$2b$10$LcJQYYJNbzrABW2xchx88eBIvUBhrkN5psBn.GdBca/4F.wKqN.66', 'customer', '/uploads/profile-images/1779704113616-709915638.jpg', 0, '2026-05-25 08:55:25', '2026-05-25 21:25:29');

-- --------------------------------------------------------

--
-- Table structure for table `trip_schedule`
--

CREATE TABLE `trip_schedule` (
  `schedule_id` int(10) UNSIGNED NOT NULL,
  `trip_id` int(10) UNSIGNED NOT NULL,
  `day_start_time` time NOT NULL,
  `day_end_time` time NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `trip_schedule`
--

INSERT INTO `trip_schedule` (`schedule_id`, `trip_id`, `day_start_time`, `day_end_time`, `created_at`) VALUES
(7, 1, '08:00:00', '18:00:00', '2026-05-25 21:25:29'),
(8, 2, '08:00:00', '17:00:00', '2026-05-25 21:25:29'),
(9, 3, '08:00:00', '18:00:00', '2026-05-25 21:25:29'),
(10, 4, '05:30:00', '21:30:00', '2026-05-25 21:25:29'),
(11, 5, '08:00:00', '18:00:00', '2026-05-25 21:25:29'),
(12, 6, '08:00:00', '09:00:00', '2026-05-25 21:25:29');

-- --------------------------------------------------------

--
-- Table structure for table `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('8768f605-eb31-40c0-a970-ebbdf92ee571', '7fa4c0f87caff7a914ac403a40c75884d6d8bc476d957cf50ff2989b85eaf694', '2026-02-17 17:07:23.359', '20260217170722_init', NULL, NULL, '2026-02-17 17:07:22.347', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `tbl_attraction`
--
ALTER TABLE `tbl_attraction`
  ADD PRIMARY KEY (`attraction_id`),
  ADD UNIQUE KEY `attraction_code` (`attraction_code`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `tbl_attraction_experience`
--
ALTER TABLE `tbl_attraction_experience`
  ADD PRIMARY KEY (`experience_id`),
  ADD UNIQUE KEY `experience_code` (`experience_code`),
  ADD KEY `attraction_id` (`attraction_id`);

--
-- Indexes for table `tbl_category`
--
ALTER TABLE `tbl_category`
  ADD PRIMARY KEY (`category_id`),
  ADD UNIQUE KEY `category_code` (`category_code`),
  ADD UNIQUE KEY `category_name` (`category_name`);

--
-- Indexes for table `tbl_itinerary`
--
ALTER TABLE `tbl_itinerary`
  ADD PRIMARY KEY (`itinerary_id`),
  ADD UNIQUE KEY `itinerary_code` (`itinerary_code`),
  ADD KEY `trip_id` (`trip_id`);

--
-- Indexes for table `tbl_itinerary_item`
--
ALTER TABLE `tbl_itinerary_item`
  ADD PRIMARY KEY (`item_id`),
  ADD UNIQUE KEY `item_code` (`item_code`),
  ADD KEY `attraction_id` (`attraction_id`),
  ADD KEY `itinerary_id` (`itinerary_id`);

--
-- Indexes for table `tbl_system_config`
--
ALTER TABLE `tbl_system_config`
  ADD PRIMARY KEY (`config_id`);

--
-- Indexes for table `tbl_trip`
--
ALTER TABLE `tbl_trip`
  ADD PRIMARY KEY (`trip_id`),
  ADD UNIQUE KEY `trip_code` (`trip_code`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `tbl_trip_preference`
--
ALTER TABLE `tbl_trip_preference`
  ADD PRIMARY KEY (`trip_pref_id`),
  ADD UNIQUE KEY `trip_pref_code` (`trip_pref_code`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `trip_id` (`trip_id`);

--
-- Indexes for table `tbl_trip_settings`
--
ALTER TABLE `tbl_trip_settings`
  ADD PRIMARY KEY (`setting_id`);

--
-- Indexes for table `tbl_user`
--
ALTER TABLE `tbl_user`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `user_code` (`user_code`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `trip_schedule`
--
ALTER TABLE `trip_schedule`
  ADD PRIMARY KEY (`schedule_id`),
  ADD KEY `fk_trip_idx` (`trip_id`);

--
-- Indexes for table `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `tbl_attraction`
--
ALTER TABLE `tbl_attraction`
  MODIFY `attraction_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `tbl_attraction_experience`
--
ALTER TABLE `tbl_attraction_experience`
  MODIFY `experience_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `tbl_category`
--
ALTER TABLE `tbl_category`
  MODIFY `category_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `tbl_itinerary`
--
ALTER TABLE `tbl_itinerary`
  MODIFY `itinerary_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tbl_itinerary_item`
--
ALTER TABLE `tbl_itinerary_item`
  MODIFY `item_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `tbl_system_config`
--
ALTER TABLE `tbl_system_config`
  MODIFY `config_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tbl_trip`
--
ALTER TABLE `tbl_trip`
  MODIFY `trip_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `tbl_trip_preference`
--
ALTER TABLE `tbl_trip_preference`
  MODIFY `trip_pref_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT for table `tbl_trip_settings`
--
ALTER TABLE `tbl_trip_settings`
  MODIFY `setting_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_user`
--
ALTER TABLE `tbl_user`
  MODIFY `user_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `trip_schedule`
--
ALTER TABLE `trip_schedule`
  MODIFY `schedule_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `tbl_attraction`
--
ALTER TABLE `tbl_attraction`
  ADD CONSTRAINT `tbl_attraction_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `tbl_category` (`category_id`);

--
-- Constraints for table `tbl_attraction_experience`
--
ALTER TABLE `tbl_attraction_experience`
  ADD CONSTRAINT `tbl_attraction_experience_ibfk_1` FOREIGN KEY (`attraction_id`) REFERENCES `tbl_attraction` (`attraction_id`);

--
-- Constraints for table `tbl_itinerary`
--
ALTER TABLE `tbl_itinerary`
  ADD CONSTRAINT `tbl_itinerary_ibfk_1` FOREIGN KEY (`trip_id`) REFERENCES `tbl_trip` (`trip_id`);

--
-- Constraints for table `tbl_itinerary_item`
--
ALTER TABLE `tbl_itinerary_item`
  ADD CONSTRAINT `tbl_itinerary_item_ibfk_1` FOREIGN KEY (`itinerary_id`) REFERENCES `tbl_itinerary` (`itinerary_id`),
  ADD CONSTRAINT `tbl_itinerary_item_ibfk_2` FOREIGN KEY (`attraction_id`) REFERENCES `tbl_attraction` (`attraction_id`);

--
-- Constraints for table `tbl_trip`
--
ALTER TABLE `tbl_trip`
  ADD CONSTRAINT `tbl_trip_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `tbl_user` (`user_id`);

--
-- Constraints for table `tbl_trip_preference`
--
ALTER TABLE `tbl_trip_preference`
  ADD CONSTRAINT `tbl_trip_preference_ibfk_1` FOREIGN KEY (`trip_id`) REFERENCES `tbl_trip` (`trip_id`),
  ADD CONSTRAINT `tbl_trip_preference_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `tbl_category` (`category_id`);

--
-- Constraints for table `trip_schedule`
--
ALTER TABLE `trip_schedule`
  ADD CONSTRAINT `fk_trip` FOREIGN KEY (`trip_id`) REFERENCES `tbl_trip` (`trip_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
