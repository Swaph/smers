import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

// --- IMPORTS ---
import { generateNewRequest } from './mockData';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import TriageForm from './pages/TriageForm';
import AdminDashboard from './pages/AdminDashboard';
import DispatchDashboard from './pages/DispatchDashboard';
import UnitsView from './pages/UnitsView';
import ProfileView from './pages/ProfileView';
import MainDashboardView from './pages/MainDashboardView';
import UserManagementView from './pages/UserManagementView';

// --- CONSTANTS ---
const API_URL = 'http://localhost:5000/api';

const hospitals = [
    { name: "Nanyuki Teaching & Referral Hospital", position: [0.0160, 37.0760] },
    { name: "Nanyuki Cottage Hospital", position: [0.0085, 37.0705] },
    { name: "Huruma Health Centre", position: [0.0250, 37.0650] },
    { name: "Cedar Clinical Associates", position: [0.0180, 37.0730] },
    { name: "Mary Immaculate Hospital", position: [0.0120, 37.0800] }
];

// --- MATH HELPERS ---
const calculateDistance = (pos1, pos2) => {
    if (!pos1 || !pos2) return 9999;
    const [lat1, lon1] = pos1;
    const [lat2, lon2] = pos2;
    return Math.sqrt(Math.pow(lat1 - lat2, 2) + Math.pow(lon1 - lon2, 2));
};

const findClosestHospital = (patientPos) => {
    return hospitals.reduce((prev, curr) => {
        const prevDist = calculateDistance(patientPos, prev.position);
        const currDist = calculateDistance(patientPos, curr.position);
        return prevDist < currDist ? prev : curr;
    });
};

const generateKenyanPhone = () => `07${Math.floor(10000000 + Math.random() * 90000000)}`;

// --- HYBRID ROUTING ENGINE
const fetchRoute = async (start, end) => {
    const startLng = start[1]; const startLat = start[0];
    const endLng = end[1]; const endLat = end[0];


    try {
        const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;


        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1500);

        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            if (data.routes && data.routes[0]) {
                return data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
            }
        }
    } catch (e) {
        // console.warn("OSRM unavailable, switching to Simulation Mode.");
    }


    const path = [];
    const steps = 8;

    for (let i = 0; i <= steps; i++) {
        const ratio = i / steps;
        let lat = startLat + (endLat - startLat) * ratio;
        let lng = startLng + (endLng - startLng) * ratio;

        if (i > 0 && i < steps) {
            lat += (Math.random() - 0.5) * 0.0015;
            lng += (Math.random() - 0.5) * 0.0015;
        }
        path.push([lat, lng]);
    }
    return path;
};

function App() {
    // --- STATE ---
    const [mode, setMode] = useState('light');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState('');

    // Updated Profile State with ID:1 to match DB
    const [userProfile, setUserProfile] = useState({
        id: 1,
        name: "Jane Doe",
        email: "j.doe@smers.co.ke",
        role: "dispatcher",
        mobile: "0712345678",
        location: "Nanyuki HQ"
    });

    const [requests, setRequests] = useState([]);
    const [allResponders, setAllResponders] = useState([]);
    const [riders, setRiders] = useState([]); // ACTIVE RIDERS
    const [completedMissions, setCompletedMissions] = useState([]);
    const [showCompleted, setShowCompleted] = useState(false);
    const [newCallAlert, setNewCallAlert] = useState(false);

    const intervalRef = useRef(null);
    const alertTimeoutRef = useRef(null);
    const dispatchIntervalRef = useRef(null);

    // --- INITIAL FETCH ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Responders
                const respResponse = await fetch(`${API_URL}/responders`);
                if (!respResponse.ok) throw new Error("Failed to fetch responders");
                const respData = await respResponse.json();

                // Safe mapping (check if array)
                const formattedResponders = Array.isArray(respData) ? respData.map(r => ({
                    ...r,
                    position: [parseFloat(r.lat || r.current_lat || 0.0166), parseFloat(r.lng || r.current_lon || 37.0741)]
                })) : [];
                setAllResponders(formattedResponders);

                // Fetch Requests
                const reqResponse = await fetch(`${API_URL}/requests`);
                if (!reqResponse.ok) throw new Error("Failed to fetch requests");
                const reqData = await reqResponse.json();

                const formattedRequests = Array.isArray(reqData) ? reqData.map(r => ({
                    ...r,
                    position: [parseFloat(r.latitude || r.pickup_lat), parseFloat(r.longitude || r.pickup_lon)]
                })) : [];
                setRequests(formattedRequests);
            } catch (error) { console.error("Error fetching data:", error); }
        };
        fetchData();
    }, []);

    const colorMode = useMemo(() => ({ toggleColorMode: () => setMode((prev) => (prev === 'light' ? 'dark' : 'light')), }), []);
    const theme = useMemo(() => createTheme({
        palette: {
            mode,
            primary: { main: '#192A56' },
            secondary: { main: '#4CAF50' },
            error: { main: '#D32F2F' },
            background: { default: mode === 'light' ? '#F4F6F8' : '#121212', paper: mode === 'light' ? '#ffffff' : '#1e1e1e' },
        },
        typography: { fontFamily: 'Inter, sans-serif' }
    }), [mode]);

    // --- 1. GENERATOR ---
    useEffect(() => {
        const scheduleNextAlert = () => {
            const randomDelay = Math.floor(Math.random() * (45000 - 8000 + 1)) + 8000;
            alertTimeoutRef.current = setTimeout(() => {
                const newJob = generateNewRequest();
                addRequest(newJob);
                scheduleNextAlert();
            }, randomDelay);
        };
        scheduleNextAlert();
        return () => clearTimeout(alertTimeoutRef.current);
    }, []);

    const addRequest = async (newRequest) => {
        setRequests(prev => [newRequest, ...prev]);
        setNewCallAlert(true);
        try {
            await fetch(`${API_URL}/requests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contact_number: generateKenyanPhone(),
                    location_name: newRequest.location,
                    symptoms: newRequest.symptoms,
                    priority: newRequest.priority,
                    patient_name: newRequest.patient_name,
                    latitude: newRequest.position[0],
                    longitude: newRequest.position[1]
                })
            });
        } catch (error) { console.error("Failed to save request:", error); }
    };

    // --- 2. DISPATCH ENGINE ---
    useEffect(() => {
        const processDispatchQueue = async () => {
            const pendingRequests = requests.filter(r => r.status === 'Pending');
            const busyIds = riders.map(r => r.id);
            const availableResponders = allResponders.filter(r => !busyIds.includes(r.id));

            if (pendingRequests.length === 0 || availableResponders.length === 0) return;

            const batch = pendingRequests.slice(0, 3);

            for (const request of batch) {
                const currentBusyIds = riders.map(r => r.id);
                const currentAvailable = allResponders.filter(r => !currentBusyIds.includes(r.id));
                if (currentAvailable.length === 0) break;

                const bestResponder = currentAvailable.reduce((prev, curr) => {
                    const prevDist = calculateDistance(prev.position, request.position);
                    const currDist = calculateDistance(curr.position, request.position);
                    return (prevDist < currDist) ? prev : curr;
                });

                // Update Request Status
                setRequests(prev => prev.map(req =>
                    String(req.id) === String(request.id) ? { ...req, status: 'Dispatched', assigned_responder: bestResponder.id } : req
                ));

                // Add to Riders Immediately (Status: Loading Path)
                const initialPath = await fetchRoute(bestResponder.position, request.position);

                setRiders(prev => [
                    ...prev,
                    {
                        ...bestResponder,
                        missionId: request.id,
                        status: 'En-route to Patient',
                        destination: request.position,
                        routePath: initialPath,
                        pathIndex: 0
                    }
                ]);

                // Sync to DB
                try {
                    await fetch(`${API_URL}/requests/${request.id}/assign`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ responder_id: bestResponder.id })
                    });
                } catch (e) { console.error("Sync failed", e); }

                await new Promise(resolve => setTimeout(resolve, 500));
            }
        };

        dispatchIntervalRef.current = setInterval(processDispatchQueue, 3000);
        return () => clearInterval(dispatchIntervalRef.current);
    }, [requests, riders, allResponders]);


    // --- 3. MOVEMENT ENGINE (20 FPS Game Loop) ---
    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setRiders(currentRiders => {
                if (currentRiders.length === 0) return currentRiders;

                return currentRiders.map(rider => {

                    // --- A. CHECK ARRIVAL AT FINAL DESTINATION ---
                    const distToDest = calculateDistance(rider.position, rider.destination);
                    const ARRIVAL_THRESHOLD = 0.0005;

                    if (distToDest < ARRIVAL_THRESHOLD) {
                        // PHASE 1: REACHED PATIENT
                        if (rider.status === 'En-route to Patient') {
                            const bestHospital = findClosestHospital(rider.position);

                            // --- FIX: USE STRING COMPARISON FOR IDs ---
                            setRequests(prev => prev.map(r =>
                                String(r.id) === String(rider.missionId)
                                    ? { ...r, status: 'Transporting to Hospital', destination: bestHospital.name }
                                    : r
                            ));

                            // Async: Get path to hospital
                            fetchRoute(rider.position, bestHospital.position).then(path => {
                                setRiders(curr => curr.map(r => String(r.id) === String(rider.id) ? { ...r, routePath: path, pathIndex: 0 } : r));
                            });

                            return {
                                ...rider,
                                status: 'Transporting to Hospital',
                                destination: bestHospital.position,
                                routePath: [],
                                pathIndex: 0
                            };
                        }
                        // PHASE 2: REACHED HOSPITAL
                        else if (rider.status === 'Transporting to Hospital') {
                            // Mission Complete
                            setRequests(prev => {
                                // --- FIX: USE STRING COMPARISON HERE TOO ---
                                const req = prev.find(r => String(r.id) === String(rider.missionId));
                                if (req) {
                                    setCompletedMissions(h => [{ ...req, status: 'Completed', cost: 450 }, ...h]);
                                    return prev.filter(r => String(r.id) !== String(rider.missionId));
                                }
                                return prev;
                            });
                            return null; // Remove from map
                        }
                    }

                    // --- B. MOVEMENT LOGIC (Standard) ---
                    let targetPoint = rider.destination;
                    let nextIndex = rider.pathIndex || 0;

                    if (Array.isArray(rider.routePath) && rider.routePath.length > 0) {
                        if (nextIndex < rider.routePath.length) {
                            targetPoint = rider.routePath[nextIndex];
                        } else {
                            targetPoint = rider.destination;
                        }
                    }

                    // Calculate Heading
                    const [currentLat, currentLng] = rider.position;
                    const [targetLat, targetLng] = targetPoint;
                    const deltaLat = targetLat - currentLat;
                    const deltaLng = targetLng - currentLng;
                    const angle = Math.atan2(deltaLat, deltaLng);
                    const speed = 0.0002;
                    const moveLat = currentLat + speed * Math.sin(angle);
                    const moveLng = currentLng + speed * Math.cos(angle);
                    const distToTarget = Math.sqrt(Math.pow(deltaLat, 2) + Math.pow(deltaLng, 2));

                    if (distToTarget < speed) {
                        return {
                            ...rider,
                            position: targetPoint,
                            pathIndex: nextIndex + 1
                        };
                    }
                    return { ...rider, position: [moveLat, moveLng] };

                }).filter(Boolean); // Remove completed riders
            });
        }, 50);

        return () => clearInterval(intervalRef.current);
    }, []);

    // --- HANDLERS ---
    const handleGenerateAlert = () => { addRequest(generateNewRequest()); };
    const handleLogin = (role) => { setIsAuthenticated(true); setUserRole(role); };
    const handleUpdateProfile = (data) => setUserProfile(prev => ({ ...prev, ...data }));
    const handleDispatch = (id) => console.log("Dispatch:", id);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
                <Route path="/app" element={ isAuthenticated ? <Layout newCallAlert={newCallAlert} clearCallAlert={() => setNewCallAlert(false)} /> : <Navigate to="/login" /> }>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="triage-form" element={<TriageForm addRequest={addRequest} />} />
                    <Route path="admin" element={
                        userRole === 'admin' ?
                            <AdminDashboard requests={requests} completedMissions={completedMissions} allResponders={allResponders} />
                            : <Navigate to="/app/dashboard" />
                    } />
                    <Route path="dashboard">
                        <Route index element={<MainDashboardView requests={requests} riders={riders} allResponders={allResponders} />} />
                        <Route path="jobs" element={<DispatchDashboard requests={requests} riders={riders} onDispatch={handleDispatch} handleGenerateAlert={handleGenerateAlert} completedMissions={completedMissions} showCompleted={showCompleted} setShowCompleted={setShowCompleted} />} />
                        <Route path="units" element={<UnitsView riders={riders} allResponders={allResponders} />} />
                        <Route path="profile" element={<ProfileView userProfile={userProfile} onUpdateProfile={handleUpdateProfile} currentTheme={mode} onToggleTheme={colorMode.toggleColorMode} /> } />
                        <Route path="users" element={ userRole === 'admin' ? <UserManagementView /> : <Navigate to="/app/dashboard" />} />
                    </Route>
                </Route>
            </Routes>
        </ThemeProvider>
    );
}

export default App;