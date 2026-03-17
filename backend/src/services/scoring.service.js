// scoring.service.js

/**
 * Calculate number of days between start and end date
 */
exports.calculateTripDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = end - start;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
    return days;
};

/**
 * Define time slots to evaluate (2-hour blocks)
 */
const TIME_SLOTS = [
    '06:00', '08:00', '10:00', '12:00',
    '14:00', '16:00', '18:00', '20:00'
];

function formatTime(time) {
    if (typeof time === 'string') return time; // already a string
    if (time instanceof Date) {
        const h = String(time.getHours()).padStart(2, '0');
        const m = String(time.getMinutes()).padStart(2, '0');
        return `${h}:${m}`;
    }
    // fallback for object {hours, minutes}
    if (time.hours !== undefined && time.minutes !== undefined) {
        const h = String(time.hours).padStart(2, '0');
        const m = String(time.minutes).padStart(2, '0');
        return `${h}:${m}`;
    }
    return '00:00'; // default fallback
}

/**
 * Check if a given time falls within an experience's best time window
 * @param {Object} experience - The experience object
 * @param {String} timeStr - Time to check (format: "HH:MM")
 * @returns {Boolean} - True if time is within best window
 */
function isTimeInBestWindow(experience, timeStr) {
    if (!timeStr) return false; // guard against undefined/null
    timeStr = timeStr.toString(); // convert to string if not

    const startStr = formatTime(experience.best_time_start);
    const endStr = formatTime(experience.best_time_end);

    const timeMinutes = parseInt(timeStr.split(':')[0]) * 60 + parseInt(timeStr.split(':')[1]);
    const startMinutes = parseInt(startStr.split(':')[0]) * 60 + parseInt(startStr.split(':')[1]);
    const endMinutes = parseInt(endStr.split(':')[0]) * 60 + parseInt(endStr.split(':')[1]);

    return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
}

/**
 * Calculate score for a single attraction at a specific time slot
 */
function calculateScoreForTimeSlot(attraction, experiences, preferences, timeSlot) {
    // Find category preference (default to 0.5 if not found)
    const categoryPreference = preferences.find(
        p => p.category_id === attraction.category_id
    );
    const categoryWeight = categoryPreference
        ? categoryPreference.preference_weight
        : 0.5;  // FIXED: Default weight instead of 0

    // Get experiences for this attraction
    const attractionExperiences = experiences.filter(
        e => e.attraction_id === attraction.attraction_id
    );

    if (attractionExperiences.length === 0) {
        // No experiences = base score using only category
        return {
            ...attraction,
            time_slot: timeSlot,
            experience_score: categoryWeight,
            is_best_time: false,
            matched_experience: null
        };
    }

    // Calculate best score among all experiences for this time slot
    let bestScore = 0;
    let bestExperience = null;
    let isBestTime = false;

    for (const exp of attractionExperiences) {
        // Base score from category + experience weight
        let score = categoryWeight * exp.experience_score_weight;

        // Apply time bonus if this time slot is within best window
        const timeMatches = isTimeInBestWindow(exp, timeSlot);
        if (timeMatches) {
            score = score * exp.time_bonus_multiplier;
        }

        if (score > bestScore) {
            bestScore = score;
            bestExperience = exp;
            isBestTime = timeMatches;
        }
    }

    return {
        ...attraction,
        time_slot: timeSlot,
        experience_score: bestScore,
        is_best_time: isBestTime,
        matched_experience: bestExperience ? {
            type: bestExperience.experience_type,
            weight: bestExperience.experience_score_weight
        } : null
    };
}

/**
 * Main scoring function - scores each attraction for each time slot
 */
exports.calculateAttractionScores = (
    attractions,
    experiences,
    preferences
) => {
    const scoredAttractions = [];

    for (const attraction of attractions) {
        for (const timeSlot of TIME_SLOTS) {
            const scored = calculateScoreForTimeSlot(
                attraction,
                experiences,
                preferences,
                timeSlot
            );
            scoredAttractions.push(scored);
        }
    }

    return scoredAttractions;
};

/**
 * Rank attractions by score (highest first)
 */
exports.rankAttractions = (scoredAttractions) => {
    return [...scoredAttractions].sort(
        (a, b) => b.experience_score - a.experience_score
    );
};

/**
 * Filter attractions by budget
 * Note: This is a simple filter - you might want to make this smarter
 */
exports.filterByBudget = (rankedAttractions, tripBudget) => {
    let totalCost = 0;
    const selected = [];

    // Use a Set to track unique attractions (avoid duplicates from time slots)
    const seenAttractionIds = new Set();

    for (const attraction of rankedAttractions) {
        // Skip if we've already selected this attraction
        if (seenAttractionIds.has(attraction.attraction_id)) {
            continue;
        }

        const cost = Number(attraction.cost);
        if (totalCost + cost <= tripBudget) {
            selected.push(attraction);
            totalCost += cost;
            seenAttractionIds.add(attraction.attraction_id);
        }
    }

    return selected;
};

/**
 * Get best time slot for each attraction (useful for display)
 */
exports.getBestTimeSlotForAttractions = (scoredAttractions) => {
    const bestPerAttraction = new Map();

    for (const scored of scoredAttractions) {
        const id = scored.attraction_id;
        if (!bestPerAttraction.has(id) ||
            bestPerAttraction.get(id).experience_score < scored.experience_score) {
            bestPerAttraction.set(id, scored);
        }
    }

    return Array.from(bestPerAttraction.values());
};