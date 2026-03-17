// routing.service.js

const { calculateDistance } = require('../utils/distance');

// Simple in-memory cache for distances
const distanceCache = new Map();

/**
 * Get cached distance between two points
 */
function getCachedDistance(lat1, lng1, lat2, lng2) {
    const key = `${lat1},${lng1}-${lat2},${lng2}`;
    const reverseKey = `${lat2},${lng2}-${lat1},${lng1}`;

    if (distanceCache.has(key)) {
        return distanceCache.get(key);
    }
    if (distanceCache.has(reverseKey)) {
        return distanceCache.get(reverseKey);
    }

    const distance = calculateDistance(lat1, lng1, lat2, lng2);
    distanceCache.set(key, distance);
    return distance;
}

/**
 * Nearest neighbor routing with optional score weighting
 * @param {Object} startLocation - { lat, lng }
 * @param {Array} attractions - Array of attraction objects with scores
 * @param {Object} options - Configuration options
 * @param {Number} options.scoreWeight - How much to weight score vs distance (0-1)
 * @returns {Array} - Route with distances
 */
exports.nearestNeighborRoute = (
    startLocation,
    attractions,
    options = { scoreWeight: 0.7 }
) => {
    // Handle empty attractions
    if (!attractions || attractions.length === 0) {
        return [];
    }

    const route = [];
    const distanceWeight = 1 - options.scoreWeight;

    let current = {
        lat: Number(startLocation.lat),
        lng: Number(startLocation.lng)
    };

    const remaining = [...attractions];

    while (remaining.length > 0) {
        let bestIndex = 0;
        let bestValue = -Infinity; // For combined score
        let bestDistance = Infinity;

        for (let i = 0; i < remaining.length; i++) {
            const attr = remaining[i];

            const distance = getCachedDistance(
                current.lat,
                current.lng,
                Number(attr.latitude),
                Number(attr.longitude)
            );

            // FIXED: Combine score AND distance
            // Normalize distance (assume max practical distance ~10km)
            const normalizedDistance = Math.min(distance / 10, 1);

            // Combined score: higher score good, lower distance good
            const combinedValue =
                (options.scoreWeight * attr.experience_score) -
                (distanceWeight * normalizedDistance);

            if (combinedValue > bestValue) {
                bestValue = combinedValue;
                bestIndex = i;
                bestDistance = distance;
            }
        }

        const nextAttraction = remaining.splice(bestIndex, 1)[0];

        route.push({
            ...nextAttraction,
            distance_from_previous: bestDistance,
            combined_score: bestValue
        });

        current = {
            lat: Number(nextAttraction.latitude),
            lng: Number(nextAttraction.longitude)
        };
    }

    return route;
};

/**
 * Simple nearest neighbor (distance only) - kept for compatibility
 */
exports.distanceOnlyRoute = (startLocation, attractions) => {
    return exports.nearestNeighborRoute(startLocation, attractions, { scoreWeight: 0 });
};

/**
 * Score-only route (ignore distance) - useful for comparison
 */
exports.scoreOnlyRoute = (startLocation, attractions) => {
    return exports.nearestNeighborRoute(startLocation, attractions, { scoreWeight: 1 });
};

/**
 * Clear distance cache (useful for testing)
 */
exports.clearDistanceCache = () => {
    distanceCache.clear();
};