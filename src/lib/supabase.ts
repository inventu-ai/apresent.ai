import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client for browser/client-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client for server-side operations (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Database types based on the Prisma schema
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string | null
          email: string | null
          password: string | null
          emailVerified: string | null
          image: string | null
          createdAt: string
          updatedAt: string
          headline: string | null
          bio: string | null
          interests: string[]
          location: string | null
          website: string | null
          role: 'ADMIN' | 'USER'
          hasAccess: boolean
        }
        Insert: {
          id?: string
          name?: string | null
          email?: string | null
          password?: string | null
          emailVerified?: string | null
          image?: string | null
          createdAt?: string
          updatedAt?: string
          headline?: string | null
          bio?: string | null
          interests?: string[]
          location?: string | null
          website?: string | null
          role?: 'ADMIN' | 'USER'
          hasAccess?: boolean
        }
        Update: {
          id?: string
          name?: string | null
          email?: string | null
          password?: string | null
          emailVerified?: string | null
          image?: string | null
          createdAt?: string
          updatedAt?: string
          headline?: string | null
          bio?: string | null
          interests?: string[]
          location?: string | null
          website?: string | null
          role?: 'ADMIN' | 'USER'
          hasAccess?: boolean
        }
      }
      accounts: {
        Row: {
          id: string
          userId: string
          type: string
          provider: string
          providerAccountId: string
          refresh_token: string | null
          access_token: string | null
          expires_at: number | null
          token_type: string | null
          scope: string | null
          id_token: string | null
          session_state: string | null
          refresh_token_expires_in: number | null
        }
        Insert: {
          id?: string
          userId: string
          type: string
          provider: string
          providerAccountId: string
          refresh_token?: string | null
          access_token?: string | null
          expires_at?: number | null
          token_type?: string | null
          scope?: string | null
          id_token?: string | null
          session_state?: string | null
          refresh_token_expires_in?: number | null
        }
        Update: {
          id?: string
          userId?: string
          type?: string
          provider?: string
          providerAccountId?: string
          refresh_token?: string | null
          access_token?: string | null
          expires_at?: number | null
          token_type?: string | null
          scope?: string | null
          id_token?: string | null
          session_state?: string | null
          refresh_token_expires_in?: number | null
        }
      }
      BaseDocument: {
        Row: {
          id: string
          title: string
          type: 'NOTE' | 'DOCUMENT' | 'DRAWING' | 'DESIGN' | 'STICKY_NOTES' | 'MIND_MAP' | 'RAG' | 'RESEARCH_PAPER' | 'FLIPBOOK' | 'PRESENTATION'
          userId: string
          thumbnailUrl: string | null
          createdAt: string
          updatedAt: string
          isPublic: boolean
          documentType: string
        }
        Insert: {
          id?: string
          title: string
          type: 'NOTE' | 'DOCUMENT' | 'DRAWING' | 'DESIGN' | 'STICKY_NOTES' | 'MIND_MAP' | 'RAG' | 'RESEARCH_PAPER' | 'FLIPBOOK' | 'PRESENTATION'
          userId: string
          thumbnailUrl?: string | null
          createdAt?: string
          updatedAt?: string
          isPublic?: boolean
          documentType: string
        }
        Update: {
          id?: string
          title?: string
          type?: 'NOTE' | 'DOCUMENT' | 'DRAWING' | 'DESIGN' | 'STICKY_NOTES' | 'MIND_MAP' | 'RAG' | 'RESEARCH_PAPER' | 'FLIPBOOK' | 'PRESENTATION'
          userId?: string
          thumbnailUrl?: string | null
          createdAt?: string
          updatedAt?: string
          isPublic?: boolean
          documentType?: string
        }
      }
      Presentation: {
        Row: {
          id: string
          content: any
          theme: string
          imageModel: string | null
          presentationStyle: string | null
          language: string | null
          outline: string[]
          templateId: string | null
          customThemeId: string | null
        }
        Insert: {
          id: string
          content: any
          theme?: string
          imageModel?: string | null
          presentationStyle?: string | null
          language?: string | null
          outline?: string[]
          templateId?: string | null
          customThemeId?: string | null
        }
        Update: {
          id?: string
          content?: any
          theme?: string
          imageModel?: string | null
          presentationStyle?: string | null
          language?: string | null
          outline?: string[]
          templateId?: string | null
          customThemeId?: string | null
        }
      }
      CustomTheme: {
        Row: {
          id: string
          name: string
          description: string | null
          userId: string
          logoUrl: string | null
          isPublic: boolean
          createdAt: string
          updatedAt: string
          themeData: any
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          userId: string
          logoUrl?: string | null
          isPublic?: boolean
          createdAt?: string
          updatedAt?: string
          themeData: any
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          userId?: string
          logoUrl?: string | null
          isPublic?: boolean
          createdAt?: string
          updatedAt?: string
          themeData?: any
        }
      }
      FavoriteDocument: {
        Row: {
          id: string
          documentId: string
          userId: string
        }
        Insert: {
          id?: string
          documentId: string
          userId: string
        }
        Update: {
          id?: string
          documentId?: string
          userId?: string
        }
      }
      GeneratedImage: {
        Row: {
          id: string
          url: string
          createdAt: string
          updatedAt: string
          userId: string
          prompt: string
        }
        Insert: {
          id?: string
          url: string
          createdAt?: string
          updatedAt?: string
          userId: string
          prompt: string
        }
        Update: {
          id?: string
          url?: string
          createdAt?: string
          updatedAt?: string
          userId?: string
          prompt?: string
        }
      }
      password_reset_tokens: {
        Row: {
          id: string
          user_id: string
          email: string
          token: string
          expires_at: string
          used: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          token: string
          expires_at: string
          used?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          token?: string
          expires_at?: string
          used?: boolean
          created_at?: string
        }
      }
    }
  }
}
