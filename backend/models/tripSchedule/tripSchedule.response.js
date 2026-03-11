class ScheduleResponse {

    constructor(entity) {
        this.id = entity.schedule_id;
        this.trip_id = entity.trip_id;
        this.day_start_time = entity.day_start_time;
        this.day_end_time = entity.day_end_time;
        this.trip = entity.tbl_trip;
        this.created_at = entity.created_at;
    }

}

module.exports = ScheduleResponse;