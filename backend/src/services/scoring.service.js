// scoring.service.js

const { parseTime } = require('../utils/time');
const { SCORING_CONFIG } = require('./scoring.config');

/**
 * Normalize helpers (ALL values must be 0–1)
 */
const clamp01 = (v) => Math.max(0, Math.min(1, v));

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

exports.prepareAttractions = (attractions, experiences, preferences) => {
    const prepared = [];

    for (const attraction of attractions) {
        // Find category weight
        const categoryPref = preferences.find(p => p.category_id === attraction.category_id);
        const categoryWeight =
            categoryPref?.preference_weight ??
            preferences.reduce((sum, p) => sum + p.preference_weight, 0) / (preferences.length || 1);

        // Get experiences for this attraction
        const attractionExperiences = experiences.filter(e => e.attraction_id === attraction.attraction_id);

        // Base score: only category preference (no rating data available)
        const baseScore = categoryWeight;

        prepared.push({
            ...attraction,
            cost: Number(attraction.cost) || 0,
            base_score: baseScore,
            experiences: attractionExperiences // NOTE: experiences are used only in routing layer
        });
    }

    return prepared;
};

/**
 * Unified scoring function (ONLY ONE in system)
 */
function computeExperienceScore(experiences, arrivalTime) {
    if (!experiences?.length) return 0;

    let score = 0;
    const arrivalMin = arrivalTime.getUTCHours() * 60 + arrivalTime.getUTCMinutes();

    let totalWeight = 0;
    for (const e of experiences) {
        const start = parseTime(e.best_time_start);
        const end = parseTime(e.best_time_end);

        const startMin = start.getUTCHours() * 60 + start.getUTCMinutes();
        const endMin = end.getUTCHours() * 60 + end.getUTCMinutes();

        let match = 0;
        if (arrivalMin >= startMin && arrivalMin <= endMin) {
            match = 1;
        } else {
            const dist = Math.min(
                Math.abs(arrivalMin - startMin),
                Math.abs(arrivalMin - endMin)
            );
            match = Math.max(0, 1 - dist / 180);
        }

        score += e.experience_score_weight * match;
        totalWeight += e.experience_score_weight;
    }

    return totalWeight > 0 ? clamp01(score / totalWeight) : 0;
}

exports.computeExperienceScore = computeExperienceScore;

exports.computeScore = ({
    basePreference,
    experienceScore,
    travelMinutes,
    waitMinutes,
    cost,
    distance = 0,
    toEndDistanceNormalized = 0,
    maxCost,
    currentDay,
    totalDays,
    currentTime,
    remainingBudget
}) => {

    const P = clamp01(basePreference);
    const E = clamp01(experienceScore);

    const T = Math.min(travelMinutes / SCORING_CONFIG.limits.maxTravelMin, 1);
    const W = Math.min(waitMinutes / SCORING_CONFIG.limits.maxWaitMin, 1);
    const C = Math.min(cost / maxCost, 1);

    const clusterPenalty = distance > 2 ? distance * 0.1 : 0;

    // =========================================================
    // 🔥 1. DAY-AWARE SCORING (THIS IS THE CORE FIX)
    // =========================================================

    const dayPressure = currentDay / totalDays;

    // later days = more urgency → higher score pressure
    const lateGameBoost = dayPressure * 0.25;

    // =========================================================
    // 🔥 2. TIME-OF-DAY STRUCTURE
    // =========================================================

    const hour = currentTime?.getUTCHours?.() ?? 12;

    let timeBonus = 0;

    if (hour >= 18) timeBonus = 0.2;
    else if (hour <= 10) timeBonus = -0.05;

    // =========================================================
    // 🔥 3. BUDGET PRESSURE (VERY IMPORTANT FOR YOUR BUG)
    // =========================================================

    const budgetPressure = remainingBudget > 0
        ? cost / remainingBudget
        : 1;

    const budgetPenalty = budgetPressure * 0.15;

    // =========================================================
    // 🔥 4. DISTANCE-TO-END SOFT PENALTY
    // Penalize candidates that leave the user far from endpoint (soft bias)
    const endPenalty = (toEndDistanceNormalized ?? 0) * 0.15;

    // =========================================================
    // FINAL SCORE
    // =========================================================

    const score =
        SCORING_CONFIG.weights.preference * P +
        SCORING_CONFIG.weights.experience * E -
        SCORING_CONFIG.weights.travel * T -
        SCORING_CONFIG.weights.cost * C -
        SCORING_CONFIG.weights.wait * W -
        clusterPenalty +
        lateGameBoost +
        timeBonus -
        budgetPenalty -
        endPenalty;

    return score;
};