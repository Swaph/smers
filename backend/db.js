const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

// Test the connection on startup
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error acquiring client', err.stack);
    }
    console.log(' Connected to Neon PostgreSQL Database successfully!');
    release();
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};