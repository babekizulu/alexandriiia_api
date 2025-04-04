const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const analysisRoute = require('./routes/analysis');
const weaveRoute = require('./routes/weave');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api/analyze', analysisRoute);
app.use('/api/weave', weaveRoute);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));