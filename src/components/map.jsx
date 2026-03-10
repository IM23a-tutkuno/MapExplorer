"use client"
import 'leaflet/dist/leaflet.css'
import { MapContainer, Marker, Popup, useMapEvents } from 'react-leaflet'
import MarkerClusterGroup from "react-leaflet-cluster";
import { MapLibreTileLayer } from './maplayer.jsx';
import { TileLayer } from 'react-leaflet/TileLayer'
import "../app/globals.css"
import { useEffect, useState } from 'react';


function ClickHandler({ onLocationFound }) {
    useMapEvents({
        async click(e) {
            const { lat, lng } = e.latlng
            const result = await ReverseGeocode(lat, lng)

            onLocationFound({
                lat,
                lng,
                ...result,
            })
        },
    })

    return null
}

async function ReverseGeocode(lat, lng) {
    console.log(lat, lng)

    const response = await fetch("api/reverse-geocode", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ "lat": lat, "lng": lng }),
    })

    const { data } = await response.json()
    return data
}

export default function Map({ onLocationFound }) {
    const [selectedPlace, setSelectedPlace] = useState(null)



    return (
        <>
            <div className='w-full h-40 bg-white rounded-lg mb-4 p-2 border-solid border-2 text-sm flex flex-row gap-4'>
                <div></div>
                {selectedPlace && (
                    <>
                        <div>
                            <div className=' font-bold mb-2 flex flex-row gap-2'>Name: <div className='font-normal'>{selectedPlace.name}</div></div>
                            <div className='font-bold mb-2 flex flex-row gap-2'>Strasse: <div className='font-normal'>{selectedPlace.street}</div></div>
                            <div className=' font-bold mb-2 flex flex-row gap-2'>Hausnummer: <div className='font-normal'>{selectedPlace.number}</div></div>
                            <div className=' font-bold mb-2 flex flex-row gap-2'>PLZ: <div className='font-normal'>{selectedPlace.plz}</div></div>
                            <div className=' font-bold mb-2 flex flex-row gap-2'>Stadt: <div className='font-normal'>{selectedPlace.city}</div></div>

                        </div>
                        <div>
                            <div className=' font-bold mb-2 flex flex-row gap-2'>State: <div className='font-normal'>{selectedPlace.state}</div></div>
                            <div className=' font-bold mb-2 flex flex-row gap-2'>Land: <div className='font-normal'>{selectedPlace.country}</div></div>
                            <div className=' font-bold mb-2 flex flex-row gap-2'>Bezirk: <div className='font-normal'>{selectedPlace.district}</div></div>
                            <div className=' font-bold mb-2 flex flex-row gap-2'>Kategorie: <div className='font-normal'>{selectedPlace?.category}</div></div>

                        </div>
                    </>
                )}
            </div>
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
                <ClickHandler onLocationFound={setSelectedPlace} />
            </MapContainer>
        </>
    )
}