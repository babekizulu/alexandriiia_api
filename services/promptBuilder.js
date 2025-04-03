function buildPrompt(type, text = '') {
  const hasText = text && text.trim() !== '';

  if (!hasText) {
    return `No document text was provided. Please upload a file with readable content so I can analyze it.`;
  }

  const preamble = `You are a highly knowledgeable historical analyst. Based only on the excerpt provided from the beginning of a historical document (first ~5 pages), infer its broader subject matter using your training data. Make educated assumptions where necessary, but clarify when you are inferring.`

  const baseText = `${preamble}\n\nExcerpt:\n${text}`;

  const prompts = {
    overview: `Provide a detailed overview of what this document is about, its likely context, time period, and themes.\n${baseText}`,
    timeline: `Create a chronological timeline of the likely key events discussed in this document based on the excerpt.\n${baseText}`,
    key_figures: `Identify and describe key historical figures likely to be discussed in this document based on the excerpt.\n${baseText}`,
    key_moments: `List and explain major historical moments that appear or are likely to appear later in the document, based on the excerpt.\n${baseText}`,
  };

  return prompts[type] || prompts.overview;
}

module.exports = { buildPrompt };
