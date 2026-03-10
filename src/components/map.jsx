"use client"
import 'leaflet/dist/leaflet.css'
import { MapContainer, Marker, Popup, useMapEvents } from 'react-leaflet'
import MarkerClusterGroup from "react-leaflet-cluster";
import { MapLibreTileLayer } from './maplayer.jsx';
import { TileLayer } from 'react-leaflet/TileLayer'
import "../app/globals.css"


function ClickHandler({ onClick }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng)
    },
    
  })
  return null
}

function ReverseGeocode(lat, lng) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
    return fetch("api/reverse-geocode", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ "lat": 20, "lng": 20 }),
    })
}

export default function Map() {

    async function handleMapClick(lat, lng) {
         console.log(`Clicked at latitude: ${lat}, longitude: ${lng}`);
    }
    return (
        <MapContainer
            className="full-height-map"
            center={[38, 139.69222]}
            zoom={6}
            minZoom={3}
            maxZoom={19}
            maxBounds={[[-85.06, -180], [85.06, 180]]}
            scrollWheelZoom={true}>
            <MapLibreTileLayer
                attribution='&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
                url="https://tiles.stadiamaps.com/styles/stamen_toner_dark.json"
            />
            <ClickHandler onClick={handleMapClick} />
        </MapContainer>
    )
}