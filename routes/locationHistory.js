const express = require('express');
const router = express.Router();
const { getAnalysisFromOpenAI } = require('../services/openaiClient');

router.post("/", async (req, res) => {
    const { location } = req.body;
    console.log(`User clicked on location: ${location}`);
  
    const prompt = `
You are a historian specializing in regional and world history.

Write a rich, engaging summary of the historical background of **${location}**, even if some of the information must be generalized from its region or country. 
Do not say "no historical data available." Always provide a narrative based on what is most likely historically relevant.
Include ancient civilizations, colonial history, key conflicts, cultural milestones, and important events that shaped the region.
Format the result as a paragraph.`.trim();
  
    try {
        const history = await getAnalysisFromOpenAI(prompt, 'You are a historian AI providing location history.');
        res.json({ history });
    } catch (error) {
        console.error('Error fetching location history:', error);
        res.status(500).json({ error: 'Failed to fetch location history.' });
    }
});
  
module.exports = router;
  