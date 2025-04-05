const express = require('express');
const router = express.Router();
const { getAnalysisFromOpenAI } = require('../services/openaiClient');

router.post('/', async (req, res) => {
    const { source, evidenceText } = req.body;
  
    const prompt = `You are an academic research assistant. The user will provide a piece of evidence that was extracted from a source. Your task is to determine whether this evidence is supported by credible external sources. 

    Here is the evidence:
    ---
    Source: ${source}
    Evidence: ${evidenceText}

    Please provide:
    1. Verification Status: Verified / Not Verifiable / Needs Clarification
    2. If Verified, list up to 3 authoritative sources supporting this.
    3. Short note for each source explaining the match.
    `;
  
    try {
        const result = await getAnalysisFromOpenAI(prompt, 'You are an Academic Research Assistant AI');
        res.json({ verificationReport: result });
    } catch (error) {
        console.error('Error verifying evidence:', error);
        res.status(500).json({ error: 'Failed to verify evidence' });
    }
});

module.exports = router;
  