class PreferenceResponse {

    constructor(entity) {
        this.id = entity.trip_pref_id;
        this.code = entity.trip_pref_code;
        this.trip_id = entity.trip_id;
        this.category_id = entity.category_id;
        this.preference_weight = entity.preference_weight;
        this.trip = entity.tbl_trip;
        this.category = entity.tbl_category;
    }

}

module.exports = PreferenceResponse;