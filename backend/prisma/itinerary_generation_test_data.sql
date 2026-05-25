-- Itinerary generation test master data for intelliTrip.
-- Run this in the intelliTrip MySQL database before itinerary generation testing.
-- The attraction records are marked with is_test = true so they can be filtered later.

START TRANSACTION;

INSERT INTO tbl_category
    (category_code, category_name, is_deleted)
VALUES
    ('CAT-TEST-CULTURE', 'Test Culture', false),
    ('CAT-TEST-RELIGIOUS', 'Test Religious', false),
    ('CAT-TEST-NATURE', 'Test Nature', false),
    ('CAT-TEST-FOOD', 'Test Food', false),
    ('CAT-TEST-SHOPPING', 'Test Shopping', false),
    ('CAT-TEST-HISTORY', 'Test History', false)
ON DUPLICATE KEY UPDATE
    category_name = VALUES(category_name),
    is_deleted = false,
    modified_at = CURRENT_TIMESTAMP;

INSERT INTO tbl_attraction
    (attraction_code, attraction_name, latitude, longitude, cost, duration_minutes, open_time, close_time, category_id, is_deleted, is_test)
VALUES
    (
        'ATTR-TEST-SULE',
        'Test Sule Pagoda',
        16.77490000,
        96.15890000,
        3000.00,
        60,
        '06:00:00',
        '20:00:00',
        (SELECT category_id FROM tbl_category WHERE category_code = 'CAT-TEST-RELIGIOUS'),
        false,
        true
    ),
    (
        'ATTR-TEST-SHWEDAGON',
        'Test Shwedagon Pagoda',
        16.79830000,
        96.14960000,
        10000.00,
        120,
        '05:00:00',
        '21:00:00',
        (SELECT category_id FROM tbl_category WHERE category_code = 'CAT-TEST-RELIGIOUS'),
        false,
        true
    ),
    (
        'ATTR-TEST-BOGYOKE',
        'Test Bogyoke Market',
        16.77940000,
        96.15470000,
        5000.00,
        90,
        '10:00:00',
        '17:00:00',
        (SELECT category_id FROM tbl_category WHERE category_code = 'CAT-TEST-SHOPPING'),
        false,
        true
    ),
    (
        'ATTR-TEST-KANDAWGYI',
        'Test Kandawgyi Lake',
        16.79800000,
        96.16590000,
        4000.00,
        90,
        '06:00:00',
        '18:30:00',
        (SELECT category_id FROM tbl_category WHERE category_code = 'CAT-TEST-NATURE'),
        false,
        true
    ),
    (
        'ATTR-TEST-CHAUKHTATGYI',
        'Test Chaukhtatgyi Buddha Temple',
        16.81260000,
        96.16450000,
        3000.00,
        60,
        '06:00:00',
        '19:00:00',
        (SELECT category_id FROM tbl_category WHERE category_code = 'CAT-TEST-RELIGIOUS'),
        false,
        true
    ),
    (
        'ATTR-TEST-NATIONAL-MUSEUM',
        'Test National Museum',
        16.78930000,
        96.14200000,
        5000.00,
        120,
        '09:30:00',
        '16:30:00',
        (SELECT category_id FROM tbl_category WHERE category_code = 'CAT-TEST-HISTORY'),
        false,
        true
    ),
    (
        'ATTR-TEST-INYA-LAKE',
        'Test Inya Lake Walk',
        16.83580000,
        96.13600000,
        2000.00,
        75,
        '06:00:00',
        '19:00:00',
        (SELECT category_id FROM tbl_category WHERE category_code = 'CAT-TEST-NATURE'),
        false,
        true
    ),
    (
        'ATTR-TEST-BOTATAUNG',
        'Test Botataung Pagoda',
        16.76840000,
        96.17140000,
        6000.00,
        75,
        '06:00:00',
        '20:00:00',
        (SELECT category_id FROM tbl_category WHERE category_code = 'CAT-TEST-RELIGIOUS'),
        false,
        true
    ),
    (
        'ATTR-TEST-CHINATOWN',
        'Test Yangon Chinatown Food Street',
        16.77590000,
        96.15030000,
        12000.00,
        90,
        '17:00:00',
        '22:00:00',
        (SELECT category_id FROM tbl_category WHERE category_code = 'CAT-TEST-FOOD'),
        false,
        true
    ),
    (
        'ATTR-TEST-CIRCULAR-TRAIN',
        'Test Yangon Circular Train Experience',
        16.78160000,
        96.16130000,
        2000.00,
        180,
        '07:00:00',
        '15:00:00',
        (SELECT category_id FROM tbl_category WHERE category_code = 'CAT-TEST-CULTURE'),
        false,
        true
    ),
    (
        'ATTR-TEST-CULTURE-WORKSHOP',
        'Test Long Cultural Workshop',
        16.82080000,
        96.15660000,
        18000.00,
        210,
        '13:00:00',
        '18:00:00',
        (SELECT category_id FROM tbl_category WHERE category_code = 'CAT-TEST-CULTURE'),
        false,
        true
    ),
    (
        'ATTR-TEST-THANLYIN',
        'Test Thanlyin Riverside Viewpoint',
        16.75860000,
        96.24800000,
        8000.00,
        90,
        '08:00:00',
        '17:30:00',
        (SELECT category_id FROM tbl_category WHERE category_code = 'CAT-TEST-NATURE'),
        false,
        true
    ),
    (
        'ATTR-TEST-HLAWGA',
        'Test Hlawga Nature Park',
        17.03670000,
        96.09320000,
        7000.00,
        180,
        '08:00:00',
        '17:00:00',
        (SELECT category_id FROM tbl_category WHERE category_code = 'CAT-TEST-NATURE'),
        false,
        true
    ),
    (
        'ATTR-TEST-LUXURY-CRUISE',
        'Test Premium Dinner Cruise',
        16.76100000,
        96.17450000,
        120000.00,
        150,
        '18:00:00',
        '22:00:00',
        (SELECT category_id FROM tbl_category WHERE category_code = 'CAT-TEST-FOOD'),
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
        'EXP-TEST-SULE-MORNING',
        (SELECT attraction_id FROM tbl_attraction WHERE attraction_code = 'ATTR-TEST-SULE'),
        'Morning pagoda visit',
        '07:00:00',
        '09:30:00',
        0.80,
        1.10,
        'Used to verify experience-aware timing for early religious visits.',
        false
    ),
    (
        'EXP-TEST-SHWEDAGON-SUNSET',
        (SELECT attraction_id FROM tbl_attraction WHERE attraction_code = 'ATTR-TEST-SHWEDAGON'),
        'Sunset golden hour',
        '16:30:00',
        '18:30:00',
        1.00,
        1.30,
        'High-value sunset experience for timing score validation.',
        false
    ),
    (
        'EXP-TEST-BOGYOKE-MIDDAY',
        (SELECT attraction_id FROM tbl_attraction WHERE attraction_code = 'ATTR-TEST-BOGYOKE'),
        'Market shopping hours',
        '11:00:00',
        '15:00:00',
        0.75,
        1.10,
        'Supports opening-hour and preference selection testing.',
        false
    ),
    (
        'EXP-TEST-KANDAWGYI-SUNSET',
        (SELECT attraction_id FROM tbl_attraction WHERE attraction_code = 'ATTR-TEST-KANDAWGYI'),
        'Lake sunset walk',
        '16:00:00',
        '18:00:00',
        0.90,
        1.20,
        'Supports nature preference and evening timing tests.',
        false
    ),
    (
        'EXP-TEST-CHAUKHTATGYI-MORNING',
        (SELECT attraction_id FROM tbl_attraction WHERE attraction_code = 'ATTR-TEST-CHAUKHTATGYI'),
        'Quiet morning temple visit',
        '08:00:00',
        '10:30:00',
        0.70,
        1.10,
        'Supports religious category scoring.',
        false
    ),
    (
        'EXP-TEST-MUSEUM-MIDDAY',
        (SELECT attraction_id FROM tbl_attraction WHERE attraction_code = 'ATTR-TEST-NATIONAL-MUSEUM'),
        'Indoor history visit',
        '10:00:00',
        '14:00:00',
        0.85,
        1.15,
        'Useful for testing attractions that close earlier than the day end.',
        false
    ),
    (
        'EXP-TEST-INYA-EVENING',
        (SELECT attraction_id FROM tbl_attraction WHERE attraction_code = 'ATTR-TEST-INYA-LAKE'),
        'Evening lake walk',
        '16:30:00',
        '18:30:00',
        0.80,
        1.15,
        'Supports travel time and nature preference testing.',
        false
    ),
    (
        'EXP-TEST-BOTATAUNG-MORNING',
        (SELECT attraction_id FROM tbl_attraction WHERE attraction_code = 'ATTR-TEST-BOTATAUNG'),
        'Riverside pagoda morning',
        '08:00:00',
        '10:00:00',
        0.75,
        1.10,
        'Supports endpoint-aware routing near the river.',
        false
    ),
    (
        'EXP-TEST-CHINATOWN-DINNER',
        (SELECT attraction_id FROM tbl_attraction WHERE attraction_code = 'ATTR-TEST-CHINATOWN'),
        'Street food dinner',
        '18:00:00',
        '21:00:00',
        0.95,
        1.25,
        'Tests late opening hours and evening food preference.',
        false
    ),
    (
        'EXP-TEST-TRAIN-MORNING',
        (SELECT attraction_id FROM tbl_attraction WHERE attraction_code = 'ATTR-TEST-CIRCULAR-TRAIN'),
        'Morning local train ride',
        '08:00:00',
        '11:00:00',
        0.90,
        1.20,
        'Long-duration culture item for day capacity testing.',
        false
    ),
    (
        'EXP-TEST-WORKSHOP-AFTERNOON',
        (SELECT attraction_id FROM tbl_attraction WHERE attraction_code = 'ATTR-TEST-CULTURE-WORKSHOP'),
        'Afternoon cultural workshop',
        '13:30:00',
        '16:30:00',
        1.00,
        1.25,
        'Long visit item for day end time constraint testing.',
        false
    ),
    (
        'EXP-TEST-THANLYIN-AFTERNOON',
        (SELECT attraction_id FROM tbl_attraction WHERE attraction_code = 'ATTR-TEST-THANLYIN'),
        'Afternoon riverside viewpoint',
        '14:00:00',
        '16:30:00',
        0.85,
        1.15,
        'Medium/far attraction for ORS and return-feasibility checks.',
        false
    ),
    (
        'EXP-TEST-HLAWGA-MORNING',
        (SELECT attraction_id FROM tbl_attraction WHERE attraction_code = 'ATTR-TEST-HLAWGA'),
        'Morning nature park visit',
        '08:30:00',
        '11:30:00',
        0.95,
        1.20,
        'Far attraction to trigger ORS or fallback/local estimate behavior.',
        false
    ),
    (
        'EXP-TEST-CRUISE-DINNER',
        (SELECT attraction_id FROM tbl_attraction WHERE attraction_code = 'ATTR-TEST-LUXURY-CRUISE'),
        'Premium dinner cruise',
        '18:30:00',
        '21:00:00',
        1.00,
        1.30,
        'High-cost item for budget constraint testing.',
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

COMMIT;

