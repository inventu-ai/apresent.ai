-- Add missing columns to GeneratedImage table
ALTER TABLE "GeneratedImage" 
ADD COLUMN IF NOT EXISTS "model" TEXT,
ADD COLUMN IF NOT EXISTS "aspectRatio" TEXT DEFAULT '4:3',
ADD COLUMN IF NOT EXISTS "quality" TEXT DEFAULT 'BASIC_IMAGE'; 