import { Module } from '@nestjs/common';
import { OcrController } from './ocr.controller';
import { OcrService } from './ocr.service';
import { OpenAIService } from './openai.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [OcrController],
  providers: [OcrService, OpenAIService],
})
export class OcrModule {}
