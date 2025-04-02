const fs = require('fs').promises;
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const csv = require('csv-parser');

async function parseFile(filePath, mimetype) {
  if (mimetype === 'application/pdf') {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } else if (mimetype === 'text/plain') {
    return await fs.readFile(filePath, 'utf-8');
  } else if (mimetype === 'text/csv' || mimetype === 'text/tab-separated-values') {
    const content = await fs.readFile(filePath, 'utf-8');
    return content;
  } else {
    throw new Error('Unsupported file type');
  }
}

module.exports = { parseFile };