class CreateTripRequest {
    constructor(trip) {
        this.trip_name = trip.trip_name;
        this.start_lat = trip.start_lat;
        this.start_lng = trip.start_lng;
        this.end_lat = trip.end_lat;
        this.end_lng = trip.end_lng;
        this.start_date = trip.start_date;
        this.end_date = trip.end_date;
        this.budget = trip.budget;
        this.user_id = trip.user_id;
    }
}

class UpdateTripRequest {
    constructor(trip) {
        this.trip_name = trip.trip_name;
        this.start_lat = trip.start_lat;
        this.start_lng = trip.start_lng;
        this.end_lat = trip.end_lat;
        this.end_lng = trip.end_lng;
        this.start_date = trip.start_date;
        this.end_date = trip.end_date;
        this.budget = trip.budget;
    }
}

module.exports = { CreateTripRequest, UpdateTripRequest };
