class ConfigResponse {

    constructor(entity) {
        this.id = entity.config_id;
        this.travel_speed_kmh = entity.travel_speed_kmh;
        this.break_minutes = entity.break_minutes;
        this.updated_at = entity.updated_at;
    }

}

module.exports = ConfigResponse;