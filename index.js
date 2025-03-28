require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const aiRoutes = require('./routes/ai');

const app = express();
const port = process.env.PORT || 3000;

// CORS configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? ['https://alexandriiia.com']  // Client's production domain
        : ['http://localhost:5173', 'http://127.0.0.1:5173'], // Vite's default development ports
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/ai', aiRoutes);

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
    contributor VARCHAR(255),
    date_invented INTEGER,
    invention_name VARCHAR(255),
    invention_type VARCHAR(255),
    dimensions VARCHAR(255),
    iteration VARCHAR(255),
    iteration_of VARCHAR(255),
    materials VARCHAR(255),
    inventor VARCHAR(255),
    research_groups VARCHAR(255),
    model VARCHAR(255),
    model_image VARCHAR(255),
    regions VARCHAR(255),
    number_of_corroborative_sources INTEGER,
    source_ids VARCHAR(255),
    source_page_references VARCHAR(255),
    primary_source_ids VARCHAR(255),
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

// Create structures table if it doesn't exist
const createStructuresTableQuery = `
CREATE TABLE IF NOT EXISTS structures (
    id SERIAL PRIMARY KEY,
    date_constructed_bce INTEGER,
    date_constructed_ad INTEGER,
    structure_name VARCHAR(255) NOT NULL,
    renovation_of_previous_structure BOOLEAN DEFAULT FALSE,
    previous_structure VARCHAR(255),
    iteration_on_previous_structure BOOLEAN DEFAULT FALSE,
    structural_dimensions VARCHAR(255),
    statue BOOLEAN DEFAULT FALSE,
    landmark BOOLEAN DEFAULT FALSE,
    monument BOOLEAN DEFAULT FALSE,
    wall BOOLEAN DEFAULT FALSE,
    stairwell_staircase BOOLEAN DEFAULT FALSE,
    structural_support BOOLEAN DEFAULT FALSE,
    building BOOLEAN DEFAULT FALSE,
    barracks BOOLEAN DEFAULT FALSE,
    fortress BOOLEAN DEFAULT FALSE,
    castle BOOLEAN DEFAULT FALSE,
    palace BOOLEAN DEFAULT FALSE,
    gateway BOOLEAN DEFAULT FALSE,
    hall BOOLEAN DEFAULT FALSE,
    gallery BOOLEAN DEFAULT FALSE,
    treasury BOOLEAN DEFAULT FALSE,
    temple BOOLEAN DEFAULT FALSE,
    tomb BOOLEAN DEFAULT FALSE,
    bridge BOOLEAN DEFAULT FALSE,
    canal_system BOOLEAN DEFAULT FALSE,
    dam BOOLEAN DEFAULT FALSE,
    building_material VARCHAR(255),
    architects VARCHAR(255),
    wonder BOOLEAN DEFAULT FALSE,
    model VARCHAR(255),
    model_image VARCHAR(255),
    regions VARCHAR(255),
    continent VARCHAR(255),
    num_of_sources INTEGER,
    source_ids TEXT[],
    source_page_references TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`;

// Initialize structures table
pool.query(createStructuresTableQuery, (err) => {
    if (err) {
        console.error('Error creating structures table:', err);
    } else {
        console.log('Structures table initialized successfully');
    }
});

// POST endpoint to create a new invention
app.post('/api/inventions', async (req, res) => {
    try {
        console.log('Received invention data:', req.body); // Debug log
        
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

        // Validate required fields
        if (!inventionName) {
            return res.status(400).json({ error: 'Invention name is required' });
        }

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
            dateInvented ? parseInt(dateInvented) : null,  // Convert to integer
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

        console.log('Executing query with values:', values); // Debug log
        const result = await pool.query(query, values);
        console.log('Query result:', result.rows[0]); // Debug log
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating invention:', {
            message: error.message,
            stack: error.stack,
            detail: error.detail,
            hint: error.hint
        });
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message,
            detail: error.detail
        });
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

// POST endpoint to create a new structure
app.post('/api/structures', async (req, res) => {
    try {
        console.log('Received structure data:', req.body);
        
        const {
            date_constructed_bce,
            date_constructed_ad,
            structure_name,
            renovation_of_previous_structure,
            previous_structure,
            iteration_on_previous_structure,
            structural_dimensions,
            statue,
            landmark,
            monument,
            wall,
            stairwell_staircase,
            structural_support,
            building,
            barracks,
            fortress,
            castle,
            palace,
            gateway,
            hall,
            gallery,
            treasury,
            temple,
            tomb,
            bridge,
            canal_system,
            dam,
            building_material,
            architects,
            wonder,
            model,
            model_image,
            regions,
            continent,
            num_of_sources,
            source_ids,
            source_page_references
        } = req.body;

        // Validate required fields
        if (!structure_name) {
            return res.status(400).json({ error: 'Structure name is required' });
        }

        const query = `
            INSERT INTO structures (
                date_constructed_bce, date_constructed_ad, structure_name,
                renovation_of_previous_structure, previous_structure,
                iteration_on_previous_structure, structural_dimensions,
                statue, landmark, monument, wall, stairwell_staircase,
                structural_support, building, barracks, fortress, castle,
                palace, gateway, hall, gallery, treasury, temple, tomb,
                bridge, canal_system, dam, building_material, architects,
                wonder, model, model_image, regions, continent,
                num_of_sources, source_ids, source_page_references
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
                $13, $14, $15, $16, $17, $18, $19, $20, $21, $22,
                $23, $24, $25, $26, $27, $28, $29, $30, $31, $32,
                $33, $34, $35, $36, $37
            )
            RETURNING *;
        `;

        const values = [
            date_constructed_bce,
            date_constructed_ad,
            structure_name,
            renovation_of_previous_structure || false,
            previous_structure,
            iteration_on_previous_structure || false,
            structural_dimensions,
            statue || false,
            landmark || false,
            monument || false,
            wall || false,
            stairwell_staircase || false,
            structural_support || false,
            building || false,
            barracks || false,
            fortress || false,
            castle || false,
            palace || false,
            gateway || false,
            hall || false,
            gallery || false,
            treasury || false,
            temple || false,
            tomb || false,
            bridge || false,
            canal_system || false,
            dam || false,
            building_material,
            architects,
            wonder || false,
            model,
            model_image,
            regions,
            continent,
            num_of_sources,
            source_ids,
            source_page_references
        ];

        console.log('Executing query with values:', values);
        const result = await pool.query(query, values);
        console.log('Query result:', result.rows[0]);
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating structure:', {
            message: error.message,
            stack: error.stack,
            detail: error.detail,
            hint: error.hint
        });
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message,
            detail: error.detail
        });
    }
});

// GET endpoint to retrieve all structures
app.get('/api/structures', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM structures ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching structures:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});





