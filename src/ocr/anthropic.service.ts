import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

@Injectable()
export class AnthropicService {
  private client: Anthropic;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');

    if (!apiKey) {
      console.warn('[AnthropicService] ANTHROPIC_API_KEY not configured');
    }

    this.client = new Anthropic({
      apiKey: apiKey || '',
    });
  }

  async extractText(file: Express.Multer.File): Promise<string> {
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');

    if (!apiKey) {
      throw new InternalServerErrorException(
        'Anthropic API key is not configured. Please set ANTHROPIC_API_KEY environment variable.',
      );
    }

    try {
      // Convert buffer to base64
      const base64Image = file.buffer.toString('base64');

      // Determine media type from file mimetype
      let mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' =
        'image/jpeg';
      const mimeType = file.mimetype?.toLowerCase();

      if (mimeType === 'image/png') {
        mediaType = 'image/png';
      } else if (mimeType === 'image/gif') {
        mediaType = 'image/gif';
      } else if (mimeType === 'image/webp') {
        mediaType = 'image/webp';
      } else if (
        mimeType === 'image/jpg' ||
        mimeType === 'image/jpeg' ||
        !mimeType
      ) {
        mediaType = 'image/jpeg';
      }

      // Call Anthropic API
      const message = await this.client.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: base64Image,
                },
              },
              {
                type: 'text',
                text:
                  'Extract ALL readable text from this image. ' +
                  'Preserve paragraphs and line breaks. ' +
                  'Do not add commentary, translation, or summary—just return the text.',
              },
            ],
          },
        ],
      });

      // Extract text from response
      const textBlocks = message.content
        .filter((block) => block.type === 'text')
        .map((block) => ('text' in block ? block.text : ''));

      const extractedText = textBlocks.join('\n\n');

      if (!extractedText) {
        throw new Error('No text extracted from image');
      }

      return extractedText;
    } catch (error) {
      console.error('[AnthropicService] Error:', error);
      throw new InternalServerErrorException(
        `Unable to process image with Anthropic: ${error.message}`,
      );
    }
  }
}
