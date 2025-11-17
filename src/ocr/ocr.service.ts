import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

const execAsync = promisify(exec);

@Injectable()
export class OcrService {
  async extractText(file: Express.Multer.File): Promise<string> {
    const tempFileName = `ocr-${uuidv4()}${path.extname(file.originalname)}`;
    const tempFilePath = path.join('/tmp', tempFileName);

    try {
      // Write the uploaded file to a temporary location
      await fs.writeFile(tempFilePath, file.buffer);

      // Execute Tesseract CLI
      const { stdout, stderr } = await execAsync(
        `tesseract ${tempFilePath} stdout -l eng`,
      );

      if (stderr && !stdout) {
        throw new Error(`Tesseract error: ${stderr}`);
      }

      // Clean and normalize the text
      const cleanedText = this.normalizeText(stdout);

      return cleanedText;
    } catch (error) {
      throw new InternalServerErrorException(
        `Unable to process image: ${error.message}`,
      );
    } finally {
      // Clean up temporary file
      try {
        await fs.unlink(tempFilePath);
      } catch (cleanupError) {
        // Log but don't throw - cleanup failure shouldn't fail the request
        console.error(`Failed to delete temp file: ${cleanupError.message}`);
      }
    }
  }

  private normalizeText(text: string): string {
    // Trim leading and trailing whitespace
    let normalized = text.trim();

    // Collapse excessive internal whitespace (multiple spaces/tabs to single space)
    normalized = normalized.replace(/\s+/g, ' ');

    return normalized;
  }
}
