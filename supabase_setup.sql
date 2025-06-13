-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('ADMIN', 'USER');
CREATE TYPE document_type AS ENUM ('NOTE', 'DOCUMENT', 'DRAWING', 'DESIGN', 'STICKY_NOTES', 'MIND_MAP', 'RAG', 'RESEARCH_PAPER', 'FLIPBOOK', 'PRESENTATION');

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    "emailVerified" TIMESTAMPTZ,
    image TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
    headline VARCHAR(100),
    bio TEXT,
    interests TEXT[] DEFAULT '{}',
    location TEXT,
    website TEXT,
    role user_role DEFAULT 'USER',
    "hasAccess" BOOLEAN DEFAULT false
);

-- Create accounts table for NextAuth
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    provider TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at INTEGER,
    token_type TEXT,
    scope TEXT,
    id_token TEXT,
    session_state TEXT,
    "refresh_token_expires_in" INTEGER,
    UNIQUE(provider, "providerAccountId")
);

-- Create BaseDocument table
CREATE TABLE IF NOT EXISTS "BaseDocument" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    type document_type NOT NULL,
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "thumbnailUrl" TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
    "isPublic" BOOLEAN DEFAULT false,
    "documentType" TEXT NOT NULL
);

-- Create Presentation table
CREATE TABLE IF NOT EXISTS "Presentation" (
    id UUID PRIMARY KEY REFERENCES "BaseDocument"(id) ON DELETE CASCADE,
    content JSONB NOT NULL,
    theme TEXT DEFAULT 'default',
    "imageModel" TEXT,
    "presentationStyle" TEXT,
    language TEXT DEFAULT 'en-US',
    outline TEXT[] DEFAULT '{}',
    "templateId" TEXT,
    "customThemeId" UUID
);

-- Create CustomTheme table
CREATE TABLE IF NOT EXISTS "CustomTheme" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "logoUrl" TEXT,
    "isPublic" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
    "themeData" JSONB NOT NULL
);

-- Create FavoriteDocument table
CREATE TABLE IF NOT EXISTS "FavoriteDocument" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "documentId" UUID NOT NULL REFERENCES "BaseDocument"(id) ON DELETE CASCADE,
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE("documentId", "userId")
);

-- Create GeneratedImage table
CREATE TABLE IF NOT EXISTS "GeneratedImage" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    url TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL
);

-- Create password_reset_tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    token TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key constraint for CustomTheme in Presentation
ALTER TABLE "Presentation" 
ADD CONSTRAINT "Presentation_customThemeId_fkey" 
FOREIGN KEY ("customThemeId") REFERENCES "CustomTheme"(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts("userId");
CREATE INDEX IF NOT EXISTS idx_accounts_provider ON accounts(provider, "providerAccountId");
CREATE INDEX IF NOT EXISTS idx_base_document_user_id ON "BaseDocument"("userId");
CREATE INDEX IF NOT EXISTS idx_base_document_type ON "BaseDocument"(type);
CREATE INDEX IF NOT EXISTS idx_base_document_public ON "BaseDocument"("isPublic");
CREATE INDEX IF NOT EXISTS idx_custom_theme_user_id ON "CustomTheme"("userId");

CREATE INDEX IF NOT EXISTS idx_favorite_document_user_id ON "FavoriteDocument"("userId");
CREATE INDEX IF NOT EXISTS idx_favorite_document_document_id ON "FavoriteDocument"("documentId");
CREATE INDEX IF NOT EXISTS idx_generated_image_user_id ON "GeneratedImage"("userId");
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_email ON password_reset_tokens(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_base_document_updated_at BEFORE UPDATE ON "BaseDocument" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_custom_theme_updated_at BEFORE UPDATE ON "CustomTheme" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_generated_image_updated_at BEFORE UPDATE ON "GeneratedImage" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BaseDocument" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Presentation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CustomTheme" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FavoriteDocument" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "GeneratedImage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);

-- RLS Policies for accounts table
CREATE POLICY "Users can view own accounts" ON accounts FOR SELECT USING (auth.uid()::text = "userId"::text);
CREATE POLICY "Users can insert own accounts" ON accounts FOR INSERT WITH CHECK (auth.uid()::text = "userId"::text);
CREATE POLICY "Users can update own accounts" ON accounts FOR UPDATE USING (auth.uid()::text = "userId"::text);
CREATE POLICY "Users can delete own accounts" ON accounts FOR DELETE USING (auth.uid()::text = "userId"::text);

-- RLS Policies for BaseDocument table
CREATE POLICY "Users can view own documents" ON "BaseDocument" FOR SELECT USING (auth.uid()::text = "userId"::text);
CREATE POLICY "Users can view public documents" ON "BaseDocument" FOR SELECT USING ("isPublic" = true);
CREATE POLICY "Users can insert own documents" ON "BaseDocument" FOR INSERT WITH CHECK (auth.uid()::text = "userId"::text);
CREATE POLICY "Users can update own documents" ON "BaseDocument" FOR UPDATE USING (auth.uid()::text = "userId"::text);
CREATE POLICY "Users can delete own documents" ON "BaseDocument" FOR DELETE USING (auth.uid()::text = "userId"::text);

-- RLS Policies for Presentation table
CREATE POLICY "Users can view own presentations" ON "Presentation" FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM "BaseDocument" 
        WHERE "BaseDocument".id = "Presentation".id 
        AND (auth.uid()::text = "BaseDocument"."userId"::text OR "BaseDocument"."isPublic" = true)
    )
);
CREATE POLICY "Users can insert own presentations" ON "Presentation" FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM "BaseDocument" 
        WHERE "BaseDocument".id = "Presentation".id 
        AND auth.uid()::text = "BaseDocument"."userId"::text
    )
);
CREATE POLICY "Users can update own presentations" ON "Presentation" FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM "BaseDocument" 
        WHERE "BaseDocument".id = "Presentation".id 
        AND auth.uid()::text = "BaseDocument"."userId"::text
    )
);
CREATE POLICY "Users can delete own presentations" ON "Presentation" FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM "BaseDocument" 
        WHERE "BaseDocument".id = "Presentation".id 
        AND auth.uid()::text = "BaseDocument"."userId"::text
    )
);

-- RLS Policies for CustomTheme table
CREATE POLICY "Users can view own themes" ON "CustomTheme" FOR SELECT USING (auth.uid()::text = "userId"::text);

CREATE POLICY "Users can insert own themes" ON "CustomTheme" FOR INSERT WITH CHECK (auth.uid()::text = "userId"::text);
CREATE POLICY "Users can update own themes" ON "CustomTheme" FOR UPDATE USING (auth.uid()::text = "userId"::text);
CREATE POLICY "Users can delete own themes" ON "CustomTheme" FOR DELETE USING (auth.uid()::text = "userId"::text);

-- RLS Policies for FavoriteDocument table
CREATE POLICY "Users can view own favorites" ON "FavoriteDocument" FOR SELECT USING (auth.uid()::text = "userId"::text);
CREATE POLICY "Users can insert own favorites" ON "FavoriteDocument" FOR INSERT WITH CHECK (auth.uid()::text = "userId"::text);
CREATE POLICY "Users can delete own favorites" ON "FavoriteDocument" FOR DELETE USING (auth.uid()::text = "userId"::text);

-- RLS Policies for GeneratedImage table
CREATE POLICY "Users can view own images" ON "GeneratedImage" FOR SELECT USING (auth.uid()::text = "userId"::text);
CREATE POLICY "Users can insert own images" ON "GeneratedImage" FOR INSERT WITH CHECK (auth.uid()::text = "userId"::text);
CREATE POLICY "Users can update own images" ON "GeneratedImage" FOR UPDATE USING (auth.uid()::text = "userId"::text);
CREATE POLICY "Users can delete own images" ON "GeneratedImage" FOR DELETE USING (auth.uid()::text = "userId"::text);

-- RLS Policies for password_reset_tokens table (allow public access for password reset flow)
CREATE POLICY "Allow public insert for password reset" ON password_reset_tokens FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select for password reset" ON password_reset_tokens FOR SELECT USING (true);
CREATE POLICY "Allow public update for password reset" ON password_reset_tokens FOR UPDATE USING (true);
CREATE POLICY "Allow public delete for cleanup" ON password_reset_tokens FOR DELETE USING (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
