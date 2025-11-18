export class OcrResponseDto {
  text: string;
}

export class OcrErrorResponseDto {
  error: string;
}

export enum ExtractionMethod {
  OCR = 'ocr',
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
}
