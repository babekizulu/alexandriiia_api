const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const csv = require('csv-parser');
const {createWorker} = require('tesseract.js');
const { PDFDocument } = require('pdf-lib');
const sharp = require('sharp');


async function parseFile(filePath, mimetype) {
  try {
    const normalizedPath = path.normalize(filePath);

    if (mimetype === 'application/pdf') {
      console.log('Parsing using pdf-lib');
      const dataBuffer = await fs.readFile(normalizedPath);
      const pdfDoc = await PDFDocument.load(dataBuffer, { ignoreEncryption: true });
      const pageCount = pdfDoc.getPageCount();
      // Fallback to OCR
      console.warn('No extractable text found. Falling back to OCR...');
      return await extractTextWithOCR(normalizedPath, pageCount);

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
  } catch (error) {
    console.error('Error parsing file:', error);
    throw error; // Re-throw the error after logging
  }
}

async function extractTextWithOCR(pdfPath, pageCount) {
  const { execSync } = require('child_process');
  const { join } = require('path');

  const outputDir = join(__dirname, '../uploads/ocr_images');
  await fs.mkdir(outputDir, { recursive: true });

  const worker = await createWorker('eng');
  let fullText = '';

  for (let i = 1; i <= Math.min(5, pageCount); i++) {
    const prefix = join(outputDir, `page-${i}`);
    const cmd = `pdftoppm "${pdfPath}" "${prefix}" -f ${i} -l ${i} -png`;

    try {
      execSync(cmd);
      const files = await fs.readdir(outputDir);
      console.log('Files in OCR output dir:', files);
      console.log(`Generated image for page ${i}`);
    } catch (err) {
      console.error(`Error generating image from PDF page ${i}:`, err);
      continue;
    }

    const paddedIndex = i.toString().padStart(2, '0');
    let imageFilePath = `${prefix}-${paddedIndex}.png`;

    try {
      await fs.access(imageFilePath);

      // 🔥 OCR extract
      const result = await worker.recognize(imageFilePath);
      console.log(`OCR Result for page ${i}:\n`, result.data.text.slice(0, 200));
      fullText += result.data.text + '\n';

      // Optional: clean up
      await fs.unlink(imageFilePath);
    } catch (err) {
      console.error(`OCR failed on page ${i}:`, err);
    }
  }

  await worker.terminate();

  if (!fullText.trim()) {
    console.warn('OCR fallback completed, but no text was extracted.');
  }

  return fullText.trim();
}




module.exports = { parseFile };