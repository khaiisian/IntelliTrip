class AttractionResponse {
    constructor(entity) {
        this.code = entity.attraction_code;
        this.name = entity.attraction_name;
        this.latitude = entity.latitude;
        this.longitude = entity.longitude;
        this.cost = entity.cost;
        this.duration_minutes = entity.duration_minutes;
        this.open_time = entity.open_time;
        this.close_time = entity.close_time;
        this.category = entity.tbl_category;
        this.created_at = entity.created_at;
    }
}

module.exports = AttractionResponse;
