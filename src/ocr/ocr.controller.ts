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
import { OcrResponseDto } from './ocr.dto';

@Controller('api')
export class OcrController {
  constructor(private ocrService: OcrService) {}

  @Post('ocr')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async processImage(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<OcrResponseDto> {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    const text = await this.ocrService.extractText(file);
    return { text };
  }
}
