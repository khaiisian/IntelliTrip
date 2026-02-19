class CreateAttractionExperienceRequest {
    constructor(exp) {
        this.attraction_id = exp.attraction_id;
        this.experience_type = exp.experience_type;
        this.best_time_start = exp.best_time_start;
        this.best_time_end = exp.best_time_end;
        this.experience_score_weight = exp.experience_score_weight;
    }
}

class UpdateAttractionExperienceRequest {
    constructor(exp) {
        this.experience_type = exp.experience_type;
        this.best_time_start = exp.best_time_start;
        this.best_time_end = exp.best_time_end;
        this.experience_score_weight = exp.experience_score_weight;
    }
}

module.exports = { CreateAttractionExperienceRequest, UpdateAttractionExperienceRequest };
