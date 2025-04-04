const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getAnalysisFromOpenAI(prompt, systemPrompt = 'You are a helpful historian AI.') {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key is not set');
      throw new Error('OpenAI API key is missing. Please check your environment configuration.');
    }

    console.log('Sending request to OpenAI with model: gpt-4o-mini');
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
    });
    
    if (!response.choices || response.choices.length === 0) {
      throw new Error('Received empty response from OpenAI');
    }
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error.message);
    if (error.response) {
      console.error('OpenAI Error Status:', error.response.status);
      console.error('OpenAI Error Data:', error.response.data);
    }
    throw new Error(`OpenAI API error: ${error.message}`);
  }
}

module.exports = { getAnalysisFromOpenAI };