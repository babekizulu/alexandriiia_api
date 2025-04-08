const express = require('express');
const router = express.Router();
const { getAnalysisFromOpenAI } = require('../services/openaiClient');

router.post('/', async (req, res) => {
  const { figure } = req.body;

  if (!figure || figure.trim() === '') {
    return res.status(400).json({ error: 'Figure is required.' });
  }

  const prompt = `
You are a historical assistant.

Provide a brief summary (max 3 paragraphs) about ${figure}, including:
- Their most significant contributions
- Key works or achievements
- Their influence on history

Respond in this JSON format:

{
  "summary": "...",
  "keyWorks": ["...", "..."]
}

Only return the JSON object.`.trim();

  try {
    const raw = await getAnalysisFromOpenAI(prompt, 'You are a historical figure summarizer.');
    const data = JSON.parse(raw);
    res.json(data);
  } catch (error) {
    console.error('Error generating figure summary:', error);
    res.status(500).json({ error: 'Failed to generate figure summary.' });
  }
});

module.exports = router;