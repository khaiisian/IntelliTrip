-- CreateTable
CREATE TABLE `tbl_attraction` (
    `attraction_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `attraction_code` VARCHAR(50) NOT NULL,
    `attraction_name` VARCHAR(255) NOT NULL,
    `latitude` DECIMAL(9, 6) NOT NULL,
    `longitude` DECIMAL(9, 6) NOT NULL,
    `cost` DECIMAL(10, 2) NOT NULL,
    `duration_minutes` INTEGER NOT NULL,
    `open_time` TIME(0) NOT NULL,
    `close_time` TIME(0) NOT NULL,
    `category_id` INTEGER UNSIGNED NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `modified_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `attraction_code`(`attraction_code`),
    INDEX `category_id`(`category_id`),
    PRIMARY KEY (`attraction_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_attraction_experience` (
    `experience_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `experience_code` VARCHAR(50) NOT NULL,
    `attraction_id` INTEGER UNSIGNED NOT NULL,
    `experience_type` VARCHAR(100) NOT NULL,
    `best_time_start` TIME(0) NOT NULL,
    `best_time_end` TIME(0) NOT NULL,
    `experience_score_weight` FLOAT NOT NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `experience_code`(`experience_code`),
    INDEX `attraction_id`(`attraction_id`),
    PRIMARY KEY (`experience_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_category` (
    `category_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `category_code` VARCHAR(50) NOT NULL,
    `category_name` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `modified_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `category_code`(`category_code`),
    UNIQUE INDEX `category_name`(`category_name`),
    PRIMARY KEY (`category_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_itinerary` (
    `itinerary_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `itinerary_code` VARCHAR(50) NOT NULL,
    `trip_id` INTEGER UNSIGNED NOT NULL,
    `generated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `total_cost` DECIMAL(10, 2) NOT NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `itinerary_code`(`itinerary_code`),
    INDEX `trip_id`(`trip_id`),
    PRIMARY KEY (`itinerary_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_itinerary_item` (
    `item_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `item_code` VARCHAR(50) NOT NULL,
    `itinerary_id` INTEGER UNSIGNED NOT NULL,
    `day_number` INTEGER NOT NULL,
    `visit_start_time` TIME(0) NOT NULL,
    `visit_end_time` TIME(0) NOT NULL,
    `attraction_id` INTEGER UNSIGNED NOT NULL,
    `distance_from_previous` DECIMAL(8, 2) NOT NULL,
    `final_score` FLOAT NOT NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `item_code`(`item_code`),
    INDEX `attraction_id`(`attraction_id`),
    INDEX `itinerary_id`(`itinerary_id`),
    PRIMARY KEY (`item_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_trip` (
    `trip_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `trip_code` VARCHAR(50) NOT NULL,
    `trip_name` VARCHAR(255) NOT NULL,
    `start_lat` DECIMAL(9, 6) NOT NULL,
    `start_lng` DECIMAL(9, 6) NOT NULL,
    `end_lat` DECIMAL(9, 6) NOT NULL,
    `end_lng` DECIMAL(9, 6) NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `budget` DECIMAL(10, 2) NOT NULL,
    `user_id` INTEGER UNSIGNED NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `modified_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `trip_code`(`trip_code`),
    INDEX `user_id`(`user_id`),
    PRIMARY KEY (`trip_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_trip_preference` (
    `trip_pref_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `trip_pref_code` VARCHAR(50) NOT NULL,
    `trip_id` INTEGER UNSIGNED NOT NULL,
    `category_id` INTEGER UNSIGNED NOT NULL,
    `preference_weight` FLOAT NOT NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `trip_pref_code`(`trip_pref_code`),
    INDEX `category_id`(`category_id`),
    INDEX `trip_id`(`trip_id`),
    PRIMARY KEY (`trip_pref_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_user` (
    `user_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_code` VARCHAR(50) NOT NULL,
    `user_name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `profile_image` VARCHAR(255) NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `modified_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `user_code`(`user_code`),
    UNIQUE INDEX `email`(`email`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tbl_attraction` ADD CONSTRAINT `tbl_attraction_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `tbl_category`(`category_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tbl_attraction_experience` ADD CONSTRAINT `tbl_attraction_experience_ibfk_1` FOREIGN KEY (`attraction_id`) REFERENCES `tbl_attraction`(`attraction_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tbl_itinerary` ADD CONSTRAINT `tbl_itinerary_ibfk_1` FOREIGN KEY (`trip_id`) REFERENCES `tbl_trip`(`trip_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tbl_itinerary_item` ADD CONSTRAINT `tbl_itinerary_item_ibfk_1` FOREIGN KEY (`itinerary_id`) REFERENCES `tbl_itinerary`(`itinerary_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tbl_itinerary_item` ADD CONSTRAINT `tbl_itinerary_item_ibfk_2` FOREIGN KEY (`attraction_id`) REFERENCES `tbl_attraction`(`attraction_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tbl_trip` ADD CONSTRAINT `tbl_trip_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `tbl_user`(`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tbl_trip_preference` ADD CONSTRAINT `tbl_trip_preference_ibfk_1` FOREIGN KEY (`trip_id`) REFERENCES `tbl_trip`(`trip_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tbl_trip_preference` ADD CONSTRAINT `tbl_trip_preference_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `tbl_category`(`category_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
