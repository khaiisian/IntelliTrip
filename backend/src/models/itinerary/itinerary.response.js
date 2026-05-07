const ItineraryItemResponse = require('./itineraryItem.response');

class ItineraryResponse {
    constructor(entity) {
        this.itinerary_id = entity.itinerary_id;
        this.trip = entity.tbl_trip ? {
            trip_name: entity.tbl_trip.trip_name,
            trip_code: entity.tbl_trip.trip_code,
            start_date: entity.tbl_trip.start_date,
            end_date: entity.tbl_trip.end_date
        } : null;
        this.generated_at = entity.generated_at;
        this.total_cost = Number(entity.total_cost || 0);
        this.attraction_count = Array.isArray(entity.tbl_itinerary_item)
            ? entity.tbl_itinerary_item.length
            : 0;
        this.items = Array.isArray(entity.tbl_itinerary_item)
            ? entity.tbl_itinerary_item.map(item => new ItineraryItemResponse(item))
            : [];
    }
}

module.exports = ItineraryResponse;
