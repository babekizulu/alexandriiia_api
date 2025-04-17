// db.js
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,   // <-- your full URL here
  ssl: { rejectUnauthorized: false }             // required when connecting to Render’s external DB
});

module.exports = pool;
