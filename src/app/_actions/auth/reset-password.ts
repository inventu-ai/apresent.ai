'use server';

import { supabaseAdmin } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

interface ResetPasswordResult {
  success: boolean;
  message: string;
}

export async function resetPassword(
  tokenId: string,
  email: string,
  newPassword: string
): Promise<ResetPasswordResult> {
  try {
    // Validar inputs
    if (!tokenId || !email || !newPassword) {
      return {
        success: false,
        message: 'Todos os campos são obrigatórios'
      };
    }

    if (newPassword.length < 6) {
      return {
        success: false,
        message: 'A senha deve ter pelo menos 6 caracteres'
      };
    }

    // Verificar se o token ainda é válido
    const { data: token, error: tokenError } = await supabaseAdmin
      .from('password_reset_tokens')
      .select('*')
      .eq('id', tokenId)
      .eq('email', email.toLowerCase())
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (tokenError || !token) {
      return {
        success: false,
        message: 'Token inválido ou expirado'
      };
    }

    // Buscar o usuário
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('id', token.user_id)
      .single();

    if (userError || !user) {
      return {
        success: false,
        message: 'Usuário não encontrado'
      };
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Atualizar a senha do usuário
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ 
        password: hashedPassword,
        updatedAt: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating password:', updateError);
      return {
        success: false,
        message: 'Erro ao atualizar senha'
      };
    }

    // Marcar o token como usado
    await supabaseAdmin
      .from('password_reset_tokens')
      .update({ used: true })
      .eq('id', tokenId);

    // Invalidar todos os outros tokens do usuário
    await supabaseAdmin
      .from('password_reset_tokens')
      .update({ used: true })
      .eq('user_id', user.id)
      .eq('used', false);

    return {
      success: true,
      message: 'Senha redefinida com sucesso'
    };

  } catch (error) {
    console.error('Error in resetPassword:', error);
    return {
      success: false,
      message: 'Erro interno do servidor'
    };
  }
}
