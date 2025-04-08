const express = require('express');
const router = express.Router();
const { getAnalysisFromOpenAI } = require('../services/openaiClient');

router.post('/', async (req, res) => {
  const { historicalFigure } = req.body;

  if (!historicalFigure || historicalFigure.trim() === '') {
    return res.status(400).json({ error: 'Historical figure is required.' });
  }

  const prompt = `
You're a historical knowledge assistant. A user has input the name of a historical figure: **${historicalFigure}**.

Your task is to build a simple network graph showing their most important historical relationships.

1. Identify 5–10 historical figures who are connected to them through mentorship, collaboration, opposition, or shared movements.
2. Output a JSON object with:
   - "nodes": each historical figure (including the input figure), with an "id" and "name"
   - "links": relationships between the figures, using "source" and "target" (by id)
   - "relationship": a 1-paragraph summary describing the relationships and historical context

⚠️ Make sure **every figure mentioned in the links array is also present in the nodes array**.

Example format:

{
  "nodes": [
    { "id": "plato", "name": "Plato" },
    { "id": "aristotle", "name": "Aristotle" }
  ],
  "links": [
    { "source": "plato", "target": "aristotle" }
  ],
  "relationship": "Aristotle was a student of Plato. This graph shows classical philosophical mentorship in Ancient Greece."
}

Only return a valid JSON object — do not include any explanation, Markdown, or extra text.`.trim();

  try {
    const raw = await getAnalysisFromOpenAI(prompt, 'You are a historical relationship generator.');
    console.log("GPT Response:\n", raw);
    const data = JSON.parse(raw);
    res.json(data);
  } catch (error) {
    console.error('Error generating relations:', error);
    res.status(500).json({ error: 'Failed to generate relations.' });
  }
});

module.exports = router;
