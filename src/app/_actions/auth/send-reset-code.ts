'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { 
  generateResetCode, 
  hashResetCode, 
  sendPasswordResetEmail 
} from '@/lib/email';

interface SendResetCodeResult {
  success: boolean;
  message: string;
}

export async function sendResetCode(email: string): Promise<SendResetCodeResult> {
  try {
    // Validar email
    if (!email || !email.includes('@')) {
      return {
        success: false,
        message: 'Email inválido'
      };
    }

    // Verificar se o usuário existe
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('email', email.toLowerCase())
      .single();

    if (userError || !user) {
      return {
        success: false,
        message: 'Email não encontrado em nosso sistema'
      };
    }

    // Verificar rate limiting - máximo 3 tentativas por hora
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { data: recentTokens, error: tokenError } = await supabaseAdmin
      .from('password_reset_tokens')
      .select('id')
      .eq('email', email.toLowerCase())
      .gte('created_at', oneHourAgo);

    if (tokenError) {
      console.error('Error checking recent tokens:', tokenError);
      return {
        success: false,
        message: 'Erro interno do servidor'
      };
    }

    if (recentTokens && recentTokens.length >= 3) {
      return {
        success: false,
        message: 'Muitas tentativas. Tente novamente em 1 hora.'
      };
    }

    // Invalidar tokens anteriores não utilizados
    await supabaseAdmin
      .from('password_reset_tokens')
      .update({ used: true })
      .eq('user_id', user.id)
      .eq('used', false);

    // Gerar novo código
    const resetCode = generateResetCode();
    const hashedCode = await hashResetCode(resetCode);
    
    // Definir expiração em 15 minutos
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    // Salvar token no banco
    const { error: insertError } = await supabaseAdmin
      .from('password_reset_tokens')
      .insert({
        user_id: user.id,
        email: email.toLowerCase(),
        token: hashedCode,
        expires_at: expiresAt,
        used: false
      });

    if (insertError) {
      console.error('Error inserting reset token:', insertError);
      return {
        success: false,
        message: 'Erro ao gerar código de verificação'
      };
    }

    // Enviar email
    const emailResult = await sendPasswordResetEmail(email, resetCode);
    
    if (!emailResult.success) {
      console.error('Error sending email:', emailResult.error);
      return {
        success: false,
        message: 'Erro ao enviar email. Tente novamente.'
      };
    }

    return {
      success: true,
      message: 'Código de verificação enviado para seu email'
    };

  } catch (error) {
    console.error('Error in sendResetCode:', error);
    return {
      success: false,
      message: 'Erro interno do servidor'
    };
  }
}
