const expRepo = require('../repositories/attractionExperience.repository');
const { CreateAttractionExperienceRequest, UpdateAttractionExperienceRequest } = require('../models/attractionExperiences/attractionExperience.request');
const AttractionExperienceResponse = require('../models/attractionExperiences/attractionExperience.response');
const generateCode = require('../src/utils/generateCode');
const toTime = require('../src/utils/formatTime');

exports.getExperiencesByAttraction = async (attraction_id) => {
    const data = await expRepo.findAllByAttraction(attraction_id);
    return data.map(x => new AttractionExperienceResponse(x));
};

exports.getExperienceByCode = async (code) => {
    const exp = await expRepo.findByCode(code);
    if (!exp) throw { status: false, statusCode: 404, message: 'Experience not found' };
    return new AttractionExperienceResponse(exp);
};

exports.createExperience = async (payload) => {
    const req = new CreateAttractionExperienceRequest(payload);

    req.best_time_start = toTime(payload.best_time_start);
    req.best_time_end = toTime(payload.best_time_end);

    if (!req.attraction_id) throw { status: false, statusCode: 400, message: 'Attraction is required' };
    if (!req.experience_type?.trim()) throw { status: false, statusCode: 400, message: 'Experience type is required' };
    if (req.experience_score_weight < 0) throw { status: false, statusCode: 400, message: 'Score weight cannot be negative' };
    if (new Date(req.best_time_start) >= new Date(req.best_time_end))
        throw { status: false, statusCode: 400, message: 'Best time start must be before end' };

    req.experience_code = await generateCode(
        'tbl_attraction_experience',
        'experience_code',
        'EXP'
    );

    const exp = await expRepo.create(req);
    return new AttractionExperienceResponse(exp);
};

exports.updateExperience = async (code, payload) => {
    const existing = await expRepo.findByCode(code);
    if (!existing) throw { status: false, statusCode: 404, message: 'Experience not found' };

    const req = new UpdateAttractionExperienceRequest(payload);

    req.best_time_start = toTime(payload.best_time_start);
    req.best_time_end = toTime(payload.best_time_end);

    if (req.experience_score_weight !== undefined && req.experience_score_weight < 0)
        throw { status: false, statusCode: 400, message: 'Score weight cannot be negative' };

    if (req.best_time_start && req.best_time_end &&
        new Date(req.best_time_start) >= new Date(req.best_time_end))
        throw { status: false, statusCode: 400, message: 'Best time start must be before end' };

    const exp = await expRepo.update(code, req);
    return new AttractionExperienceResponse(exp);
};

exports.deleteExperience = async (code) => {
    const existing = await expRepo.findByCode(code);
    if (!existing) throw { status: false, statusCode: 404, message: 'Experience not found' };

    const exp = await expRepo.remove(code);
    return new AttractionExperienceResponse(exp);
};
