import { type Adapter } from "next-auth/adapters";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { env } from "@/env";
import { supabaseAdmin } from "@/lib/supabase";
import { SupabaseAdapter } from "@/lib/supabase-adapter";
import NextAuth, { type Session, type DefaultSession } from "next-auth";
import bcrypt from "bcryptjs";
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      hasAccess: boolean;
      location?: string;
      role: string;
      isAdmin: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    hasAccess: boolean;
    role: string;
  }
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.hasAccess = user.hasAccess;
        token.name = user.name;
        token.image = user.image;
        token.picture = user.image;
        token.location = (user as Session["user"]).location;
        token.role = user.role;
        token.isAdmin = user.role === "ADMIN";
      }

      // Handle updates
      if (trigger === "update" && (session as Session)?.user) {
        const { data: user } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('id', token.id as string)
          .single();
        
        console.log("Session", session, user);
        if (session) {
          token.name = (session as Session).user.name;
          token.image = (session as Session).user.image;
          token.picture = (session as Session).user.image;
          token.location = (session as Session).user.location;
          token.role = (session as Session).user.role;
          token.isAdmin = (session as Session).user.role === "ADMIN";
        }
        if (user) {
          token.hasAccess = user?.hasAccess ?? false;
          token.role = user.role;
          token.isAdmin = user.role === "ADMIN";
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.hasAccess = token.hasAccess as boolean;
      session.user.location = token.location as string;
      session.user.role = token.role as string;
      session.user.isAdmin = token.role === "ADMIN";
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const { data: dbUser } = await supabaseAdmin
          .from('users')
          .select('id, hasAccess, role')
          .eq('email', user.email!)
          .single();

        if (dbUser) {
          user.hasAccess = dbUser.hasAccess;
          user.role = dbUser.role;
        } else {
          user.hasAccess = false;
          user.role = "USER";
        }
      }
      
      // For credentials provider, user is already set up in the authorize function
      if (account?.provider === "credentials") {
        user.hasAccess = true;
      }

      return true;
    },
  },

  adapter: SupabaseAdapter() as Adapter,
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "exemplo@email.com" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        // Simple validation - password must be at least 6 characters
        if (password.length < 6) {
          return null;
        }

        // Check if user exists in database
        const { data: user } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('email', email)
          .single();

        if (!user) {
          // User doesn't exist - return null to deny login
          return null;
        }

        // User exists - verify password
        if (!user.password) {
          // User exists but has no password (maybe OAuth only) - deny login
          return null;
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          // Invalid password - deny login
          return null;
        }

        // Valid credentials - allow login
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          hasAccess: user.hasAccess,
          role: user.role,
        };
      },
    }),
  ],
});
