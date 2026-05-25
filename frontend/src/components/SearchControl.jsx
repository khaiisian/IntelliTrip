import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import "leaflet-control-geocoder";

function SearchControl() {
    const map = useMap();

    useEffect(() => {
        // Configure Nominatim geocoder to restrict results to Bagan using viewbox + bounded
        const nominatim = L.Control.Geocoder && L.Control.Geocoder.nominatim
            ? L.Control.Geocoder.nominatim({
                geocodingQueryParams: {
                    // viewbox: lon_min,lat_max,lon_max,lat_min
                    viewbox: '94.70,21.30,95.05,20.95',
                    bounded: 1
                }
            })
            : null;

        const geocoder = L.Control.geocoder({
            geocoder: nominatim,
            defaultMarkGeocode: true
        }).addTo(map);

        geocoder.on("markgeocode", function (e) {
            const latlng = e.geocode.center;
            map.setView(latlng, 15);
        });

        return () => map.removeControl(geocoder);
    }, [map]);

    return null;
}

export default SearchControl;