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
    const preprocessedPath = path.join('/tmp', `preprocessed-${uuidv4()}.png`);

    try {
      // Write the uploaded file to a temporary location
      await fs.writeFile(tempFilePath, file.buffer);

      // Preprocess the image for better OCR quality
      await this.preprocessImage(tempFilePath, preprocessedPath);

      // Execute Tesseract CLI with quality-optimized parameters
      // --oem 1: Use LSTM neural network engine for better accuracy
      // --psm 3: Fully automatic page segmentation (default, but explicit)
      // -c preserve_interword_spaces=1: Preserve spacing between words
      const { stdout, stderr } = await execAsync(
        `tesseract "${preprocessedPath}" stdout -l eng --oem 1 --psm 3 -c preserve_interword_spaces=1`,
      );

      if (stderr && !stdout) {
        throw new Error(`Tesseract error: ${stderr}`);
      }

      // Return text without aggressive normalization to preserve formatting
      return stdout.trim();
    } catch (error) {
      throw new InternalServerErrorException(
        `Unable to process image: ${error.message}`,
      );
    } finally {
      // Clean up temporary files
      try {
        await fs.unlink(tempFilePath);
      } catch (cleanupError) {
        console.error(
          `Failed to delete temp file: ${cleanupError.message}`,
        );
      }

      try {
        await fs.unlink(preprocessedPath);
      } catch (cleanupError) {
        console.error(
          `Failed to delete preprocessed file: ${cleanupError.message}`,
        );
      }
    }
  }

  private async preprocessImage(
    inputPath: string,
    outputPath: string,
  ): Promise<void> {
    try {
      // Use ImageMagick (convert) to preprocess the image for better OCR:
      // 1. Remove alpha channel if present
      // 2. Increase DPI to 300 (Tesseract works best at 300+ DPI)
      // 3. Convert to grayscale
      // 4. Normalize contrast
      // 5. Apply slight sharpening
      // 6. Apply noise reduction (despeckle)
      const convertCmd = `convert "${inputPath}" \
        -alpha off \
        -density 300 \
        -colorspace Gray \
        -normalize \
        -sharpen 0x1 \
        -despeckle \
        "${outputPath}"`;

      await execAsync(convertCmd);
    } catch (error) {
      console.warn(
        `[OcrService] Image preprocessing failed, using original: ${error.message}`,
      );
      // If preprocessing fails, copy original file as fallback
      await fs.copyFile(inputPath, outputPath);
    }
  }
}
