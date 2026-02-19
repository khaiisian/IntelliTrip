class TripResponse {
    constructor(entity) {
        this.id = entity.trip_id;
        this.code = entity.trip_code;
        this.name = entity.trip_name;
        this.start_lat = entity.start_lat;
        this.start_lng = entity.start_lng;
        this.end_lat = entity.end_lat;
        this.end_lng = entity.end_lng;
        this.start_date = entity.start_date;
        this.end_date = entity.end_date;
        this.budget = entity.budget;
        this.user_id = entity.user_id;
        this.itineraries = entity.tbl_itinerary;
        this.preferences = entity.tbl_trip_preference;
        this.created_at = entity.created_at;
        this.modified_at = entity.modified_at;
    }
}

module.exports = TripResponse;
