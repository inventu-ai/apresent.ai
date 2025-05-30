'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { verifyResetCode } from '@/lib/email';

interface VerifyResetCodeResult {
  success: boolean;
  message: string;
  tokenId?: string;
}

export async function verifyResetCodeAction(
  email: string, 
  code: string
): Promise<VerifyResetCodeResult> {
  try {
    // Validar inputs
    if (!email || !code) {
      return {
        success: false,
        message: 'Email e código são obrigatórios'
      };
    }

    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      return {
        success: false,
        message: 'Código deve ter 6 dígitos'
      };
    }

    // Buscar tokens válidos para este email
    const { data: tokens, error: tokenError } = await supabaseAdmin
      .from('password_reset_tokens')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (tokenError) {
      console.error('Error fetching tokens:', tokenError);
      return {
        success: false,
        message: 'Erro interno do servidor'
      };
    }

    if (!tokens || tokens.length === 0) {
      return {
        success: false,
        message: 'Código inválido ou expirado'
      };
    }

    // Verificar o código contra todos os tokens válidos
    let validToken: any = null;
    for (const token of tokens) {
      const isValid = await verifyResetCode(code, token.token);
      if (isValid) {
        validToken = token;
        break;
      }
    }

    if (!validToken) {
      return {
        success: false,
        message: 'Código inválido'
      };
    }

    // Verificar se o token não expirou (double check)
    const now = new Date();
    const expiresAt = new Date(validToken.expires_at);
    
    if (now > expiresAt) {
      return {
        success: false,
        message: 'Código expirado. Solicite um novo código.'
      };
    }

    return {
      success: true,
      message: 'Código verificado com sucesso',
      tokenId: validToken.id
    };

  } catch (error) {
    console.error('Error in verifyResetCodeAction:', error);
    return {
      success: false,
      message: 'Erro interno do servidor'
    };
  }
}
