class CreateScheduleRequest {
    constructor(schedule) {
        this.trip_id = schedule.trip_id;
        this.day_start_time = schedule.day_start_time;
        this.day_end_time = schedule.day_end_time;
    }
}

class UpdateScheduleRequest {
    constructor(schedule) {
        this.day_start_time = schedule.day_start_time;
        this.day_end_time = schedule.day_end_time;
    }
}

module.exports = { CreateScheduleRequest, UpdateScheduleRequest };