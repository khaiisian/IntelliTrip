class CreateItineraryRequest {
    constructor(payload) {
        this.itinerary = Array.isArray(payload?.itinerary) ? payload.itinerary : [];
        this.total_cost = payload?.total_cost !== undefined ? Number(payload.total_cost) : null;
    }
}

module.exports = CreateItineraryRequest;
