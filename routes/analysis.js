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
    // Log the incoming request
    console.log('Analysis request received:');
    console.log('File:', req.file);
    console.log('Analysis type:', req.body.analysisType);
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const filePath = req.file.path;
    const analysisType = req.body.analysisType;
    
    if (!analysisType) {
      fs.unlinkSync(filePath); // cleanup
      return res.status(400).json({ error: 'Analysis type is required' });
    }

    console.log('Attempting to parse file:', req.file.originalname, 'of type:', req.file.mimetype);
    try {
      const extractedText = await parseFile(filePath, req.file.mimetype);
      
      // Check if extractedText is empty
      if (!extractedText || extractedText.trim() === '') {
        fs.unlinkSync(filePath); // cleanup
        return res.status(400).json({ 
          error: 'The uploaded file does not contain any readable text. Please try a different file.' 
        });
      }
      
      console.log('Successfully parsed file. Building prompt for analysis type:', analysisType);
      const prompt = buildPrompt(analysisType, extractedText);
      
      console.log('Sending request to OpenAI');
      const result = await getAnalysisFromOpenAI(prompt);
      console.log('Received response from OpenAI');

      fs.unlinkSync(filePath); // cleanup
      res.json({ analysis: result });
    } catch (parseError) {
      console.error('Error parsing file:', parseError);
      fs.unlinkSync(filePath); // cleanup
      return res.status(400).json({ error: `Failed to parse file: ${parseError.message}` });
    }
  } catch (err) {
    console.error('Unhandled error in analysis route:', err);
    // Clean up file if it exists
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkErr) {
        console.error('Error cleaning up file:', unlinkErr);
      }
    }
    res.status(500).json({ error: 'Failed to process the file: ' + err.message });
  }
});

module.exports = router;