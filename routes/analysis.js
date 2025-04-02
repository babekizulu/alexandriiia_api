const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { parseFile } = require('../services/fileParser');
const { buildPrompt } = require('../services/promptBuilder');
const { getAnalysisFromOpenAI } = require('../services/openaiClient');

const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('file'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const analysisType = req.body.analysisType;

    const extractedText = await parseFile(filePath, req.file.mimetype);
    const prompt = buildPrompt(analysisType, extractedText);
    const result = await getAnalysisFromOpenAI(prompt);

    fs.unlinkSync(filePath); // cleanup
    res.json({ analysis: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process the file' });
  }
});

module.exports = router;