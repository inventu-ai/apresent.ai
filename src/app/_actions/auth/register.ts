"use server";
import "server-only";

import { supabaseAdmin } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import { z } from "zod";

const RegisterSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

export type RegisterFormData = z.infer<typeof RegisterSchema>;

export async function registerUser(data: RegisterFormData) {
  try {
    // Validate input
    const validatedData = RegisterSchema.parse(data);

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', validatedData.email)
      .single();

    if (existingUser) {
      return {
        success: false,
        error: "Este email já está cadastrado",
      };
    }

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Create user
    const { data: newUser, error: createError } = await supabaseAdmin
      .from('users')
      .insert({
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        hasAccess: true,
        role: 'USER',
      })
      .select('id, name, email, hasAccess, role')
      .single();

    if (createError) {
      console.error('Error creating user:', createError);
      return {
        success: false,
        error: "Erro ao criar conta. Tente novamente.",
      };
    }

    return {
      success: true,
      user: newUser,
      message: "Conta criada com sucesso! Você pode fazer login agora.",
    };
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message ?? "Dados inválidos",
        fieldErrors: error.flatten().fieldErrors,
      };
    }

    return {
      success: false,
      error: "Erro interno do servidor. Tente novamente.",
    };
  }
}

export async function checkEmailAvailability(email: string) {
  try {
    const { data: existingUser, error } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return {
      available: !existingUser,
    };
  } catch (error) {
    console.error('Error checking email availability:', error);
    return {
      available: false,
      error: "Erro ao verificar email",
    };
  }
}
