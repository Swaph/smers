import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { emergencyIcon, bodaIcon, tukTukIcon } from '../icons';

// --- CONSTANTS: LAIKIPIA / NANYUKI ---
const LAIKIPIA_CENTER = [0.0166, 37.0741];

const HOSPITALS = [
    { name: "Nanyuki Teaching & Referral", pos: [0.0160, 37.0760] },
    { name: "Nanyuki Cottage Hospital", pos: [0.0085, 37.0705] },
    { name: "Huruma Health Centre", pos: [0.0250, 37.0650] },
    { name: "Cedar Clinical Associates", pos: [0.0180, 37.0730] },
    { name: "Mary Immaculate Hospital", pos: [0.0120, 37.0800] }
];

const hospitalIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/4320/4320371.png',
    iconSize: [25, 25],
    iconAnchor: [12, 12]
});

// --- HELPER: FORCE MAP TO MOVE ---
function RecenterMap({ center }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center);
    }, [center, map]);
    return null;
}

function MapDashboard({ requests = [], riders = [], allResponders = [], showEmergencies = false, showUnits = false }) {

    // --- 1. ROBUST POSITION GETTER ---
    const getPosition = (item) => {
        if (!item) return null;

        // PRIORITY: Animated Position (from App.js loop)
        if (Array.isArray(item.position) && item.position.length === 2) {
            return item.position;
        }

        // FALLBACK: DB Columns
        if (item.lat && item.lng) return [parseFloat(item.lat), parseFloat(item.lng)];
        if (item.current_lat && item.current_lon) return [parseFloat(item.current_lat), parseFloat(item.current_lon)];
        if (item.latitude && item.longitude) return [parseFloat(item.latitude), parseFloat(item.longitude)];

        return null;
    };

    const getIcon = (type) => {
        if (!type) return bodaIcon;
        const normalizedType = type.toString().toLowerCase().replace('_', ' ');
        return normalizedType.includes('tuk') ? tukTukIcon : bodaIcon;
    };

    // --- 2. CRITICAL FIX: ID FILTERING ---
    const activeIds = new Set(riders.map(r => r.id || r.responder_id));

    const idleResponders = allResponders.filter(responder => {
        const rId = responder.id || responder.responder_id;
        return !activeIds.has(rId);
    });

    return (
        <MapContainer
            center={LAIKIPIA_CENTER}
            zoom={13}
            style={{ height: '100%', width: '100%', borderRadius: 'inherit' }}
            zoomControl={false}
        >
            <RecenterMap center={LAIKIPIA_CENTER} />

            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
            />

            {/* HOSPITALS */}
            {HOSPITALS.map((h, idx) => (
                <Marker key={`h-${idx}`} position={h.pos} icon={hospitalIcon}>
                    <Popup><strong>{h.name}</strong><br/>Medical Facility</Popup>
                </Marker>
            ))}

            {/* EMERGENCIES (Requests) */}
            {showEmergencies && requests
                .filter(r => r.status === 'Pending' || r.status === 'Dispatched')
                .map(request => {
                    const pos = getPosition(request);
                    if (!pos) return null;

                    return (
                        <Marker key={`req-${request.id}`} position={pos} icon={emergencyIcon}>
                            <Popup>
                                <strong>Patient:</strong> {request.patient_name}<br/>
                                <strong>Priority:</strong> {request.priority}<br/>
                                Status: {request.status}
                            </Popup>
                        </Marker>
                    );
                })}

            {/* UNITS (Responders) */}
            {showUnits && (
                <>
                    {/* A. ACTIVE RIDERS (Moving) - Render these LAST so they are on TOP */}
                    {riders.map(rider => {
                        const pos = getPosition(rider);
                        if (!pos) return null;

                        return (
                            <Marker
                                key={`active-${rider.id}`}
                                position={pos}
                                icon={getIcon(rider.type || rider.vehicle_type)}
                                zIndexOffset={9999} // <--- FORCE ON TOP
                            >
                                <Popup>
                                    <strong>{rider.name || rider.first_name}</strong><br/>
                                    Status: {rider.status}<br/>
                                    <span style={{color: 'blue'}}>▶ In Transit</span>
                                </Popup>
                            </Marker>
                        );
                    })}

                    {/* B. IDLE RESPONDERS (Static) */}
                    {idleResponders.map(responder => {
                        const pos = getPosition(responder);
                        if (!pos) return null;

                        return (
                            <Marker
                                key={`idle-${responder.id || responder.responder_id}`}
                                position={pos}
                                icon={getIcon(responder.type || responder.vehicle_type)}
                                opacity={0.6} // Make them slightly faded
                            >
                                <Popup>
                                    <strong>{responder.name || responder.first_name}</strong><br/>
                                    <span style={{color: 'green'}}>● Available</span>
                                </Popup>
                            </Marker>
                        );
                    })}
                </>
            )}
        </MapContainer>
    );
}

export default MapDashboard;