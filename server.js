const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const analysisRoute = require('./routes/analysis');
const weaveRoute = require('./routes/weave');
const verifyEvidenceRoute = require('./routes/verifyEvidence');
const curateRoute = require('./routes/curate');
const visionRoute = require('./routes/vision');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['https://alexandriiia.com', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use('/api/analyze', analysisRoute);
app.use('/api/weave', weaveRoute);
app.use('/api/verify-evidence', verifyEvidenceRoute);
app.use('/api/curate', curateRoute);
app.use('/api/vision', visionRoute);
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));