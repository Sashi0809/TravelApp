import React, {useState,useEffect} from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
delete L.Icon.Default.prototype._getIconUrl;
import api from "../utils/api";

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function MapClickHandler({onMapClick}){
    useMapEvents({
        click(e){
            onMapClick(e.latlng);
        },
    });
    return null;
}

function RecenterMap({position}){
    const map= useMap();

    useEffect(()=>{
        map.setView(position,12);
    },[position,map]);

    return null;
}

const MapPage = ()=>{
    const [position,setPosition] = useState([20.5937, 78.9629]);
    const [selectedPlace,setSelectedPlace]= useState(null);

    const handleMapClick = async (latlng) => {
       const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`
            );

            const data = await response.json();
            const address = data.address || {};
            // Prefer city, town, village, or state. Fallback to the first part of display_name
            const shortName = address.city || address.town || address.village || address.state || address.country || (data.display_name ? data.display_name.split(",")[0] : "Unknown Location");

            setSelectedPlace({
                lat: latlng.lat,
                lng: latlng.lng,
                name: shortName,
            });
    };

    useEffect(()=>{
        navigator.geolocation.getCurrentPosition(
            (pos)=>{
                setPosition([
                    pos.coords.latitude,
                    pos.coords.longitude
                ])
            },
            (err)=>{
                console.log(err);
            }
        )
    },[]);

    const addToBucketList = async ()=>{
         try {
            await api.post("/api/bucketlist", {
            name: selectedPlace.name,
            latitude: selectedPlace.lat,
            longitude: selectedPlace.lng,
            });

            alert("Added to bucket list!");
        } catch (err) {
            console.error(err);
            alert("Failed to add place");
        }
    }

    return(
        <div style={{ height: "100vh", width: "100%" }}>
            <MapContainer
            center={position}
            zoom={6}
            style={{ height: "100%", width: "100%" }}
            >
            <RecenterMap position={position} />
            <MapClickHandler onMapClick={handleMapClick} />
            <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position}>
                <Popup>You are here 📍</Popup>
            </Marker>
                {selectedPlace && (
                    <Marker position={[selectedPlace.lat, selectedPlace.lng]}>
                        <Popup>
                        <div>
                            <p>Selected Place</p>
                            <div>
                                <p>{selectedPlace.name}</p>

                                    <button onClick={addToBucketList}>
                                        Add to Bucket List
                                    </button>
                            </div>
                        </div>
                        </Popup>
                    </Marker>
                    )}
            

            </MapContainer>
        </div>
    )
}

export default MapPage;