import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');

    if (!apiKey) {
      console.warn('[GeminiService] GEMINI_API_KEY not configured');
    } else {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  async extractText(file: Express.Multer.File): Promise<string> {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');

    if (!apiKey || !this.genAI) {
      throw new InternalServerErrorException(
        'Gemini API key is not configured. Please set GEMINI_API_KEY environment variable.',
      );
    }

    try {
      // Convert buffer to base64
      const base64Image = file.buffer.toString('base64');

      // Determine mime type from file mimetype
      let mimeType = 'image/jpeg';
      const fileMimeType = file.mimetype?.toLowerCase();

      if (fileMimeType === 'image/png') {
        mimeType = 'image/png';
      } else if (fileMimeType === 'image/gif') {
        mimeType = 'image/gif';
      } else if (fileMimeType === 'image/webp') {
        mimeType = 'image/webp';
      }

      // Get the Gemini model
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
      });

      // Call Gemini API
      const result = await model.generateContent([
        {
          inlineData: {
            data: base64Image,
            mimeType,
          },
        },
        {
          text:
            'Extract ALL readable text from this image. ' +
            'Preserve paragraphs and line breaks. ' +
            'Do not add commentary, translation, or summary—just return the text.',
        },
      ]);

      const response = result.response;
      const extractedText = response.text();

      if (!extractedText) {
        throw new Error('No text extracted from image');
      }

      return extractedText;
    } catch (error) {
      console.error('[GeminiService] Error:', error);
      throw new InternalServerErrorException(
        `Unable to process image with Gemini: ${error.message}`,
      );
    }
  }
}
