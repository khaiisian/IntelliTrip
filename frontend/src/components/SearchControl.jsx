import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import "leaflet-control-geocoder";

function SearchControl() {
    const map = useMap();

    useEffect(() => {
        const geocoder = L.Control.geocoder({
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