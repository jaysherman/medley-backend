FROM node:18-bullseye

# Install Tesseract OCR and ImageMagick for image preprocessing
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    imagemagick \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Set environment variable for port
ENV PORT=4000

# Expose port
EXPOSE 4000

# Start the application
CMD ["node", "dist/main.js"]
