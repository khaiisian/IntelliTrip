class CreatePreferenceRequest {

    constructor(pref) {
        this.trip_id = pref.trip_id;
        this.category_id = pref.category_id;
        this.preference_weight = pref.preference_weight;
    }

}

class UpdatePreferenceRequest {

    constructor(pref) {
        this.category_id = pref.category_id;
        this.preference_weight = pref.preference_weight;
    }

}

module.exports = { CreatePreferenceRequest, UpdatePreferenceRequest };