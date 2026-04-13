const express = require('express');
const cors = require('cors');
const db = require('./db'); // Import the database connection
require('dotenv').config();

const app = express();

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

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

    // Map priority string to integer
    const priorityMap = { 'CRITICAL': 5, 'HIGH': 4, 'MEDIUM': 3, 'LOW': 2, 'MINOR': 1 };
    let numericScore = 3;
    if (typeof priority === 'number') {
        numericScore = priority;
    } else if (priority) {
        numericScore = priorityMap[priority.toUpperCase()] || 3;
    }

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
            latitude,
            longitude
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

    try {
        const query = `
            UPDATE incidents
            SET status = 'Dispatched', assigned_responder_id = $1
            WHERE incident_id = $2
                RETURNING *;
        `;
        await db.query(query, [responder_id, incident_id]);
        console.log(`🚁 Dispatch: Incident ${incident_id} -> Unit ${responder_id}`);
        res.json({ success: true });
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
    const isActive = status === 'Active';

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
            phone_number,
            location,
            id
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
    try {
        const query = 'DELETE FROM users WHERE user_id = $1 RETURNING user_id';
        const { rows } = await db.query(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        console.log(`User Deleted: ID ${id}`);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ error: 'Server error deleting user' });
    }
});

// ==========================================
// START SERVER
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Mode: Laikipia Simulation Active`);
});