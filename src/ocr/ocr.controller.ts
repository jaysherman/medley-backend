import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../auth/auth.guard';
import { OcrService } from './ocr.service';
import { OpenAIService } from './openai.service';
import { OcrResponseDto, ExtractionMethod } from './ocr.dto';

@Controller('api')
export class OcrController {
  constructor(
    private ocrService: OcrService,
    private openaiService: OpenAIService,
  ) {}

  @Post('ocr')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async processImage(
    @UploadedFile() file: Express.Multer.File,
    @Query('method') method?: string,
  ): Promise<OcrResponseDto> {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    // Default to OCR if no method specified or invalid method
    const extractionMethod =
      method === ExtractionMethod.OPENAI
        ? ExtractionMethod.OPENAI
        : ExtractionMethod.OCR;

    let text: string;

    if (extractionMethod === ExtractionMethod.OPENAI) {
      console.log('[OcrController] Using OpenAI for text extraction');
      text = await this.openaiService.extractText(file);
    } else {
      console.log('[OcrController] Using Tesseract OCR for text extraction');
      text = await this.ocrService.extractText(file);
    }

    return { text };
  }
}
