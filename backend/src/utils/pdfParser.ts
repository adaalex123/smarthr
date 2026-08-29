import { PDFParse } from 'pdf-parse';
import fs from 'node:fs/promises';

export async function extractPdfText(filePath: string): Promise<string> {
  const buffer = await fs.readFile(filePath);
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return result.text;
  } finally {
    await parser.destroy();
  }
}