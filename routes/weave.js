const express = require('express');
const router = express.Router();
const { getAnalysisFromOpenAI } = require('../services/openaiClient');

router.post('/', async (req, res) => {
  const { evidence } = req.body;

  if (!Array.isArray(evidence) || evidence.length === 0) {
    return res.status(400).json({ error: 'Evidence must be a non-empty array.' });
  }

  // Extract just the content from the evidence objects
  const evidenceContent = evidence.map(item => item.content).filter(content => content.trim() !== '');
  
  if (evidenceContent.length === 0) {
    return res.status(400).json({ error: 'No valid evidence content provided.' });
  }

  const prompt = `
You are a historian. Given the following pieces of evidence submitted by a researcher, craft a single compelling paragraph that weaves them into a cohesive narrative.

- Emphasize causality and coherence.
- Maintain a formal but accessible tone.
- Avoid repeating the evidence verbatim; instead, synthesize and interpret it.

Evidence:
- ${evidenceContent.join('\n- ')}
  `;

  try {
    const narrative = await getAnalysisFromOpenAI(prompt, 'You are a historical narrative generator AI');
    res.json({ narrative });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;