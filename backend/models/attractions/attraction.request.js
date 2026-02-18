class CreateAttractionRequest {
    constructor(attraction) {
        this.attraction_name = attraction.attraction_name;
        this.latitude = attraction.latitude;
        this.longitude = attraction.longitude;
        this.cost = attraction.cost;
        this.duration_minutes = attraction.duration_minutes;
        this.open_time = attraction.open_time;
        this.close_time = attraction.close_time;
        this.category_id = attraction.category_id;
    }
}

class UpdateAttractionRequest {
    constructor(attraction) {
        this.attraction_name = attraction.attraction_name;
        this.latitude = attraction.latitude;
        this.longitude = attraction.longitude;
        this.cost = attraction.cost;
        this.duration_minutes = attraction.duration_minutes;
        this.open_time = attraction.open_time;
        this.close_time = attraction.close_time;
        this.category_id = attraction.category_id;
    }
}

module.exports = { CreateAttractionRequest, UpdateAttractionRequest };
