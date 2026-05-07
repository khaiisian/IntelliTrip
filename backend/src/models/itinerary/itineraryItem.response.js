const { formatTime } = require('../../utils/time');

class ItineraryItemResponse {
    constructor(entity) {
        this.item_id = entity.item_id;
        this.day_number = entity.day_number;
        this.visit_start_time = formatTime(entity.visit_start_time);
        this.visit_end_time = formatTime(entity.visit_end_time);
        this.attraction_id = entity.attraction_id;
        this.distance_from_previous = Number(entity.distance_from_previous || 0);
        this.final_score = Number(entity.final_score || 0);
    }
}

module.exports = ItineraryItemResponse;
