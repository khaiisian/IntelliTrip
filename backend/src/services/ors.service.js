const axios = require('axios');
const pLimit = require('p-limit').default;
const { calculateDistance } = require('../utils/distance');

const ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImQ2OGIwOTlkOWM0NWY3YjNjODRmNzYwNmVhNTQzOTk4OTkwZTE5ZDA0YzdmN2MwNDczOGZkNmE3IiwiaCI6Im11cm11cjY0In0=";
const ORS_BASE_URL = 'https://api.openrouteservice.org/v2/directions/driving-car';
const cache = new Map();
const pendingRequests = new Map();
const limit = pLimit(3); // max 2 concurrent ORS requests
let requestCount = 0; // for logging total requests
let fallbackCount = 0; // counts ORS failures that used fallback estimates
let skippedByLimit = 0; // counts route pairs skipped due to hard ORS call limit
const MAX_ORS_CALLS = 20; // hard limit for ORS requests (hybrid-only uses ORS for longer trips)

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function requestORS(start, end) {
    return axios.post(
        ORS_BASE_URL,
        {
            coordinates: [
                [Number(start.lng), Number(start.lat)],
                [Number(end.lng), Number(end.lat)]
            ]
        },
        {
            params: {
                api_key: ORS_API_KEY
            },
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
}

exports.getTravelTime = async (start, end) => {
    const key = `${start.lat.toFixed(4)},${start.lng.toFixed(4)}-${end.lat.toFixed(4)},${end.lng.toFixed(4)}`;
    if (cache.has(key)) return cache.get(key);
    if (pendingRequests.has(key)) return pendingRequests.get(key);

    const promise = limit(async () => {
        if (!ORS_API_KEY) {
            throw new Error('ORS_API_KEY is not configured.');
        }

        const dist = calculateDistance(start.lat, start.lng, end.lat, end.lng);
        if (requestCount >= MAX_ORS_CALLS) {
            skippedByLimit++;
            const fallbackMinutes = Math.max(1, Math.ceil(dist * 3));
            console.warn(`ORS call limit reached (${requestCount}/${MAX_ORS_CALLS}), using fallback estimate for ${key}: ${fallbackMinutes} min`);
            cache.set(key, fallbackMinutes);
            return fallbackMinutes;
        }

        try {
            let response;

            for (let attempt = 1; attempt <= 5; attempt++) {
                try {
                    response = await requestORS(start, end);
                    break;
                } catch (err) {
                    const status = err.response?.status;
                    const retryAfter = Number(err.response?.headers?.['retry-after']) || 0;

                    // REMOVED: Retry fallback for 429 (Rate Limit Hard Enforced)
                    // Soft recovery disabled - 429 now fails immediately due to hard limit

                    if (status === 404) {
                        throw new Error(`ORS route not found for coordinates: ${start.lat},${start.lng} to ${end.lat},${end.lng}`);
                    }

                    if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
                        throw new Error(`Network error: Unable to reach ORS API. Check internet connection and DNS settings. (${err.code})`);
                    }

                    throw err;
                }
            }

            if (!response) {
                throw new Error('ORS travel time lookup failed after retrying.');
            }

            requestCount++;
            if (requestCount % 5 === 0) {
                console.log(`ORS calls so far: ${requestCount}`);
            }
            console.log(`ORS request ${requestCount} successful for ${key}`);

            const route = response.data.routes[0];
            const durationSeconds = route.summary.duration;
            const minutes = Math.max(1, Math.ceil(durationSeconds / 60));

            cache.set(key, minutes);
            return minutes;
        } catch (err) {
            fallbackCount++;
            const fallbackMinutes = Math.max(1, Math.ceil(dist * 3));
            console.warn(`ORS fallback used for ${key}: ${fallbackMinutes} min`, err.message || err);
            cache.set(key, fallbackMinutes);
            return fallbackMinutes;
        }
    });

    pendingRequests.set(key, promise);
    try {
        return await promise;
    } finally {
        pendingRequests.delete(key);
    }
};

exports.getORSStats = () => ({ requestCount, fallbackCount, skippedByLimit });
exports.resetORSStats = () => {
    requestCount = 0;
    fallbackCount = 0;
    skippedByLimit = 0;
};
