import { Module } from '@nestjs/common';
import { OcrController } from './ocr.controller';
import { OcrService } from './ocr.service';
import { OpenAIService } from './openai.service';
import { AnthropicService } from './anthropic.service';
import { GeminiService } from './gemini.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [OcrController],
  providers: [OcrService, OpenAIService, AnthropicService, GeminiService],
})
export class OcrModule {}
