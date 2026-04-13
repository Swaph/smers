const express = require('express');
const cors = require('cors');
const db = require('./db'); // Import the database connection
require('dotenv').config();

const app = express();

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const PRIORITY_MAP = { CRITICAL: 5, HIGH: 4, MEDIUM: 3, LOW: 2, MINOR: 1 };
const ALLOWED_ROLES = new Set(['admin', 'dispatcher', 'auditor']);

const isFiniteNumber = (value) => Number.isFinite(Number(value));
const normalizePriority = (priority) => {
    if (typeof priority === 'number') {
        const clamped = Math.max(1, Math.min(5, priority));
        return Math.round(clamped);
    }

    if (typeof priority === 'string') {
        const asNumber = Number(priority);
        if (Number.isFinite(asNumber)) {
            const clamped = Math.max(1, Math.min(5, asNumber));
            return Math.round(clamped);
        }

        return PRIORITY_MAP[priority.toUpperCase()] || 3;
    }

    return 3;
};

const parsePositiveInt = (value) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const badRequest = (res, message, details) =>
    res.status(400).json({ error: message, ...(details ? { details } : {}) });

const validateCoordinates = (latitude, longitude) => {
    const lat = Number(latitude);
    const lng = Number(longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return { valid: false, message: 'Latitude and longitude must be valid numbers.' };
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return { valid: false, message: 'Latitude/longitude out of valid range.' };
    }

    return { valid: true, lat, lng };
};

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'smers-backend',
        uptime_seconds: Math.round(process.uptime()),
        timestamp: new Date().toISOString(),
    });
});

// ==========================================
// 1. SYSTEM HEALTH CHECK
// ==========================================
app.get('/api/test-db', async (req, res) => {
    try {
        const result = await db.query('SELECT NOW()');
        res.json({ message: '✅ Database Connected!', time: result.rows[0].now });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

// ==========================================
// 2. FLEET MANAGEMENT (Responders)
// ==========================================
app.get('/api/responders', async (req, res) => {
    try {
        const query = `
            SELECT
                responder_id AS id,
                first_name AS name,
                phone_number,
                vehicle_type AS type,
                license_plate,
                current_lat::float AS lat,
                current_lon::float AS lng,
                current_lat::float AS latitude,
                current_lon::float AS longitude,
                is_active
            FROM responders
            WHERE is_active = TRUE
              AND current_lat IS NOT NULL
        `;
        const { rows } = await db.query(query);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching responders:', err);
        res.status(500).json({ error: 'Server error fetching responders' });
    }
});

// ==========================================
// 3. INCIDENT MANAGEMENT (Requests)
// ==========================================

// GET All Active Requests
app.get('/api/requests', async (req, res) => {
    try {
        const query = `
            SELECT
                incident_id AS id,
                patient_name,
                patient_condition AS symptoms,
                triage_score AS priority,
                pickup_lat::float AS latitude,
                pickup_lon::float AS longitude,
                location_landmark AS location,
                caller_phone AS contact_number,
                status,
                created_at
            FROM incidents
            ORDER BY created_at DESC
        `;
        const { rows } = await db.query(query);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching requests:', err);
        res.status(500).json({ error: 'Server error fetching requests' });
    }
});

// CREATE New Request (Triage)
app.post('/api/requests', async (req, res) => {
    const {
        patient_name,
        contact_number,
        location_name,
        symptoms,
        priority,
        latitude,
        longitude
    } = req.body;

    if (!contact_number || !location_name || !symptoms) {
        return badRequest(res, 'contact_number, location_name and symptoms are required.');
    }

    const coordCheck = validateCoordinates(latitude, longitude);
    if (!coordCheck.valid) {
        return badRequest(res, coordCheck.message);
    }

    const numericScore = normalizePriority(priority);

    try {
        const query = `
            INSERT INTO incidents (
                patient_name, caller_phone, location_landmark,
                patient_condition, triage_score, pickup_lat, pickup_lon, status
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'Pending')
                RETURNING incident_id AS id, status, created_at;
        `;

        const values = [
            patient_name || 'Unknown Patient',
            contact_number,
            location_name,
            symptoms,
            numericScore,
            coordCheck.lat,
            coordCheck.lng
        ];

        const { rows } = await db.query(query, values);
        console.log(`✅ New Alert: ID ${rows[0].id} (Priority: ${numericScore})`);
        res.status(201).json(rows[0]);

    } catch (err) {
        console.error('Error creating request:', err);
        res.status(500).json({ error: 'Server error creating request' });
    }
});

// ASSIGN Responder (Dispatch)
app.put('/api/requests/:id/assign', async (req, res) => {
    const { responder_id } = req.body;
    const incident_id = req.params.id;

    const parsedIncidentId = parsePositiveInt(incident_id);
    const parsedResponderId = parsePositiveInt(responder_id);

    if (!parsedIncidentId || !parsedResponderId) {
        return badRequest(res, 'Valid incident id and responder_id are required.');
    }

    try {
        const responderCheck = await db.query(
            'SELECT responder_id FROM responders WHERE responder_id = $1 AND is_active = TRUE',
            [parsedResponderId]
        );

        if (responderCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Responder not found or inactive.' });
        }

        const query = `
            UPDATE incidents
            SET status = 'Dispatched', assigned_responder_id = $1
            WHERE incident_id = $2
                RETURNING *;
        `;
        const result = await db.query(query, [parsedResponderId, parsedIncidentId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Incident not found.' });
        }

        console.log(`Dispatch: Incident ${parsedIncidentId} -> Unit ${parsedResponderId}`);
        res.json({ success: true, incident_id: parsedIncidentId, responder_id: parsedResponderId });
    } catch (err) {
        console.error('Dispatch error:', err);
        res.status(500).json({ error: 'Dispatch failed' });
    }
});

// ==========================================
// 4. REPORTS & ANALYTICS
// ==========================================

// GET Completed Missions
app.get('/api/reports/completed', async (req, res) => {
    try {
        const query = `
            SELECT
                i.incident_id AS id,
                i.patient_name,
                i.patient_condition AS symptoms,
                i.triage_score AS priority,
                i.status,
                i.created_at,
                r.first_name AS assigned_responder,
                r.vehicle_type,
                p.amount_KES AS cost,
                p.status AS payment_status
            FROM incidents i
                     LEFT JOIN responders r ON i.assigned_responder_id = r.responder_id
                     LEFT JOIN payment_logs p ON i.incident_id = p.incident_id
            WHERE i.status = 'Completed' OR i.status = 'Complete' OR i.status = 'Cancelled'
            ORDER BY i.created_at DESC
        `;
        const { rows } = await db.query(query);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching reports:', err);
        res.status(500).json({ error: 'Server error fetching reports' });
    }
});

// GET Payment Logs
app.get('/api/payments', async (req, res) => {
    try {
        const query = `
            SELECT
                p.payment_id,
                p.amount_KES,
                p.status,
                p.transaction_date,
                r.first_name AS responder_name,
                r.phone_number
            FROM payment_logs p
                     JOIN responders r ON p.responder_id = r.responder_id
            ORDER BY p.transaction_date DESC
        `;
        const { rows } = await db.query(query);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching payments:', err);
        res.status(500).json({ error: 'Server error fetching payments' });
    }
});

// ==========================================
// 5. USER MANAGEMENT (Admin)
// ==========================================

// GET Users
app.get('/api/users', async (req, res) => {
    try {
        // We select 'user_id' but alias it as 'id' to help the frontend
        const { rows } = await db.query(`
            SELECT user_id, user_id AS id, full_name, username, role, 
            CASE WHEN is_active THEN 'Active' ELSE 'Inactive' END as status 
            FROM users 
            ORDER BY user_id ASC
        `);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Server error fetching users' });
    }
});

// CREATE User
app.post('/api/users', async (req, res) => {
    const { full_name, role, username } = req.body;

    if (!full_name || !username || !role) {
        return badRequest(res, 'full_name, username and role are required.');
    }

    if (!ALLOWED_ROLES.has(String(role).toLowerCase())) {
        return badRequest(res, 'Invalid role. Allowed roles: admin, dispatcher, auditor.');
    }

    try {
        const query = `
            INSERT INTO users (full_name, role, username, password_hash, is_active)
            VALUES ($1, $2, $3, 'default_password', TRUE)
                RETURNING user_id, full_name, role, username;
        `;
        const { rows } = await db.query(query, [full_name, role, username]);
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ error: 'Server error creating user' });
    }
});

// UPDATE User
app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    // Destructure all possible fields
    const { full_name, username, role, status, phone_number, location } = req.body;

    // Map status string "Active"/"Inactive" to boolean
    const parsedUserId = parsePositiveInt(id);
    if (!parsedUserId) {
        return badRequest(res, 'Invalid user id.');
    }

    if (!full_name || !username || !role) {
        return badRequest(res, 'full_name, username and role are required.');
    }

    if (!ALLOWED_ROLES.has(String(role).toLowerCase())) {
        return badRequest(res, 'Invalid role. Allowed roles: admin, dispatcher, auditor.');
    }

    const normalizedStatus = String(status || 'Active').toLowerCase();
    if (!['active', 'inactive'].includes(normalizedStatus)) {
        return badRequest(res, 'status must be Active or Inactive.');
    }

    const isActive = normalizedStatus === 'active';

    try {
        const query = `
            UPDATE users
            SET full_name = $1,
                username = $2,
                role = $3,
                is_active = $4,
                phone_number = $5,
                location = $6
            WHERE user_id = $7
                RETURNING *;
        `;

        // Pass the new values to the query
        const { rows } = await db.query(query, [
            full_name,
            username,
            role,
            isActive,
            phone_number || null,
            location || null,
            parsedUserId
        ]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        console.log(`📝 User Profile Updated: ${rows[0].full_name}`);
        res.json(rows[0]);
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ error: 'Server error updating user' });
    }
});

// DELETE User
app.delete('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const parsedUserId = parsePositiveInt(id);

    if (!parsedUserId) {
        return badRequest(res, 'Invalid user id.');
    }

    try {
        const query = 'DELETE FROM users WHERE user_id = $1 RETURNING user_id';
        const { rows } = await db.query(query, [parsedUserId]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        console.log(`User Deleted: ID ${parsedUserId}`);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ error: 'Server error deleting user' });
    }
});

// 404 fallback for unknown API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'API route not found.' });
});

app.use((err, req, res, next) => {
    console.error('Unhandled server error:', err);
    res.status(500).json({ error: 'Unexpected server error' });
});

// ==========================================
// START SERVER
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Mode: Laikipia Simulation Active`);
});