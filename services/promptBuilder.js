function buildPrompt(type, text) {
    const prompts = {
      overview: `Provide a detailed overview of the following document:\n\n${text}`,
      timeline: `Extract a chronological timeline of historical events from the text:\n\n${text}`,
      key_figures: `Identify and describe key historical figures mentioned in this document:\n\n${text}`,
      key_moments: `List and explain key historical moments described in this text:\n\n${text}`,
    };
    return prompts[type] || prompts.overview;
  }
  
module.exports = { buildPrompt };