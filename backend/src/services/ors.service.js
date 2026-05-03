const axios = require('axios');
const pLimit = require('p-limit').default;
const { calculateDistance } = require('../utils/distance');

const ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImQ2OGIwOTlkOWM0NWY3YjNjODRmNzYwNmVhNTQzOTk4OTkwZTE5ZDA0YzdmN2MwNDczOGZkNmE3IiwiaCI6Im11cm11cjY0In0=";
const ORS_BASE_URL = 'https://api.openrouteservice.org/v2/directions/driving-car';
const cache = new Map();
const pendingRequests = new Map();
const limit = pLimit(2); // max 2 concurrent ORS requests
let requestCount = 0; // for logging total requests

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

        let response;

        for (let attempt = 1; attempt <= 5; attempt++) {
            try {
                response = await requestORS(start, end);
                break;
            } catch (err) {
                const status = err.response?.status;
                const retryAfter = Number(err.response?.headers?.['retry-after']) || 0;

                if (status === 429 && attempt < 5) {
                    const waitMs = retryAfter > 0 ? retryAfter * 1000 : 2000 * (2 ** (attempt - 1));
                    console.warn(`ORS 429, retrying after ${waitMs}ms (attempt ${attempt})`);
                    await sleep(waitMs);
                    continue;
                }

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
        console.log(`ORS request ${requestCount} successful for ${key}`);

        const route = response.data.routes[0];
        const durationSeconds = route.summary.duration;
        const minutes = Math.max(1, Math.ceil(durationSeconds / 60));

        cache.set(key, minutes);
        return minutes;
    });

    pendingRequests.set(key, promise);
    try {
        return await promise;
    } finally {
        pendingRequests.delete(key);
    }
};
