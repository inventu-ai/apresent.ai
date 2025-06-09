#!/bin/bash

# Run the Next.js development server with environment variables
# Replace these placeholder values with your actual values
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/presentation_ai" \
OPENAI_API_KEY="your-openai-api-key" \
TOGETHER_AI_API_KEY="your-together-ai-api-key" \
GOOGLE_CLIENT_ID="your-google-client-id" \
GOOGLE_CLIENT_SECRET="your-google-client-secret" \
NEXTAUTH_URL="http://localhost:3000" \
NEXTAUTH_SECRET="your-nextauth-secret" \
pnpm dev
