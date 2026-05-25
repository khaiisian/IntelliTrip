-- Itinerary generation seed data for intelliTrip.
-- Run this in the intelliTrip MySQL database before itinerary generation testing.
-- The attraction records are marked with is_test = true so they can be filtered later.
-- Trip records use user_id = 10.

START TRANSACTION;

INSERT INTO tbl_user
    (user_id, user_code, user_name, email, password, user_role, is_deleted)
VALUES
    (10, 'USR-IG-0010', 'Itinerary QA User', 'itinerary.qa.user@example.com', '$2b$10$itineraryseedplaceholder', 'customer', false)
ON DUPLICATE KEY UPDATE
    user_name = VALUES(user_name),
    email = VALUES(email),
    user_role = VALUES(user_role),
    is_deleted = false,
    modified_at = CURRENT_TIMESTAMP;

INSERT INTO tbl_system_config
    (travel_speed_kmh, break_minutes)
SELECT
    20.00,
    45
WHERE NOT EXISTS (
    SELECT 1 FROM tbl_system_config
);

UPDATE tbl_attraction
SET is_deleted = true
WHERE attraction_code LIKE 'ATTR-TEST-%';

INSERT INTO tbl_category
    (category_code, category_name, is_deleted)
VALUES
    ('CAT-BAGAN-CULTURE', 'Bagan Culture', false),
    ('CAT-BAGAN-RELIGIOUS', 'Bagan Religious', false),
    ('CAT-BAGAN-NATURE', 'Bagan Nature', false),
    ('CAT-BAGAN-FOOD', 'Bagan Food', false),
    ('CAT-BAGAN-SHOPPING', 'Bagan Shopping', false),
    ('CAT-BAGAN-HISTORY', 'Bagan History', false)
ON DUPLICATE KEY UPDATE
    category_name = VALUES(category_name),
    is_deleted = false,
    modified_at = CURRENT_TIMESTAMP;

INSERT INTO tbl_attraction
    (attraction_code, attraction_name, latitude, longitude, cost, duration_minutes, open_time, close_time, category_id, is_deleted, is_test)
VALUES
    (
        'ATTR-BAGAN-ANANDA',
        'Ananda Temple',
        21.17060000,
        94.86700000,
        5000.00,
        75,
        '06:00:00',
        '18:30:00',
        (SELECT category_id FROM tbl_category WHERE category_code = 'CAT-BAGAN-RELIGIOUS'),
        false,
        true
    ),
    (
        'ATTR-BAGAN-SHWEZIGON',
        'Shwezigon Pagoda',
        21.19510000,
        94.89310000,
        5000.00,
        75,
        '05:30:00',
        '20:00:00',
        (SELECT category_id FROM tbl_category WHERE category_code = 'CAT-BAGAN-RELIGIOUS'),
        false,
        true
    ),
    (
        'ATTR-BAGAN-DHAMMAYANGYI',
        'Dhammayangyi Temple',
        21.16220000,
        94.87170000,
        5000.00,
        90,
        '06:00:00',
        '18:30:00',
        (SELECT category_id FROM tbl_category WHERE category_code = 'CAT-BAGAN-RELIGIOUS'),
        false,
        true
    ),
    (
        'ATTR-BAGAN-THATBYINNYU',
        'Thatbyinnyu Temple',
        21.16850000,
        94.86100000,
        5000.00,
        60,
        '06:00:00',
        '18:30:00',
        (SELECT category_id FROM tbl_category WHERE category_code = 'CAT-BAGAN-RELIGIOUS'),
        false,
        true
    ),
    (
        'ATTR-BAGAN-SULAMANI',
        'Sulamani Temple',
        21.16460000,
        94.88250000,
        5000.00,
        75,
        '06:00:00',
        '18:30:00',
        (SELECT category_id FROM tbl_category WHERE category_code = 'CAT-BAGAN-RELIGIOUS'),
        false,
        true
    ),
    (
        'ATTR-BAGAN-MUSEUM',
        'Bagan Archaeological Museum',
        21.17210000,
        94.85890000,
        7000.00,
        120,
        '09:00:00',
        '16:30:00',
        (SELECT category_id FROM tbl_category WHERE category_code = 'CAT-BAGAN-HISTORY'),
        false,
        true
    ),
    (
        'ATTR-BAGAN-LACQUERWARE',
        'Lacquerware Workshop',
        21.17180000,
        94.85660000,
        8000.00,
        90,
        '09:00:00',
        '17:00:00',
        (SELECT category_id FROM tbl_category WHERE category_code = 'CAT-BAGAN-CULTURE'),
        false,
        true
    ),
    (
        'ATTR-BAGAN-VILLAGE',
        'Minnathu Village Visit',
        21.17590000,
        94.89550000,
        6000.00,
        120,
        '08:00:00',
        '17:00:00',
        (SELECT category_id FROM tbl_category WHERE category_code = 'CAT-BAGAN-CULTURE'),
        false,
        true
    ),
    (
        'ATTR-BAGAN-VIEWING-TOWER',
        'Bagan Viewing Tower',
        21.18880000,
        94.90200000,
        15000.00,
        60,
        '05:30:00',
        '20:00:00',
        (SELECT category_id FROM tbl_category WHERE category_code = 'CAT-BAGAN-NATURE'),
        false,
        true
    ),
    (
        'ATTR-BAGAN-IRRAWADDY',
        'Irrawaddy River Viewpoint',
        21.17640000,
        94.84920000,
        3000.00,
        60,
        '06:00:00',
        '19:00:00',
        (SELECT category_id FROM tbl_category WHERE category_code = 'CAT-BAGAN-NATURE'),
        false,
        true
    ),
    (
        'ATTR-BAGAN-MOUNT-POPA',
        'Mount Popa Day Viewpoint',
        20.92080000,
        95.25390000,
        20000.00,
        180,
        '08:00:00',
        '17:00:00',
        (SELECT category_id FROM tbl_category WHERE category_code = 'CAT-BAGAN-NATURE'),
        false,
        true
    ),
    (
        'ATTR-BAGAN-MANI-SITHU',
        'Mani Sithu Market',
        21.19630000,
        94.89700000,
        3000.00,
        75,
        '07:00:00',
        '12:00:00',
        (SELECT category_id FROM tbl_category WHERE category_code = 'CAT-BAGAN-SHOPPING'),
        false,
        true
    ),
    (
        'ATTR-BAGAN-FOOD-STREET',
        'Nyaung U Food Street',
        21.19580000,
        94.89630000,
        12000.00,
        90,
        '17:00:00',
        '22:00:00',
        (SELECT category_id FROM tbl_category WHERE category_code = 'CAT-BAGAN-FOOD'),
        false,
        true
    ),
    (
        'ATTR-BAGAN-DINNER-SHOW',
        'Bagan Cultural Dinner Show',
        21.15680000,
        94.86190000,
        45000.00,
        150,
        '18:00:00',
        '22:00:00',
        (SELECT category_id FROM tbl_category WHERE category_code = 'CAT-BAGAN-FOOD'),
        false,
        true
    ),
    (
        'ATTR-BAGAN-HTILOMINLO',
        'Htilominlo Temple',
        21.18190000,
        94.87650000,
        5000.00,
        75,
        '06:00:00',
        '18:30:00',
        (SELECT category_id FROM tbl_category WHERE category_code = 'CAT-BAGAN-RELIGIOUS'),
        false,
        true
    ),
    (
        'ATTR-BAGAN-BUPAYA',
        'Bupaya Pagoda',
        21.17490000,
        94.85080000,
        3000.00,
        45,
        '06:00:00',
        '19:00:00',
        (SELECT category_id FROM tbl_category WHERE category_code = 'CAT-BAGAN-RELIGIOUS'),
        false,
        true
    ),
    (
        'ATTR-BAGAN-LAWKANANDA',
        'Lawkananda Pagoda',
        21.13380000,
        94.85880000,
        3000.00,
        60,
        '06:00:00',
        '19:30:00',
        (SELECT category_id FROM tbl_category WHERE category_code = 'CAT-BAGAN-RELIGIOUS'),
        false,
        true
    ),
    (
        'ATTR-BAGAN-GUBYAUKGYI',
        'Gubyaukgyi Temple',
        21.16630000,
        94.85680000,
        5000.00,
        75,
        '06:00:00',
        '18:00:00',
        (SELECT category_id FROM tbl_category WHERE category_code = 'CAT-BAGAN-HISTORY'),
        false,
        true
    ),
    (
        'ATTR-BAGAN-THARABAR-GATE',
        'Tharabar Gate',
        21.17180000,
        94.86540000,
        2000.00,
        45,
        '06:00:00',
        '18:30:00',
        (SELECT category_id FROM tbl_category WHERE category_code = 'CAT-BAGAN-HISTORY'),
        false,
        true
    ),
    (
        'ATTR-BAGAN-PALACE-SITE',
        'Bagan Palace Site',
        21.17340000,
        94.86040000,
        5000.00,
        90,
        '09:00:00',
        '17:00:00',
        (SELECT category_id FROM tbl_category WHERE category_code = 'CAT-BAGAN-HISTORY'),
        false,
        true
    ),
    (
        'ATTR-BAGAN-HORSE-CART',
        'Horse Cart Heritage Route',
        21.16690000,
        94.87280000,
        15000.00,
        120,
        '08:00:00',
        '17:30:00',
        (SELECT category_id FROM tbl_category WHERE category_code = 'CAT-BAGAN-CULTURE'),
        false,
        true
    ),
    (
        'ATTR-BAGAN-SUNSET-HILL',
        'Sunset Hill Viewpoint',
        21.15890000,
        94.87530000,
        3000.00,
        60,
        '06:00:00',
        '19:00:00',
        (SELECT category_id FROM tbl_category WHERE category_code = 'CAT-BAGAN-NATURE'),
        false,
        true
    )
ON DUPLICATE KEY UPDATE
    attraction_name = VALUES(attraction_name),
    latitude = VALUES(latitude),
    longitude = VALUES(longitude),
    cost = VALUES(cost),
    duration_minutes = VALUES(duration_minutes),
    open_time = VALUES(open_time),
    close_time = VALUES(close_time),
    category_id = VALUES(category_id),
    is_deleted = false,
    is_test = true,
    modified_at = CURRENT_TIMESTAMP;

INSERT INTO tbl_attraction_experience
    (experience_code, attraction_id, experience_type, best_time_start, best_time_end, experience_score_weight, time_bonus_multiplier, description, is_deleted)
VALUES
    (
        'EXP-BAGAN-ANANDA-MORNING',
        (SELECT attraction_id FROM tbl_attraction WHERE attraction_code = 'ATTR-BAGAN-ANANDA'),
        'Quiet morning temple visit',
        '07:00:00',
        '09:30:00',
        0.85,
        1.15,
        'Supports experience-aware timing for early temple visits.',
        false
    ),
    (
        'EXP-BAGAN-SHWEZIGON-SUNSET',
        (SELECT attraction_id FROM tbl_attraction WHERE attraction_code = 'ATTR-BAGAN-SHWEZIGON'),
        'Golden hour pagoda visit',
        '16:30:00',
        '18:30:00',
        1.00,
        1.30,
        'High-value sunset window for religious itinerary timing.',
        false
    ),
    (
        'EXP-BAGAN-DHAMMAYANGYI-MORNING',
        (SELECT attraction_id FROM tbl_attraction WHERE attraction_code = 'ATTR-BAGAN-DHAMMAYANGYI'),
        'Morning temple photography',
        '08:00:00',
        '10:30:00',
        0.80,
        1.15,
        'Supports morning religious and history timing.',
        false
    ),
    (
        'EXP-BAGAN-THATBYINNYU-AFTERNOON',
        (SELECT attraction_id FROM tbl_attraction WHERE attraction_code = 'ATTR-BAGAN-THATBYINNYU'),
        'Afternoon temple visit',
        '14:00:00',
        '16:30:00',
        0.75,
        1.10,
        'Supports afternoon route ordering among central temples.',
        false
    ),
    (
        'EXP-BAGAN-SULAMANI-SUNSET',
        (SELECT attraction_id FROM tbl_attraction WHERE attraction_code = 'ATTR-BAGAN-SULAMANI'),
        'Late afternoon mural visit',
        '15:30:00',
        '17:30:00',
        0.90,
        1.20,
        'Supports late-day religious attraction scheduling.',
        false
    ),
    (
        'EXP-BAGAN-MUSEUM-MIDDAY',
        (SELECT attraction_id FROM tbl_attraction WHERE attraction_code = 'ATTR-BAGAN-MUSEUM'),
        'Indoor history visit',
        '10:00:00',
        '14:00:00',
        0.85,
        1.15,
        'Useful for checking museum closing-time constraints.',
        false
    ),
    (
        'EXP-BAGAN-LACQUERWARE-AFTERNOON',
        (SELECT attraction_id FROM tbl_attraction WHERE attraction_code = 'ATTR-BAGAN-LACQUERWARE'),
        'Afternoon craft demonstration',
        '13:00:00',
        '16:00:00',
        0.90,
        1.20,
        'Supports culture preference and workshop timing.',
        false
    ),
    (
        'EXP-BAGAN-VILLAGE-MORNING',
        (SELECT attraction_id FROM tbl_attraction WHERE attraction_code = 'ATTR-BAGAN-VILLAGE'),
        'Morning village walk',
        '08:30:00',
        '11:30:00',
        0.80,
        1.15,
        'Supports culture preference and morning scheduling.',
        false
    ),
    (
        'EXP-BAGAN-TOWER-SUNRISE',
        (SELECT attraction_id FROM tbl_attraction WHERE attraction_code = 'ATTR-BAGAN-VIEWING-TOWER'),
        'Sunrise panorama',
        '05:30:00',
        '07:00:00',
        1.00,
        1.35,
        'High-value sunrise window for experience-aware timing.',
        false
    ),
    (
        'EXP-BAGAN-IRRAWADDY-SUNSET',
        (SELECT attraction_id FROM tbl_attraction WHERE attraction_code = 'ATTR-BAGAN-IRRAWADDY'),
        'River sunset view',
        '16:30:00',
        '18:30:00',
        0.95,
        1.25,
        'Supports sunset and nature preference scheduling.',
        false
    ),
    (
        'EXP-BAGAN-POPA-DAY',
        (SELECT attraction_id FROM tbl_attraction WHERE attraction_code = 'ATTR-BAGAN-MOUNT-POPA'),
        'Day viewpoint visit',
        '09:00:00',
        '13:00:00',
        0.90,
        1.15,
        'Far attraction for travel feasibility checks.',
        false
    ),
    (
        'EXP-BAGAN-MARKET-MORNING',
        (SELECT attraction_id FROM tbl_attraction WHERE attraction_code = 'ATTR-BAGAN-MANI-SITHU'),
        'Morning local market',
        '07:30:00',
        '10:30:00',
        0.80,
        1.15,
        'Supports shopping preference and early closing validation.',
        false
    ),
    (
        'EXP-BAGAN-FOOD-STREET-DINNER',
        (SELECT attraction_id FROM tbl_attraction WHERE attraction_code = 'ATTR-BAGAN-FOOD-STREET'),
        'Evening food walk',
        '18:00:00',
        '21:00:00',
        0.95,
        1.25,
        'Supports late opening hour and food preference checks.',
        false
    ),
    (
        'EXP-BAGAN-DINNER-SHOW-EVENING',
        (SELECT attraction_id FROM tbl_attraction WHERE attraction_code = 'ATTR-BAGAN-DINNER-SHOW'),
        'Evening cultural dinner',
        '18:30:00',
        '21:30:00',
        1.00,
        1.30,
        'High-cost evening attraction for budget and experience checks.',
        false
    ),
    (
        'EXP-BAGAN-HTILOMINLO-AFTERNOON',
        (SELECT attraction_id FROM tbl_attraction WHERE attraction_code = 'ATTR-BAGAN-HTILOMINLO'),
        'Afternoon temple visit',
        '14:30:00',
        '17:00:00',
        0.85,
        1.15,
        'Supports religious preference and afternoon route ordering.',
        false
    ),
    (
        'EXP-BAGAN-BUPAYA-SUNSET',
        (SELECT attraction_id FROM tbl_attraction WHERE attraction_code = 'ATTR-BAGAN-BUPAYA'),
        'Riverside sunset pagoda visit',
        '16:30:00',
        '18:30:00',
        0.90,
        1.25,
        'Supports sunset timing near the river.',
        false
    ),
    (
        'EXP-BAGAN-LAWKANANDA-MORNING',
        (SELECT attraction_id FROM tbl_attraction WHERE attraction_code = 'ATTR-BAGAN-LAWKANANDA'),
        'Morning riverside pagoda visit',
        '07:00:00',
        '09:30:00',
        0.80,
        1.15,
        'Supports early religious visit scheduling.',
        false
    ),
    (
        'EXP-BAGAN-GUBYAUKGYI-MIDDAY',
        (SELECT attraction_id FROM tbl_attraction WHERE attraction_code = 'ATTR-BAGAN-GUBYAUKGYI'),
        'Mural history visit',
        '10:00:00',
        '13:00:00',
        0.85,
        1.15,
        'Supports history preference and indoor midday timing.',
        false
    ),
    (
        'EXP-BAGAN-THARABAR-GATE-MORNING',
        (SELECT attraction_id FROM tbl_attraction WHERE attraction_code = 'ATTR-BAGAN-THARABAR-GATE'),
        'Morning heritage gate walk',
        '08:00:00',
        '10:00:00',
        0.70,
        1.10,
        'Short low-cost history item for limited budget testing.',
        false
    ),
    (
        'EXP-BAGAN-PALACE-MIDDAY',
        (SELECT attraction_id FROM tbl_attraction WHERE attraction_code = 'ATTR-BAGAN-PALACE-SITE'),
        'Midday palace site visit',
        '10:00:00',
        '14:00:00',
        0.80,
        1.10,
        'Supports history preference and closing-time validation.',
        false
    ),
    (
        'EXP-BAGAN-HORSE-CART-AFTERNOON',
        (SELECT attraction_id FROM tbl_attraction WHERE attraction_code = 'ATTR-BAGAN-HORSE-CART'),
        'Afternoon heritage ride',
        '14:00:00',
        '17:00:00',
        0.90,
        1.20,
        'Long culture item for duration and budget testing.',
        false
    ),
    (
        'EXP-BAGAN-SUNSET-HILL-SUNSET',
        (SELECT attraction_id FROM tbl_attraction WHERE attraction_code = 'ATTR-BAGAN-SUNSET-HILL'),
        'Sunset viewpoint',
        '16:30:00',
        '18:30:00',
        1.00,
        1.30,
        'High-value sunset window for experience-aware scheduling.',
        false
    )
ON DUPLICATE KEY UPDATE
    attraction_id = VALUES(attraction_id),
    experience_type = VALUES(experience_type),
    best_time_start = VALUES(best_time_start),
    best_time_end = VALUES(best_time_end),
    experience_score_weight = VALUES(experience_score_weight),
    time_bonus_multiplier = VALUES(time_bonus_multiplier),
    description = VALUES(description),
    is_deleted = false;

INSERT INTO tbl_trip
    (trip_code, trip_name, start_lat, start_lng, end_lat, end_lng, start_date, end_date, budget, user_id, is_deleted)
VALUES
    ('TRIP-IG01-NORMAL', 'IG01 Normal Bagan Trip', 21.171000, 94.858500, 21.171000, 94.858500, '2026-06-01', '2026-06-01', 80000.00, 10, false),
    ('TRIP-IG02-LIMITED-BUDGET', 'IG02 Limited Budget Bagan Trip', 21.171000, 94.858500, 21.171000, 94.858500, '2026-06-02', '2026-06-02', 10000.00, 10, false),
    ('TRIP-IG03-PREFERENCE', 'IG03 Religious Preference Bagan Trip', 21.171000, 94.858500, 21.171000, 94.858500, '2026-06-03', '2026-06-03', 60000.00, 10, false),
    ('TRIP-IG04-EXPERIENCE', 'IG04 Experience Timing Bagan Trip', 21.171000, 94.858500, 21.171000, 94.858500, '2026-06-04', '2026-06-04', 100000.00, 10, false),
    ('TRIP-IG05-MULTI-DAY', 'IG05 Multi Day Bagan Trip', 21.171000, 94.858500, 21.171000, 94.858500, '2026-06-05', '2026-06-06', 120000.00, 10, false),
    ('TRIP-IG06-RESTRICTED', 'IG06 Restricted Bagan Trip', 21.171000, 94.858500, 21.171000, 94.858500, '2026-06-07', '2026-06-07', 1000.00, 10, false)
ON DUPLICATE KEY UPDATE
    trip_name = VALUES(trip_name),
    start_lat = VALUES(start_lat),
    start_lng = VALUES(start_lng),
    end_lat = VALUES(end_lat),
    end_lng = VALUES(end_lng),
    start_date = VALUES(start_date),
    end_date = VALUES(end_date),
    budget = VALUES(budget),
    user_id = VALUES(user_id),
    is_deleted = false,
    modified_at = CURRENT_TIMESTAMP;

DELETE FROM trip_schedule
WHERE trip_id IN (
    SELECT trip_id
    FROM tbl_trip
    WHERE trip_code IN (
        'TRIP-IG01-NORMAL',
        'TRIP-IG02-LIMITED-BUDGET',
        'TRIP-IG03-PREFERENCE',
        'TRIP-IG04-EXPERIENCE',
        'TRIP-IG05-MULTI-DAY',
        'TRIP-IG06-RESTRICTED'
    )
);

INSERT INTO trip_schedule
    (trip_id, day_start_time, day_end_time)
VALUES
    ((SELECT trip_id FROM tbl_trip WHERE trip_code = 'TRIP-IG01-NORMAL'), '08:00:00', '18:00:00'),
    ((SELECT trip_id FROM tbl_trip WHERE trip_code = 'TRIP-IG02-LIMITED-BUDGET'), '08:00:00', '17:00:00'),
    ((SELECT trip_id FROM tbl_trip WHERE trip_code = 'TRIP-IG03-PREFERENCE'), '08:00:00', '18:00:00'),
    ((SELECT trip_id FROM tbl_trip WHERE trip_code = 'TRIP-IG04-EXPERIENCE'), '05:30:00', '21:30:00'),
    ((SELECT trip_id FROM tbl_trip WHERE trip_code = 'TRIP-IG05-MULTI-DAY'), '08:00:00', '18:00:00'),
    ((SELECT trip_id FROM tbl_trip WHERE trip_code = 'TRIP-IG06-RESTRICTED'), '08:00:00', '09:00:00');

INSERT INTO tbl_trip_preference
    (trip_pref_code, trip_id, category_id, preference_weight, is_deleted)
VALUES
    ('TPREF-IG01-RELIGIOUS', (SELECT trip_id FROM tbl_trip WHERE trip_code = 'TRIP-IG01-NORMAL'), (SELECT category_id FROM tbl_category WHERE category_code = 'CAT-BAGAN-RELIGIOUS'), 0.70, false),
    ('TPREF-IG01-HISTORY', (SELECT trip_id FROM tbl_trip WHERE trip_code = 'TRIP-IG01-NORMAL'), (SELECT category_id FROM tbl_category WHERE category_code = 'CAT-BAGAN-HISTORY'), 0.60, false),
    ('TPREF-IG01-CULTURE', (SELECT trip_id FROM tbl_trip WHERE trip_code = 'TRIP-IG01-NORMAL'), (SELECT category_id FROM tbl_category WHERE category_code = 'CAT-BAGAN-CULTURE'), 0.50, false),
    ('TPREF-IG02-NATURE', (SELECT trip_id FROM tbl_trip WHERE trip_code = 'TRIP-IG02-LIMITED-BUDGET'), (SELECT category_id FROM tbl_category WHERE category_code = 'CAT-BAGAN-NATURE'), 0.80, false),
    ('TPREF-IG02-RELIGIOUS', (SELECT trip_id FROM tbl_trip WHERE trip_code = 'TRIP-IG02-LIMITED-BUDGET'), (SELECT category_id FROM tbl_category WHERE category_code = 'CAT-BAGAN-RELIGIOUS'), 0.60, false),
    ('TPREF-IG03-RELIGIOUS', (SELECT trip_id FROM tbl_trip WHERE trip_code = 'TRIP-IG03-PREFERENCE'), (SELECT category_id FROM tbl_category WHERE category_code = 'CAT-BAGAN-RELIGIOUS'), 1.00, false),
    ('TPREF-IG03-HISTORY', (SELECT trip_id FROM tbl_trip WHERE trip_code = 'TRIP-IG03-PREFERENCE'), (SELECT category_id FROM tbl_category WHERE category_code = 'CAT-BAGAN-HISTORY'), 0.30, false),
    ('TPREF-IG04-NATURE', (SELECT trip_id FROM tbl_trip WHERE trip_code = 'TRIP-IG04-EXPERIENCE'), (SELECT category_id FROM tbl_category WHERE category_code = 'CAT-BAGAN-NATURE'), 0.90, false),
    ('TPREF-IG04-RELIGIOUS', (SELECT trip_id FROM tbl_trip WHERE trip_code = 'TRIP-IG04-EXPERIENCE'), (SELECT category_id FROM tbl_category WHERE category_code = 'CAT-BAGAN-RELIGIOUS'), 0.80, false),
    ('TPREF-IG04-FOOD', (SELECT trip_id FROM tbl_trip WHERE trip_code = 'TRIP-IG04-EXPERIENCE'), (SELECT category_id FROM tbl_category WHERE category_code = 'CAT-BAGAN-FOOD'), 0.70, false),
    ('TPREF-IG05-RELIGIOUS', (SELECT trip_id FROM tbl_trip WHERE trip_code = 'TRIP-IG05-MULTI-DAY'), (SELECT category_id FROM tbl_category WHERE category_code = 'CAT-BAGAN-RELIGIOUS'), 0.80, false),
    ('TPREF-IG05-CULTURE', (SELECT trip_id FROM tbl_trip WHERE trip_code = 'TRIP-IG05-MULTI-DAY'), (SELECT category_id FROM tbl_category WHERE category_code = 'CAT-BAGAN-CULTURE'), 0.70, false),
    ('TPREF-IG05-NATURE', (SELECT trip_id FROM tbl_trip WHERE trip_code = 'TRIP-IG05-MULTI-DAY'), (SELECT category_id FROM tbl_category WHERE category_code = 'CAT-BAGAN-NATURE'), 0.70, false),
    ('TPREF-IG05-FOOD', (SELECT trip_id FROM tbl_trip WHERE trip_code = 'TRIP-IG05-MULTI-DAY'), (SELECT category_id FROM tbl_category WHERE category_code = 'CAT-BAGAN-FOOD'), 0.50, false),
    ('TPREF-IG06-RELIGIOUS', (SELECT trip_id FROM tbl_trip WHERE trip_code = 'TRIP-IG06-RESTRICTED'), (SELECT category_id FROM tbl_category WHERE category_code = 'CAT-BAGAN-RELIGIOUS'), 1.00, false)
ON DUPLICATE KEY UPDATE
    trip_id = VALUES(trip_id),
    category_id = VALUES(category_id),
    preference_weight = VALUES(preference_weight),
    is_deleted = false;

COMMIT;
