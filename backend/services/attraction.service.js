const attractionRepo = require('../repositories/attraction.repository');
const AttractionResponse = require('../models/attractions/attraction.response');
const { CreateAttractionRequest, UpdateAttractionRequest } = require('../models/attractions/attraction.request');
const generateCode = require('../src/utils/generateCode');
const toTime = require('../src/utils/formatTime');

exports.getAttractions = async () => {
    const data = await attractionRepo.findAll();
    return data.map(x => new AttractionResponse(x));
};

exports.getAttractionByCode = async (code) => {
    const attraction = await attractionRepo.findByCode(code);
    if (!attraction) {
        throw { status: false, statusCode: 404, message: 'Attraction not found' };
    }
    return new AttractionResponse(attraction);
};

exports.createAttraction = async (payload) => {
    const request = new CreateAttractionRequest(payload);

    request.attraction_name = request.attraction_name?.trim();

    if (!request.attraction_name)
        throw { status: false, statusCode: 400, message: 'Attraction name is required' };

    if (!request.category_id)
        throw { status: false, statusCode: 400, message: 'Category is required' };

    if (request.latitude < -90 || request.latitude > 90)
        throw { status: false, statusCode: 400, message: 'Invalid latitude' };

    if (request.longitude < -180 || request.longitude > 180)
        throw { status: false, statusCode: 400, message: 'Invalid longitude' };

    if (request.cost < 0)
        throw { status: false, statusCode: 400, message: 'Cost cannot be negative' };

    if (request.duration_minutes <= 0)
        throw { status: false, statusCode: 400, message: 'Invalid duration' };

    request.open_time = toTime(payload.open_time);
    request.close_time = toTime(payload.close_time);

    if (request.open_time >= request.close_time)
        throw { status: false, statusCode: 400, message: 'Open time must be before close time' };

    request.attraction_code = await generateCode(
        'tbl_attraction',
        'attraction_code',
        'ATTR'
    );

    const attraction = await attractionRepo.create(request);
    return new AttractionResponse(attraction);
};

exports.updateAttraction = async (code, payload) => {
    if (!code)
        throw { statusCode: 400, message: 'Attraction code is required' };

    const existing = await attractionRepo.findByCode(code);
    if (!existing)
        throw { statusCode: 404, message: 'Attraction not found' };

    const request = new UpdateAttractionRequest(payload);

    if (request.attraction_name !== undefined) {
        request.attraction_name = request.attraction_name.trim();
        if (!request.attraction_name)
            throw { statusCode: 400, message: 'Invalid attraction name' };
    }

    if (request.latitude !== undefined &&
        (request.latitude < -90 || request.latitude > 90))
        throw { statusCode: 400, message: 'Invalid latitude' };

    if (request.longitude !== undefined &&
        (request.longitude < -180 || request.longitude > 180))
        throw { statusCode: 400, message: 'Invalid longitude' };

    if (request.cost !== undefined && request.cost < 0)
        throw { statusCode: 400, message: 'Cost cannot be negative' };

    if (request.duration_minutes !== undefined && request.duration_minutes <= 0)
        throw { statusCode: 400, message: 'Invalid duration' };

    if (payload.open_time)
        request.open_time = toTime(payload.open_time);

    if (payload.close_time)
        request.close_time = toTime(payload.close_time);

    if (request.open_time && request.close_time &&
        request.open_time >= request.close_time)
        throw { statusCode: 400, message: 'Open time must be before close time' };

    // if (request.category_id) {
    //     const category = await categoryRepo.findById(request.category_id);
    //     if (!category)
    //         throw { statusCode: 400, message: 'Invalid category' };
    // }

    const attraction = await attractionRepo.update(code, request);
    return new AttractionResponse(attraction);
};

exports.deleteAttraction = async (code) => {
    const existing = await attractionRepo.findByCode(code);
    if (!existing)
        throw { status: false, statusCode: 404, message: 'Attraction not found' };

    const attraction = await attractionRepo.remove(code);
    return new AttractionResponse(attraction);
};