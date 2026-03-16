exports.calculateTripDays = (startDate, endDate) => {

    const start = new Date(startDate);
    const end = new Date(endDate);

    const diff = end - start;

    const days = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;

    return days;
};

exports.calculateAttractionScores = (
    attractions,
    experiences,
    preferences
) => {

    const scoredAttractions = [];

    for (const attraction of attractions) {

        const categoryPreference = preferences.find(
            p => p.category_id === attraction.category_id
        );

        const categoryWeight = categoryPreference
            ? categoryPreference.preference_weight
            : 0;

        const attractionExperiences = experiences.filter(
            e => e.attraction_id === attraction.attraction_id
        );

        let bestScore = 0;

        for (const exp of attractionExperiences) {

            let score = categoryWeight * exp.experience_score_weight;

            if (isBestTime(exp)) {
                score = score * exp.time_bonus_multiplier;
            }

            if (score > bestScore)
                bestScore = score;
        }

        scoredAttractions.push({
            ...attraction,
            experience_score: bestScore
        });

    }

    return scoredAttractions;
};

function isBestTime(exp) {

    const now = new Date();

    const currentMinutes =
        now.getHours() * 60 + now.getMinutes();

    const start =
        new Date(exp.best_time_start).getHours() * 60 +
        new Date(exp.best_time_start).getMinutes();

    const end =
        new Date(exp.best_time_end).getHours() * 60 +
        new Date(exp.best_time_end).getMinutes();

    return currentMinutes >= start && currentMinutes <= end;
}

exports.rankAttractions = (scoredAttractions) => {

    return scoredAttractions.sort(
        (a, b) => b.experience_score - a.experience_score
    );

};

exports.filterByBudget = (rankedAttractions, tripBudget) => {

    let totalCost = 0;

    const selected = [];

    for (const attraction of rankedAttractions) {

        const cost = Number(attraction.cost);

        if (totalCost + cost <= tripBudget) {

            selected.push(attraction);

            totalCost += cost;

        }

    }

    return selected;
};
