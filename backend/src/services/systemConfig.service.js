const configRepo = require('../repositories/systemConfig.repository');
const ConfigResponse = require('../models/systemConfig/systemConfig.response');
const { CreateConfigRequest, UpdateConfigRequest } = require('../models/systemConfig/systemConfig.request');

exports.getConfigs = async () => {
    const configs = await configRepo.findAll();
    return configs.map(x => new ConfigResponse(x));
};

exports.getConfigById = async (id) => {
    const config = await configRepo.findById(id);

    if (!config)
        throw { statusCode: 404, message: "System config not found" };

    return new ConfigResponse(config);
};

exports.createConfig = async (payload) => {

    const request = new CreateConfigRequest(payload);

    if (request.travel_speed_kmh <= 0)
        throw { statusCode: 400, message: "Travel speed must be positive" };

    if (request.break_minutes < 0)
        throw { statusCode: 400, message: "Break minutes cannot be negative" };

    const config = await configRepo.create(request);

    return new ConfigResponse(config);
};

exports.updateConfig = async (id, payload) => {

    const existing = await configRepo.findById(id);

    if (!existing)
        throw { statusCode: 404, message: "System config not found" };

    const request = new UpdateConfigRequest(payload);

    if (request.travel_speed_kmh !== undefined && request.travel_speed_kmh <= 0)
        throw { statusCode: 400, message: "Invalid travel speed" };

    if (request.break_minutes !== undefined && request.break_minutes < 0)
        throw { statusCode: 400, message: "Invalid break minutes" };

    const config = await configRepo.update(id, request);

    return new ConfigResponse(config);
};

exports.deleteConfig = async (id) => {

    const existing = await configRepo.findById(id);

    if (!existing)
        throw { statusCode: 404, message: "System config not found" };

    const config = await configRepo.remove(id);

    return new ConfigResponse(config);
};