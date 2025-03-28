const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

router.post('/invention-info', async (req, res) => {
    try {
        const { invention_name, invention_type, date_invented, inventor, regions, materials } = req.body;
        
        const prompt = `Provide a brief, informative paragraph about the ${invention_name}, which is a ${invention_type} invention. 
        ${date_invented ? `It was invented in ${date_invented} BCE.` : ''} 
        ${inventor ? `The inventor was ${inventor}.` : ''} 
        ${regions ? `It was used in ${regions}.` : ''} 
        ${materials ? `It was made from ${materials}.` : ''} 
        Focus on its historical significance and impact.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 150
        });

        res.json({ info: completion.choices[0].message.content });
    } catch (error) {
        console.error('Error generating invention info:', error);
        res.status(500).json({ error: 'Failed to generate information' });
    }
});

router.post('/architecture-info', async (req, res) => {
    try {
        const { structure_name, date_constructed_bce, date_constructed_ad, architects, regions, building_material, wonder } = req.body;
        
        const prompt = `Provide a brief, informative paragraph about the ${structure_name}. 
        ${date_constructed_bce ? `It was constructed in ${date_constructed_bce} BCE.` : ''} 
        ${date_constructed_ad ? `It was constructed in ${date_constructed_ad} AD.` : ''} 
        ${architects ? `The architects were ${architects}.` : ''} 
        ${regions ? `It is located in ${regions}.` : ''} 
        ${building_material ? `It was constructed using ${building_material}.` : ''} 
        ${wonder ? 'It is considered one of the Seven Wonders of the Ancient World.' : ''} 
        Focus on its historical significance and architectural importance.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 150
        });

        res.json({ info: completion.choices[0].message.content });
    } catch (error) {
        console.error('Error generating architecture info:', error);
        res.status(500).json({ error: 'Failed to generate information' });
    }
});

module.exports = router; 