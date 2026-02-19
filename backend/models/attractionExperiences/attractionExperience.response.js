class AttractionExperienceResponse {
    constructor(entity) {
        this.code = entity.experience_code;
        this.attraction_id = entity.attraction_id;
        this.type = entity.experience_type;
        this.best_time_start = entity.best_time_start;
        this.best_time_end = entity.best_time_end;
        this.score_weight = entity.experience_score_weight;
        this.attraction = entity.tbl_attraction;
    }
}

module.exports = AttractionExperienceResponse;
