# Textbook Helper Backend

A minimal NestJS backend service for OCR text extraction from textbook images.

## Features

- JWT-based authentication with hardcoded credentials
- OCR text extraction using Tesseract
- Dockerized deployment
- CORS enabled for frontend integration

## Tech Stack

- Node.js 18
- NestJS framework
- TypeScript
- JWT authentication
- Tesseract OCR
- Docker

## API Endpoints

### POST /api/login
Authenticate and receive a JWT token.

**Request:**
```json
{
  "username": "demo",
  "password": "demo123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGc..."
}
```

**Error Response (401):**
```json
{
  "error": "Invalid credentials"
}
```

### POST /api/ocr
Extract text from an uploaded image (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body:**
- `image`: Image file (PNG or JPEG)

**Response (200):**
```json
{
  "text": "Extracted text from image..."
}
```

**Error Response (401):**
```json
{
  "error": "Invalid token"
}
```

**Error Response (400/500):**
```json
{
  "error": "Unable to process image"
}
```

## Running Locally

### Prerequisites
- Node.js 18 or higher
- npm
- Tesseract OCR installed locally (for non-Docker development)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (see `.env.example`):
```bash
cp .env.example .env
```

3. Update environment variables in `.env` as needed

### Development

Run in development mode:
```bash
npm run start:dev
```

The API will be available at `http://localhost:4000`

### Build

```bash
npm run build
```

### Production

```bash
npm run start:prod
```

## Docker

### Build Image

```bash
docker build -t textbook-helper-backend .
```

### Run Container

```bash
docker run -d -p 4000:4000 \
  -e DEMO_USERNAME=demo \
  -e DEMO_PASSWORD=demo123 \
  -e JWT_SECRET=your-secret-key \
  --name textbook-backend \
  textbook-helper-backend
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DEMO_USERNAME` | Hardcoded demo username | `demo` |
| `DEMO_PASSWORD` | Hardcoded demo password | `demo123` |
| `JWT_SECRET` | Secret key for JWT signing | (required) |
| `PORT` | Port to run the server | `4000` |

## Project Structure

```
src/
├── auth/
│   ├── auth.module.ts      # Auth module configuration
│   ├── auth.controller.ts  # Login endpoint
│   ├── auth.service.ts     # JWT generation and validation
│   ├── auth.guard.ts       # JWT authentication guard
│   └── auth.dto.ts         # Data transfer objects
├── ocr/
│   ├── ocr.module.ts       # OCR module configuration
│   ├── ocr.controller.ts   # OCR endpoint
│   ├── ocr.service.ts      # Tesseract integration
│   └── ocr.dto.ts          # Data transfer objects
├── app.module.ts           # Root application module
└── main.ts                 # Application bootstrap
```

## Deployment to EC2

### High-level steps:

1. Build and push Docker image to Amazon ECR:
```bash
docker build -t textbook-helper-backend .
docker tag textbook-helper-backend:latest <account-id>.dkr.ecr.<region>.amazonaws.com/textbook-helper-backend:latest
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/textbook-helper-backend:latest
```

2. Launch EC2 instance and install Docker

3. Pull and run the container on EC2:
```bash
docker run -d -p 4000:4000 \
  -e DEMO_USERNAME=demo \
  -e DEMO_PASSWORD=demo123 \
  -e JWT_SECRET=your-production-secret \
  --name textbook-backend \
  <account-id>.dkr.ecr.<region>.amazonaws.com/textbook-helper-backend:latest
```

4. Update frontend configuration to point to EC2 public DNS

## Notes

- This is a proof of concept with hardcoded credentials
- JWT tokens expire after 8 hours
- Temporary OCR files are automatically cleaned up after processing
- CORS is configured for `http://localhost:3000` (update for production)
