// --- 1. RANDOM DATA POOLS ---

const patientNames = [
    "Wanjiku Mwangi", "Nkirote Muriuki", "Naliaka Wafula", "Chebet Rono",
    "Fatuma Abdi", "Muthoni Kariuki", "Akoth Omondi", "Nyawira Githinji",
    "Kavata Mutua", "Amina Hussein", "Halima Yusuf", "Naisula Lesuuda",
    "Rehema Saidi", "Mary Wambui", "Esther Njoroge"
];

const symptoms = [
    // --- CRITICAL (Priority 5) ---
    "Post-partum hemorrhage with heavy bleeding reported",
    "Patient is having a seizure, suspecting eclampsia",
    "Patient is unconscious following a prolonged labour",
    "Newborn is not breathing or is turning blue",
    "Umbilical cord prolapse reported by a caregiver",
    "Severe abdominal pain with signs of uterine rupture",

    // --- HIGH (Priority 4) ---
    "Active labour, contractions are 2-3 minutes apart",
    "Water broke, with signs of meconium (dark green fluid)",
    "Signs of pre-eclampsia: severe headache and blurred vision",
    "Breech presentation reported by a midwife",

    // --- MEDIUM (Priority 3) ---
    "Early labour signs, contractions are irregular and more than 10 minutes apart",
    "Infant has a high fever and is refusing to feed",
    "Request for non-emergency transport to a post-natal clinic appointment"
];

// --- 2. REMOTE / SEMI-ARID LOCATIONS (The "Last Mile" Problem) ---
// These are outskirts of Nanyuki. Far enough to NEED a Tuktuk,
// but close enough to be on the map network.

const laikipiaLocations = [
    {
        name: "Nturukuma Area (Remote)",
        // Rough roads north-east of town
        road_points: [
            [0.0410, 37.1020], [0.0425, 37.1050], [0.0390, 37.0980]
        ]
    },
    {
        name: "Ichuga Village (Outskirts)",
        // South of the Equator, across the river
        road_points: [
            [-0.0020, 37.0620], [-0.0045, 37.0605], [-0.0010, 37.0650]
        ]
    },
    {
        name: "Sweetwaters / Brickwoods",
        // West of town, towards Ol Pejeta
        road_points: [
            [0.0120, 37.0450], [0.0100, 37.0400], [0.0150, 37.0420]
        ]
    },
    {
        name: "Munyaka Estate (Deep)",
        // Denser settlement but effectively far from main road
        road_points: [
            [0.0250, 37.0900], [0.0265, 37.0920], [0.0240, 37.0880]
        ]
    },
    {
        name: "Likii North (Informal Settlement)",
        // The far end of Likii, often difficult to access
        road_points: [
            [0.0280, 37.0620], [0.0300, 37.0600], [0.0270, 37.0640]
        ]
    },
    {
        name: "Kanyoni (Arid Zone)",
        // Northern dry area
        road_points: [
            [0.0350, 37.0750], [0.0360, 37.0780]
        ]
    },
    {
        name: "Ngenia Area",
        // Near the railway line, further out
        road_points: [
            [0.0050, 37.0550], [0.0040, 37.0500]
        ]
    }
];

// --- 3. HELPER FUNCTIONS ---

let lastId = 2000;

const assignPriority = (symptoms) => {
    const lowerCaseSymptoms = symptoms.toLowerCase();
    if (lowerCaseSymptoms.includes('bleeding') || lowerCaseSymptoms.includes('unconscious') || lowerCaseSymptoms.includes('seizure') || lowerCaseSymptoms.includes('rupture')) {
        return 'CRITICAL';
    } else if (lowerCaseSymptoms.includes('labour') || lowerCaseSymptoms.includes('water broke') || lowerCaseSymptoms.includes('breech')) {
        return 'HIGH';
    }
    return 'MEDIUM';
};

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// --- 4. THE GENERATOR ---

export const generateNewRequest = () => {
    lastId++;
    const selectedLocationArea = getRandomItem(laikipiaLocations);
    const randomSymptoms = getRandomItem(symptoms);

    // Pick a specific "On-Road" coordinate from the array
    const exactRoadPoint = getRandomItem(selectedLocationArea.road_points);

    return {
        id: lastId,
        priority: assignPriority(randomSymptoms),
        status: 'Pending',
        symptoms: randomSymptoms,
        location: selectedLocationArea.name,
        patient_name: getRandomItem(patientNames),
        assigned_responder: null,
        created_at: new Date().toISOString(),

        // EXACT ROAD COORDINATES (Far from hospital, snapped to road)
        position: exactRoadPoint,
        latitude: exactRoadPoint[0],
        longitude: exactRoadPoint[1]
    };
};