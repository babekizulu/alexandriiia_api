const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const csv = require('csv-parser');
const {createWorker} = require('tesseract.js');
const { PDFDocument } = require('pdf-lib');
const sharp = require('sharp');
const fsPath = require('path');


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
       // Limit to first 2000 words as a proxy for 5 pages
      const words = result.value.split(/\s+/);
      const limitedText = words.slice(0, 2000).join(' ');
      return limitedText;
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
    const prefix = fsPath.join(outputDir, `page-${i}`);
    const cmd = `pdftoppm "${pdfPath}" "${prefix}" -f ${i} -l ${i} -png`;

    try {
      execSync(cmd);
      console.log(`Generated image for page ${i}`);
    } catch (err) {
      console.error(`Error generating image from PDF page ${i}:`, err);
      continue;
    }

    // Match actual file that was created
    const files = await fs.readdir(outputDir);
    const imageFileName = files.find(f => f.startsWith(`page-${i}-`) && f.endsWith('.png'));

    if (!imageFileName) {
      console.error(`Could not find image file for page ${i}`);
      continue;
    }

    const imageFilePath = fsPath.join(outputDir, imageFileName);

    try {
      // OCR extract
      const result = await worker.recognize(imageFilePath);
      console.log(`OCR Result for page ${i}:\n`, result.data.text.slice(0, 200));
      fullText += result.data.text + '\n';

      // Optional cleanup
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