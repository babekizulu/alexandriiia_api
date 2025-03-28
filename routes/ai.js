const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

// Verify OpenAI API key is present
if (!process.env.OPENAI_API_KEY) {
    console.error('OpenAI API key is not set in environment variables');
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

router.post('/invention-info', async (req, res) => {
    try {
        console.log('Received invention info request:', req.body);
        const { invention_name, invention_type, date_invented, inventor, regions, materials } = req.body;
        
        if (!invention_name) {
            return res.status(400).json({ error: 'Invention name is required' });
        }

        const prompt = `Provide a brief, informative paragraph about the ${invention_name}, which is a ${invention_type} invention. 
        ${date_invented ? `It was invented in ${date_invented} BCE.` : ''} 
        ${inventor ? `The inventor was ${inventor}.` : ''} 
        ${regions ? `It was used in ${regions}.` : ''} 
        ${materials ? `It was made from ${materials}.` : ''} 
        Focus on its historical significance and impact.`;

        console.log('Sending prompt to OpenAI:', prompt);

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 150
        });

        console.log('Received response from OpenAI');
        res.json({ info: completion.choices[0].message.content });
    } catch (error) {
        console.error('Error generating invention info:', {
            message: error.message,
            stack: error.stack,
            response: error.response?.data
        });
        res.status(500).json({ 
            error: 'Failed to generate information',
            details: error.message
        });
    }
});

router.post('/architecture-info', async (req, res) => {
    try {
        console.log('Received architecture info request:', req.body);
        const { structure_name, date_constructed_bce, date_constructed_ad, architects, regions, building_material, wonder } = req.body;
        
        if (!structure_name) {
            return res.status(400).json({ error: 'Structure name is required' });
        }

        const prompt = `Provide a brief, informative paragraph about the ${structure_name}. 
        ${date_constructed_bce ? `It was constructed in ${date_constructed_bce} BCE.` : ''} 
        ${date_constructed_ad ? `It was constructed in ${date_constructed_ad} AD.` : ''} 
        ${architects ? `The architects were ${architects}.` : ''} 
        ${regions ? `It is located in ${regions}.` : ''} 
        ${building_material ? `It was constructed using ${building_material}.` : ''} 
        ${wonder ? 'It is considered one of the Seven Wonders of the Ancient World.' : ''} 
        Focus on its historical significance and architectural importance.`;

        console.log('Sending prompt to OpenAI:', prompt);

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 150
        });

        console.log('Received response from OpenAI');
        res.json({ info: completion.choices[0].message.content });
    } catch (error) {
        console.error('Error generating architecture info:', {
            message: error.message,
            stack: error.stack,
            response: error.response?.data
        });
        res.status(500).json({ 
            error: 'Failed to generate information',
            details: error.message
        });
    }
});

module.exports = router; 