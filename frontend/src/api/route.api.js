import polyline from '@mapbox/polyline';

const ORS_API_KEY = 'YOUR_API_KEY_HERE';

export const getRouteGeometry = async (coordinates) => {
    try {
        const response = await fetch(
            'https://api.openrouteservice.org/v2/directions/driving-car',
            {
                method: 'POST',
                headers: {
                    'Authorization': "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImQ2OGIwOTlkOWM0NWY3YjNjODRmNzYwNmVhNTQzOTk4OTkwZTE5ZDA0YzdmN2MwNDczOGZkNmE3IiwiaCI6Im11cm11cjY0In0=",
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    coordinates, // [lng, lat]
                }),
            }
        );

        const data = await response.json();

        if (!data.routes || data.routes.length === 0) {
            throw new Error('No route found');
        }

        const encoded = data.routes[0].geometry;

        // Decode to [lat, lng]
        const decoded = polyline.decode(encoded);

        return decoded;
    } catch (error) {
        console.error('ORS route error:', error);
        return null;
    }
};
