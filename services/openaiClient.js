const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getAnalysisFromOpenAI(prompt) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a helpful historian AI.' },
      { role: 'user', content: prompt },
    ],
  });
  return response.choices[0].message.content;
}

module.exports = { getAnalysisFromOpenAI };