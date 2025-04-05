const express = require('express');
const router = express.Router();
const {getAnalysisFromOpenAI} = require('../services/openaiClient');

router.post('/', async (req, res) => {
    const { researchTopic } = req.body;
  
    if (!researchTopic?.trim()) {
      return res.status(400).json({ error: 'Research topic is required.' });
    }
  
    const prompt = `
  Given this research topic: "${researchTopic}", return a list of 5-7 sources relevant to this research. Include each source's title, and author. Prioritize sources that are academically relevant, and diverse in perspective.
  `;
  
    try {
      const response = await getAnalysisFromOpenAI(prompt, 'You are a historian and academic research assistant.');
  
      const curatedSources = response;
      res.json({ sources: curatedSources });
    } catch (error) {
      console.error('OpenAI API error:', error);
      res.status(500).json({ error: 'Failed to fetch curated sources.' });
    }
  });
  
  module.exports = router;