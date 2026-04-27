// utils/travelTime.js

/**
 * Calculate travel time in minutes based on distance and speed
 * @param {Number} distanceKm - Distance in kilometers
 * @param {Number} speedKmh - Speed in km/h
 * @returns {Number} Travel time in minutes
 */
exports.calculateTravelMinutes = (distanceKm, speedKmh) => {
    if (!distanceKm || distanceKm <= 0) return 0;
    // if (!speedKmh || speedKmh <= 0) return 30; // Default fallback
    if (!speedKmh || speedKmh <= 0) {
        throw new Error(`Invalid travel speed: ${speedKmh}`);
    }

    const hours = distanceKm / speedKmh;
    const minutes = hours * 60;

    return Math.ceil(minutes); // Round up to be safe
};

/**
 * Estimate travel time based on distance only (simpler)
 */
exports.estimateTravelMinutes = (distanceKm) => {
    // Assume average 20 km/h if speed not provided
    return exports.calculateTravelMinutes(distanceKm, 20);
};