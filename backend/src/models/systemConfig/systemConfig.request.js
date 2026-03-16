class CreateConfigRequest {

    constructor(config) {
        this.travel_speed_kmh = config.travel_speed_kmh;
        this.break_minutes = config.break_minutes;
    }

}

class UpdateConfigRequest {

    constructor(config) {
        this.travel_speed_kmh = config.travel_speed_kmh;
        this.break_minutes = config.break_minutes;
    }

}

module.exports = { CreateConfigRequest, UpdateConfigRequest };