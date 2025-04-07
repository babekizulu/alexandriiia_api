// routes/vision.js
const express = require('express');
const multer = require('multer');
const visionClient = require('../services/visionClient');
const { OpenAI } = require('openai');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.post('/analyze-image', upload.single('image'), async (req, res) => {
  try {
    const [result] = await visionClient.labelDetection({
      image: { content: req.file.buffer },
    });

    const labels = result.labelAnnotations.map(label => label.description);
    const topLabel = labels[0];

    const prompt = `Write a short historical paragraph about the ${topLabel}.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const paragraph = response.choices[0].message.content;
    res.json({ label: topLabel, paragraph });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Image analysis failed.' });
  }
});

module.exports = router;
