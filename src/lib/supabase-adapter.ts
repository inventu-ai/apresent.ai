import type { Adapter } from "next-auth/adapters"
import { supabaseAdmin } from "./supabase"

export function SupabaseAdapter(): Adapter {
  return {
    async createUser(user) {
      const { data, error } = await supabaseAdmin
        .from('users')
        .insert({
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified?.toISOString(),
          image: user.image,
        })
        .select()
        .single()

      if (error) throw error
      return {
        ...data,
        id: data.id,
        emailVerified: data.emailVerified ? new Date(data.emailVerified) : null,
      }
    },

    async getUser(id) {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', id)
        .single()

      if (error) return null
      return {
        ...data,
        emailVerified: data.emailVerified ? new Date(data.emailVerified) : null,
      }
    },

    async getUserByEmail(email) {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (error) return null
      return {
        ...data,
        emailVerified: data.emailVerified ? new Date(data.emailVerified) : null,
      }
    },

    async getUserByAccount({ providerAccountId, provider }) {
      const { data, error } = await supabaseAdmin
        .from('accounts')
        .select(`
          *,
          users (*)
        `)
        .eq('provider', provider)
        .eq('providerAccountId', providerAccountId)
        .single()

      if (error) return null
      
      const user = Array.isArray(data.users) ? data.users[0] : data.users
      return {
        ...user,
        emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
      }
    },

    async updateUser(user) {
      const { data, error } = await supabaseAdmin
        .from('users')
        .update({
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified?.toISOString(),
          image: user.image,
        })
        .eq('id', user.id!)
        .select()
        .single()

      if (error) throw error
      return {
        ...data,
        emailVerified: data.emailVerified ? new Date(data.emailVerified) : null,
      }
    },

    async deleteUser(userId) {
      const { error } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', userId)

      if (error) throw error
    },

    async linkAccount(account) {
      const { data, error } = await supabaseAdmin
        .from('accounts')
        .insert({
          userId: account.userId,
          type: account.type,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          refresh_token: account.refresh_token,
          access_token: account.access_token,
          expires_at: account.expires_at,
          token_type: account.token_type,
          scope: account.scope,
          id_token: account.id_token,
          session_state: account.session_state,
          refresh_token_expires_in: account.refresh_token_expires_in,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },

    async unlinkAccount({ providerAccountId, provider }) {
      const { error } = await supabaseAdmin
        .from('accounts')
        .delete()
        .eq('provider', provider)
        .eq('providerAccountId', providerAccountId)

      if (error) throw error
    },

    async createSession({ sessionToken, userId, expires }) {
      // Note: Supabase handles sessions differently, so we'll return a mock session
      // In a real implementation, you might want to store sessions in a separate table
      return {
        sessionToken,
        userId,
        expires,
      }
    },

    async getSessionAndUser(sessionToken) {
      // Note: This is a simplified implementation
      // In a real app, you'd store and retrieve sessions from Supabase
      return null
    },

    async updateSession({ sessionToken, expires, userId }) {
      // Note: This is a simplified implementation
      // In a real app, you'd store and retrieve sessions from Supabase
      return null
    },

    async deleteSession(sessionToken) {
      // Note: This is a simplified implementation
      return
    },

    async createVerificationToken({ identifier, expires, token }) {
      // Note: You might want to implement this with a verification_tokens table
      return {
        identifier,
        expires,
        token,
      }
    },

    async useVerificationToken({ identifier, token }) {
      // Note: You might want to implement this with a verification_tokens table
      return null
    },
  }
}
