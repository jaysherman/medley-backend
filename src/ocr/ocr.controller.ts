import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../auth/auth.guard';
import { OcrService } from './ocr.service';
import { OpenAIService } from './openai.service';
import { AnthropicService } from './anthropic.service';
import { GeminiService } from './gemini.service';
import { OcrResponseDto } from './ocr.dto';

@Controller('api')
export class OcrController {
  constructor(
    private ocrService: OcrService,
    private openaiService: OpenAIService,
    private anthropicService: AnthropicService,
    private geminiService: GeminiService,
  ) {}

  @Post('ocr')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async extractWithOcr(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<OcrResponseDto> {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    console.log('[OcrController] Using Tesseract OCR for text extraction');
    const text = await this.ocrService.extractText(file);
    return { text };
  }

  @Post('ocr/openai')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async extractWithOpenAI(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<OcrResponseDto> {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    console.log('[OcrController] Using OpenAI for text extraction');
    const text = await this.openaiService.extractText(file);
    return { text };
  }

  @Post('ocr/anthropic')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async extractWithAnthropic(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<OcrResponseDto> {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    console.log('[OcrController] Using Anthropic Claude for text extraction');
    const text = await this.anthropicService.extractText(file);
    return { text };
  }

  @Post('ocr/gemini')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async extractWithGemini(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<OcrResponseDto> {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    console.log('[OcrController] Using Google Gemini for text extraction');
    const text = await this.geminiService.extractText(file);
    return { text };
  }
}
