// scoring.config.js
exports.SCORING_CONFIG = {
    weights: {
        preference: 0.35,
        experience: 0.35,
        travel: 0.15,
        cost: 0.1,
        wait: 0.05
    },
    limits: {
        maxTravelMin: 90,
        maxWaitMin: 60,
        maxCost: 100,
        maxExperience: 5,
        // used to normalize distance-to-end values (km)
        maxConsideredDistanceKm: 20
    }
};