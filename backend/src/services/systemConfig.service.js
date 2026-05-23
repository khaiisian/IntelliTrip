const configRepo = require('../repositories/systemConfig.repository');
const ConfigResponse = require('../models/systemConfig/systemConfig.response');
const { CreateConfigRequest, UpdateConfigRequest } = require('../models/systemConfig/systemConfig.request');
const prisma = require('../prisma');

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

exports.getDashboardMetrics = async () => {
    // counts
    const [totalAttractions, totalCategories, totalExperiences, totalTrips, totalUsers] = await Promise.all([
        prisma.tbl_attraction.count({ where: { is_deleted: false } }),
        prisma.tbl_category.count({ where: { is_deleted: false } }),
        prisma.tbl_attraction_experience.count({ where: { is_deleted: false } }),
        prisma.tbl_trip.count({ where: { is_deleted: false } }),
        prisma.tbl_user.count({ where: { is_deleted: false } })
    ]);

    // users by role
    const usersByRoleRaw = await prisma.tbl_user.groupBy({ by: ['user_role'], _count: { user_id: true } });
    const users_by_role = {};
    usersByRoleRaw.forEach(r => { users_by_role[r.user_role] = r._count.user_id; });

    // recent attractions
    const recentAttractionsRaw = await prisma.tbl_attraction.findMany({
        where: { is_deleted: false },
        orderBy: { created_at: 'desc' },
        take: 5,
        include: { tbl_category: true }
    });
    const recent_attractions = recentAttractionsRaw.map(a => ({ name: a.attraction_name, code: a.attraction_code, category: a.tbl_category?.category_name, created_at: a.created_at }));

    // recent experiences
    const recentExperiencesRaw = await prisma.tbl_attraction_experience.findMany({
        where: { is_deleted: false },
        orderBy: { experience_id: 'desc' },
        take: 5,
        include: { tbl_attraction: true }
    });
    const recent_experiences = recentExperiencesRaw.map(e => ({ type: e.experience_type, code: e.experience_code, attraction: e.tbl_attraction?.attraction_name, created_at: e.created_at }));

    // simple health check
    let dbStatus = 'ok';
    try {
        await prisma.$queryRaw`SELECT 1`;
    } catch (err) {
        dbStatus = 'error';
    }

    return {
        total_attractions: totalAttractions,
        total_experiences: totalExperiences,
        total_categories: totalCategories,
        total_trips: totalTrips,
        total_users: totalUsers,
        users_by_role,
        recent_attractions,
        recent_experiences,
        system_health: { db: dbStatus }
    };
};

exports.getTripsOverTime = async (period = 'daily') => {
    // period: daily or weekly - group trips by date
    if (period === 'weekly') {
        const rows = await prisma.$queryRaw`
            SELECT YEARWEEK(created_at, 1) as yw, COUNT(*) as count
            FROM tbl_trip
            WHERE is_deleted = false
            GROUP BY yw
            ORDER BY yw ASC
        `;
        return rows.map(r => ({ period: String(r.yw), count: Number(r.count) }));
    }

    const rows = await prisma.$queryRaw`
        SELECT DATE(created_at) as d, COUNT(*) as count
        FROM tbl_trip
        WHERE is_deleted = false
        GROUP BY d
        ORDER BY d ASC
    `;
    return rows.map(r => {
        const d = r.d;
        let periodStr = '';
        if (d instanceof Date) periodStr = d.toISOString().slice(0, 10);
        else periodStr = String(d).slice(0, 10);
        return { period: periodStr, count: Number(r.count) };
    });
};

exports.getVisitsByCategory = async () => {
    const rows = await prisma.$queryRaw`
        SELECT c.category_name as category, COUNT(*) as visits
        FROM tbl_itinerary_item i
        JOIN tbl_attraction a ON i.attraction_id = a.attraction_id
        JOIN tbl_category c ON a.category_id = c.category_id
        WHERE i.is_deleted = false
        GROUP BY c.category_id
        ORDER BY visits DESC
    `;
    return rows.map(r => ({ category: r.category, visits: Number(r.visits) }));
};

exports.getTopAttractions = async (limit = 10) => {
    const rows = await prisma.$queryRawUnsafe(`
        SELECT a.attraction_name as name, a.attraction_code as code, COUNT(*) as visits
        FROM tbl_itinerary_item i
        JOIN tbl_attraction a ON i.attraction_id = a.attraction_id
        WHERE i.is_deleted = false
        GROUP BY a.attraction_id
        ORDER BY visits DESC
        LIMIT ${Number(limit)}
    `);
    return rows.map(r => ({ name: r.name, code: r.code, visits: Number(r.visits) }));
};

exports.getExperienceUsage = async () => {
    const rows = await prisma.$queryRaw`
        SELECT experience_type as type, COUNT(*) as usage_count
        FROM tbl_attraction_experience
        WHERE is_deleted = false
        GROUP BY experience_type
        ORDER BY usage_count DESC
        LIMIT 5
    `;
    return rows.map(r => ({ type: r.type, usage_count: Number(r.usage_count) }));
};