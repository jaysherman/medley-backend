import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class OpenAIService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');

    if (!apiKey) {
      console.warn('[OpenAIService] OPENAI_API_KEY not configured');
    }

    this.openai = new OpenAI({
      apiKey: apiKey || '',
    });
  }

  async extractText(file: Express.Multer.File): Promise<string> {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');

    if (!apiKey) {
      throw new InternalServerErrorException(
        'OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.',
      );
    }

    try {
      // Convert buffer to base64
      const base64Image = file.buffer.toString('base64');
      const mimeType = file.mimetype || 'image/jpeg';

      // Call OpenAI API
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text:
                  'Extract ALL readable text from this image. ' +
                  'Preserve paragraphs and line breaks. Do not add or summarize anything.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`,
                },
              },
            ],
          },
        ],
      });

      const extractedText = response.choices[0]?.message?.content || '';

      if (!extractedText) {
        throw new Error('No text extracted from image');
      }

      return extractedText;
    } catch (error) {
      console.error('[OpenAIService] Error:', error);
      throw new InternalServerErrorException(
        `Unable to process image with OpenAI: ${error.message}`,
      );
    }
  }
}
