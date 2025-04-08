const express = require('express');
const router = express.Router();
const { getAnalysisFromOpenAI } = require('../services/openaiClient');

router.post('/', async (req, res) => {
  const { source, target } = req.body;

  if (!source || !target) {
    return res.status(400).json({ error: 'Both source and target figures are required.' });
  }

  const prompt = `
You are a historical relationship analyst.

Explain the historical relationship between ${source} and ${target}. 
Include mentorship, conflict, collaboration, or influence if applicable.
Limit the answer to a single paragraph.

Respond only with a plain paragraph of text.`.trim();

  try {
    const relationship = await getAnalysisFromOpenAI(prompt, 'You are a relationship explainer.');
    res.json({ relationship });
  } catch (error) {
    console.error('Error generating figure link:', error);
    res.status(500).json({ error: 'Failed to generate relationship summary.' });
  }
});

module.exports = router;
