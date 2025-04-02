function buildPrompt(type, text) {
    const prompts = {
      overview: `Provide a detailed overview of the following document:\n\n${text}`,
      timeline: `Extract a chronological timeline of historical events from the text:\n\n${text}`,
      key_figures: `Identify and describe key historical figures mentioned in this document:\n\n${text}`,
      key_moments: `List and explain key historical moments described in this text:\n\n${text}`,
    };
    
    // Check if text is empty or undefined
    if (!text || text.trim() === '') {
      return 'It seems that your message is empty and does not include a document or any specific content to analyze. Please provide the text or details of the document you\'re referring to, and I will be happy to help you with a detailed overview!';
    }
    
    return prompts[type] || prompts.overview;
  }
  
module.exports = { buildPrompt };