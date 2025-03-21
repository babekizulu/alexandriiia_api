require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Create inventions table if it doesn't exist
const createTableQuery = `
CREATE TABLE IF NOT EXISTS inventions (
    id SERIAL PRIMARY KEY,
    contributor TEXT,
    date_invented DATE,
    invention_name TEXT NOT NULL,
    invention_type TEXT,
    dimensions JSONB,
    iteration INTEGER,
    iteration_of INTEGER REFERENCES inventions(id),
    materials TEXT[],
    inventor TEXT,
    research_groups TEXT[],
    model TEXT,
    model_image TEXT,
    regions TEXT[],
    number_of_corroborative_sources INTEGER,
    source_ids TEXT[],
    source_page_references TEXT[],
    primary_source_ids TEXT[],
    ancient BOOLEAN,
    modern BOOLEAN,
    multi_regional BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`;

// Initialize database
pool.query(createTableQuery, (err) => {
    if (err) {
        console.error('Error creating table:', err);
    } else {
        console.log('Database initialized successfully');
    }
});

// POST endpoint to create a new invention
app.post('/api/inventions', async (req, res) => {
    try {
        const {
            contributor,
            dateInvented,
            inventionName,
            inventionType,
            dimensions,
            iteration,
            iterationOf,
            materials,
            inventor,
            researchGroups,
            model,
            modelImage,
            regions,
            numberOfCorroborativeSources,
            sourceIds,
            sourcePageReferences,
            primarySourceIds,
            ancient,
            modern,
            multiRegional
        } = req.body;

        const query = `
            INSERT INTO inventions (
                contributor, date_invented, invention_name, invention_type,
                dimensions, iteration, iteration_of, materials, inventor,
                research_groups, model, model_image, regions,
                number_of_corroborative_sources, source_ids, source_page_references,
                primary_source_ids, ancient, modern, multi_regional
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
            RETURNING *;
        `;

        const values = [
            contributor,
            dateInvented,
            inventionName,
            inventionType,
            dimensions,
            iteration,
            iterationOf,
            materials,
            inventor,
            researchGroups,
            model,
            modelImage,
            regions,
            numberOfCorroborativeSources,
            sourceIds,
            sourcePageReferences,
            primarySourceIds,
            ancient,
            modern,
            multiRegional
        ];

        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating invention:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET endpoint to retrieve all inventions
app.get('/api/inventions', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM inventions ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching inventions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET endpoint to retrieve a single invention by ID
app.get('/api/inventions/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM inventions WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Invention not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching invention:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});





