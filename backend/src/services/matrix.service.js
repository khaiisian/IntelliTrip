const { calculateDistance } = require('../utils/distance');
const orsService = require('./ors.service');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const TOP_K_NEIGHBORS = 5;

function formatCoord(lat, lng) {
    return `${lat.toFixed(6)},${lng.toFixed(6)}`;
}

function getUndirectedKey(a, b) {
    return a < b ? `${a}-${b}` : `${b}-${a}`;
}

function addRequiredPair(map, from, to, directedKey) {
    const fromKey = formatCoord(from.lat, from.lng);
    const toKey = formatCoord(to.lat, to.lng);
    const coordKey = getUndirectedKey(fromKey, toKey);

    const entry = map.get(coordKey) || { from, to, directedKeys: new Set() };
    entry.directedKeys.add(directedKey);
    map.set(coordKey, entry);
}

async function buildTravelMatrix(start, attractions, end) {
    const startNode = { id: 'start', lat: Number(start.lat), lng: Number(start.lng) };
    const endNode = { id: 'end', lat: Number(end.lat), lng: Number(end.lng) };
    const attractionNodes = attractions.map(a => ({
        id: a.attraction_id,
        lat: Number(a.latitude),
        lng: Number(a.longitude)
    }));

    const matrix = {};
    const coordPairCache = new Map();
    const requiredPairs = new Map();

    // always compute start -> each attraction
    for (const attraction of attractionNodes) {
        addRequiredPair(requiredPairs, startNode, attraction, `start-${attraction.id}`);
    }

    // always compute each attraction -> end
    for (const attraction of attractionNodes) {
        addRequiredPair(requiredPairs, attraction, endNode, `${attraction.id}-end`);
    }

    // compute start -> end for empty-route fallback
    addRequiredPair(requiredPairs, startNode, endNode, 'start-end');

    // compute top-K attraction-to-attraction neighbors per attraction
    for (const from of attractionNodes) {
        const neighbors = attractionNodes
            .filter(to => to.id !== from.id)
            .map(to => ({
                node: to,
                dist: calculateDistance(from.lat, from.lng, to.lat, to.lng)
            }))
            .sort((a, b) => a.dist - b.dist)
            .slice(0, TOP_K_NEIGHBORS);

        for (const neighbor of neighbors) {
            addRequiredPair(requiredPairs, from, neighbor.node, `${from.id}-${neighbor.node.id}`);
        }
    }

    for (const [coordKey, entry] of requiredPairs) {
        if (coordPairCache.has(coordKey)) {
            const cachedTime = coordPairCache.get(coordKey);
            for (const directedKey of entry.directedKeys) {
                matrix[directedKey] = cachedTime;
            }
            continue;
        }

        const { from, to } = entry;
        const dist = calculateDistance(from.lat, from.lng, to.lat, to.lng);

        let time;
        try {
            if (dist < 2) {
                time = Math.max(1, Math.ceil(dist * 2));
            } else {
                time = await orsService.getTravelTime(from, to);
            }
        } catch (err) {
            time = Math.max(1, Math.ceil(dist * 3));
        }

        coordPairCache.set(coordKey, time);
        for (const directedKey of entry.directedKeys) {
            matrix[directedKey] = time;
        }

    }

    return matrix;
}

module.exports = { buildTravelMatrix };