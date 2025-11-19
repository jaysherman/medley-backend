import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for the frontend
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://medley-frontend-poc.s3-website-us-west-2.amazonaws.com',
      'https://d3jnhqfa0oaee7.cloudfront.net',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');  // '0.0.0.0' is important in containers
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
