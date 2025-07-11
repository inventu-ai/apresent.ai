import { supabaseAdmin } from "./supabase";
import { getUserCurrentPlan, getPlanLimit, incrementUserUsage, checkUserLimit } from "./plan-checker";
import { getModelsForPlan, isModelAvailableForPlan, getModelCreditCost, MODEL_CREDIT_MAPPING } from "./image-model-restrictions";
import type { ImageModelList } from "@/app/_actions/image/generate";

// Custos por ação em créditos - NOVOS VALORES
export const CREDIT_COSTS = {
  // Apresentação completa
  PRESENTATION_CREATION: 40,  // Criar apresentação completa com imagens
  
  // Imagens
  IMAGE_GENERATION: 5,        // Gerar nova imagem ou regenerar
  IMAGE_EDITING: 20,          // Editar imagem com IA
  
  // Slides e conteúdo
  SLIDE_GENERATION: 5,        // Gerar slide com IA
  TOPIC_REGENERATION: 2,      // Regenerar tópico
  CARD_GENERATION: 2,         // Gerar novo card com IA
  
  // Mantidos para compatibilidade com sistema de modelos
  BASIC_IMAGE: 5,
  ADVANCED_IMAGE: 10,
  PREMIUM_IMAGE: 15,
} as const;

export type CreditAction = keyof typeof CREDIT_COSTS;

// Qualidades de imagem disponíveis por plano
export const IMAGE_QUALITY_BY_PLAN = {
  FREE: ['BASIC_IMAGE'] as CreditAction[],
  PRO: ['BASIC_IMAGE', 'ADVANCED_IMAGE'] as CreditAction[],
  PREMIUM: ['BASIC_IMAGE', 'ADVANCED_IMAGE', 'PREMIUM_IMAGE'] as CreditAction[],
};

// Máximo de cards por plano
export const MAX_CARDS_BY_PLAN = {
  FREE: 10,
  PRO: 20,
  PREMIUM: 30,
} as const;

/**
 * 🔥 NOVA FUNÇÃO: Verifica se o usuário é ADMIN
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Erro ao verificar role do usuário:', error);
      return false;
    }
    
    return user?.role === 'ADMIN';
  } catch (error) {
    console.error('Erro ao verificar se usuário é admin:', error);
    return false;
  }
}

/**
 * Verifica se o usuário pode consumir créditos para uma ação
 * 🔥 MODIFICADO: ADMINs têm créditos ilimitados
 */
export async function canConsumeCredits(
  userId: string, 
  action: CreditAction, 
  amount: number = 1
): Promise<{
  allowed: boolean;
  cost: number;
  currentCredits: number;
  creditLimit: number;
  isUnlimited: boolean;
  isAdmin?: boolean;
  message?: string;
}> {
  const cost = CREDIT_COSTS[action] * amount;
  
  // 🔥 NOVA VERIFICAÇÃO: Se é ADMIN, sempre permitir
  const isAdmin = await isUserAdmin(userId);
  
  if (isAdmin) {
    return {
      allowed: true,
      cost: 0, // ADMINs não pagam créditos
      currentCredits: 0,
      creditLimit: Infinity,
      isUnlimited: true,
      isAdmin: true,
      message: 'Créditos ilimitados (ADMIN)'
    };
  }
  
  // Verificar limite de créditos para usuários normais
  const creditCheck = await checkUserLimit(userId, 'ai_credits', cost);
  
  return {
    allowed: creditCheck.allowed,
    cost,
    currentCredits: creditCheck.current || 0,
    creditLimit: creditCheck.limit || 0,
    isUnlimited: creditCheck.isUnlimited || false,
    isAdmin: false,
    message: creditCheck.allowed ? undefined : 'Créditos insuficientes'
  };
}

/**
 * Consome créditos do usuário para uma ação
 * 🔥 MODIFICADO: ADMINs não consomem créditos
 */
export async function consumeCredits(
  userId: string, 
  action: CreditAction, 
  amount: number = 1
): Promise<{
  success: boolean;
  creditsUsed: number;
  remainingCredits: number;
  isAdmin?: boolean;
  message?: string;
}> {
  const cost = CREDIT_COSTS[action] * amount;
  
  // 🔥 NOVA VERIFICAÇÃO: Se é ADMIN, não consumir créditos
  const isAdmin = await isUserAdmin(userId);
  
  if (isAdmin) {
    return {
      success: true,
      creditsUsed: 0, // ADMINs não consomem créditos
      remainingCredits: Infinity,
      isAdmin: true,
      message: 'Ação executada sem consumir créditos (ADMIN)'
    };
  }
  
  // Verificar se pode consumir (usuários normais)
  const canConsume = await canConsumeCredits(userId, action, amount);
  
  if (!canConsume.allowed) {
    return {
      success: false,
      creditsUsed: 0,
      remainingCredits: canConsume.currentCredits,
      isAdmin: false,
      message: canConsume.message
    };
  }
  
  // Consumir créditos (usuários normais)
  await incrementUserUsage(userId, 'ai_credits', cost);
  
  const remainingCredits = canConsume.isUnlimited 
    ? Infinity 
    : canConsume.creditLimit - (canConsume.currentCredits + cost);
  
  return {
    success: true,
    creditsUsed: cost,
    remainingCredits: Math.max(0, remainingCredits),
    isAdmin: false,
    message: `${cost} créditos consumidos`
  };
}

/**
 * Obtém informações de créditos do usuário com verificação automática de reset
 * 🔥 MODIFICADO: ADMINs mostram créditos ilimitados
 */
export async function getUserCredits(userId: string): Promise<{
  current: number;
  limit: number;
  isUnlimited: boolean;
  remaining: number;
  percentage: number;
  nextReset: Date | null;
  daysUntilReset: number;
  isAdmin?: boolean;
  wasReset?: boolean;
}> {
  // 🔥 NOVA VERIFICAÇÃO: Se é ADMIN, retornar valores ilimitados
  const isAdmin = await isUserAdmin(userId);
  
  if (isAdmin) {
    return {
      current: 0,
      limit: Infinity,
      isUnlimited: true,
      remaining: Infinity,
      percentage: 0,
      nextReset: null,
      daysUntilReset: 0,
      isAdmin: true,
      wasReset: false
    };
  }
  
  // Verificar se precisa resetar créditos (usuários normais)
  const resetCheck = await checkAndResetCreditsIfNeeded(userId);
  
  const { limit, isUnlimited } = await getPlanLimit(userId, 'ai_credits');
  const { current } = await checkUserLimit(userId, 'ai_credits', 0);
  
  // Buscar próxima data de reset
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('nextCreditReset')
    .eq('id', userId)
    .single();
  
  const nextReset = user?.nextCreditReset ? new Date(user.nextCreditReset) : null;
  const daysUntilReset = nextReset ? Math.ceil((nextReset.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
  
  const remaining = isUnlimited ? Infinity : Math.max(0, limit - current);
  const percentage = isUnlimited ? 0 : (current / limit) * 100;
  
  return {
    current,
    limit,
    isUnlimited,
    remaining,
    percentage,
    nextReset,
    daysUntilReset,
    isAdmin: false,
    wasReset: resetCheck.wasReset
  };
}

/**
 * Verifica se o usuário pode criar uma apresentação com X cards
 * 🔥 MODIFICADO: ADMINs podem criar quantos cards quiserem
 */
export async function canCreateCards(userId: string, cardCount: number): Promise<{
  allowed: boolean;
  maxCards: number;
  planName: string;
  isAdmin?: boolean;
  message?: string;
}> {
  // 🔥 NOVA VERIFICAÇÃO: Se é ADMIN, sempre permitir
  const isAdmin = await isUserAdmin(userId);
  
  if (isAdmin) {
    return {
      allowed: true,
      maxCards: Infinity,
      planName: 'ADMIN',
      isAdmin: true,
      message: 'Limite de cards ilimitado (ADMIN)'
    };
  }
  
  const plan = await getUserCurrentPlan(userId);
  const planName = plan?.name || 'FREE';
  const maxCards = MAX_CARDS_BY_PLAN[planName as keyof typeof MAX_CARDS_BY_PLAN] || 10;
  
  const allowed = cardCount <= maxCards;
  
  return {
    allowed,
    maxCards,
    planName,
    isAdmin: false,
    message: allowed ? undefined : `Seu plano ${planName} permite até ${maxCards} cards`
  };
}

/**
 * Verifica se o usuário pode usar uma qualidade de imagem
 * 🔥 MODIFICADO: ADMINs podem usar qualquer qualidade
 */
export async function canUseImageQuality(userId: string, quality: CreditAction): Promise<{
  allowed: boolean;
  planName: string;
  availableQualities: CreditAction[];
  isAdmin?: boolean;
  message?: string;
}> {
  // 🔥 NOVA VERIFICAÇÃO: Se é ADMIN, sempre permitir
  const isAdmin = await isUserAdmin(userId);
  
  if (isAdmin) {
    return {
      allowed: true,
      planName: 'ADMIN',
      availableQualities: ['BASIC_IMAGE', 'ADVANCED_IMAGE', 'PREMIUM_IMAGE'] as CreditAction[],
      isAdmin: true,
      message: 'Acesso a todas as qualidades (ADMIN)'
    };
  }
  
  const plan = await getUserCurrentPlan(userId);
  const planName = plan?.name || 'FREE';
  const availableQualities = IMAGE_QUALITY_BY_PLAN[planName as keyof typeof IMAGE_QUALITY_BY_PLAN] || ['BASIC_IMAGE'] as CreditAction[];
  
  const allowed = availableQualities.includes(quality);
  
  return {
    allowed,
    planName,
    availableQualities,
    isAdmin: false,
    message: allowed ? undefined : `Qualidade ${quality} não disponível no plano ${planName}`
  };
}

/**
 * Verifica se o usuário pode usar um modelo específico de imagem
 * 🔥 MODIFICADO: ADMINs podem usar qualquer modelo
 */
export async function canUseImageModel(userId: string, model: ImageModelList): Promise<{
  allowed: boolean;
  planName: string;
  availableModels: ImageModelList[];
  requiredPlan?: 'PRO' | 'PREMIUM';
  isAdmin?: boolean;
  message?: string;
}> {
  // 🔥 NOVA VERIFICAÇÃO: Se é ADMIN, sempre permitir
  const isAdmin = await isUserAdmin(userId);
  
  if (isAdmin) {
    // ADMINs têm acesso a todos os modelos
    const allModels = getModelsForPlan('PREMIUM'); // Pega todos os modelos mais avançados
    
    return {
      allowed: true,
      planName: 'ADMIN',
      availableModels: allModels,
      isAdmin: true,
      message: 'Acesso a todos os modelos (ADMIN)'
    };
  }
  
  // Verificação especial para Google Imagen
  if (model.includes('google-imagen')) {
    const isConfigured = !!(process.env.GOOGLE_CLOUD_PROJECT_ID && 
                           (process.env.GOOGLE_SERVICE_ACCOUNT_KEY || 
                            process.env.GOOGLE_APPLICATION_CREDENTIALS || 
                            process.env.NODE_ENV === 'production'));
    
    if (!isConfigured) {
      const plan = await getUserCurrentPlan(userId);
      const planName = plan?.name || 'FREE';
      const availableModels = getModelsForPlan(planName as 'FREE' | 'PRO' | 'PREMIUM');
      
      return {
        allowed: false,
        planName,
        availableModels,
        isAdmin: false,
        message: 'Google Imagen temporariamente indisponível. Credenciais não configuradas.'
      };
    }
  }

  const plan = await getUserCurrentPlan(userId);
  const planName = plan?.name || 'FREE';
  const availableModels = getModelsForPlan(planName as 'FREE' | 'PRO' | 'PREMIUM');
  
  const allowed = isModelAvailableForPlan(model, planName as 'FREE' | 'PRO' | 'PREMIUM');
  
  let requiredPlan: 'PRO' | 'PREMIUM' | undefined;
  if (!allowed) {
    // Determinar qual plano é necessário
    if (isModelAvailableForPlan(model, 'PRO')) {
      requiredPlan = 'PRO';
    } else if (isModelAvailableForPlan(model, 'PREMIUM')) {
      requiredPlan = 'PREMIUM';
    }
  }
  
  return {
    allowed,
    planName,
    availableModels,
    requiredPlan,
    isAdmin: false,
    message: allowed ? undefined : `Modelo ${model} requer plano ${requiredPlan || 'superior'}`
  };
}

/**
 * Consome créditos baseado no modelo de imagem usado
 */
export async function consumeImageModelCredits(userId: string, model: ImageModelList): Promise<{
  success: boolean;
  creditsUsed: number;
  remainingCredits: number;
  message?: string;
}> {
  // Verificar se o usuário pode usar este modelo
  const modelCheck = await canUseImageModel(userId, model);
  if (!modelCheck.allowed) {
    return {
      success: false,
      creditsUsed: 0,
      remainingCredits: 0,
      message: modelCheck.message
    };
  }
  
  // Obter custo do modelo
  const creditType = getModelCreditCost(model);
  const creditsNeeded = CREDIT_COSTS[creditType];
  
  // Consumir créditos usando a função existente
  return await consumeCredits(userId, creditType);
}

/**
 * Verifica se o usuário precisa de reset de créditos e executa se necessário
 */
export async function checkAndResetCreditsIfNeeded(userId: string): Promise<{
  wasReset: boolean;
  newCredits?: number;
  nextReset?: Date;
  message?: string;
}> {
  try {
    // Buscar dados do usuário
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, currentPlanId, lastCreditReset, nextCreditReset')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return { wasReset: false, message: 'Usuário não encontrado' };
    }

    const now = new Date();
    const nextReset = user.nextCreditReset ? new Date(user.nextCreditReset) : null;

    // Se não tem data de próximo reset ou já passou da data
    if (!nextReset || now >= nextReset) {
      const resetResult = await performCreditReset(userId);
      
      if (resetResult.success) {
        return {
          wasReset: true,
          newCredits: resetResult.newCredits,
          nextReset: resetResult.nextReset,
          message: 'Créditos resetados com sucesso'
        };
      }
    }

    return { wasReset: false };
  } catch (error) {
    console.error('Erro ao verificar reset de créditos:', error);
    return { wasReset: false, message: 'Erro na verificação' };
  }
}

/**
 * Executa o reset de créditos para um usuário
 */
export async function performCreditReset(userId: string): Promise<{
  success: boolean;
  previousCredits: number;
  newCredits: number;
  nextReset: Date;
  message?: string;
}> {
  try {
    // Buscar uso atual de créditos
    const { data: currentUsage } = await supabaseAdmin
      .from('UserUsage')
      .select('usageValue')
      .eq('userId', userId)
      .eq('usageType', 'ai_credits')
      .single();

    const previousCredits = currentUsage?.usageValue || 0;

    // Buscar plano atual para determinar novos créditos
    const plan = await getUserCurrentPlan(userId);
    const { limit: newCreditLimit } = await getPlanLimit(userId, 'ai_credits');

    const now = new Date();
    const nextReset = calculateNextResetDate(now);

    // Resetar créditos (zerar uso)
    const { error: resetError } = await supabaseAdmin
      .from('UserUsage')
      .upsert({
        userId,
        usageType: 'ai_credits',
        usageValue: 0,
        lastReset: now.toISOString(),
        resetPeriod: 'monthly'
      }, {
        onConflict: 'userId,usageType'
      });

    if (resetError) throw resetError;

    // Atualizar datas de reset no usuário
    const { error: userUpdateError } = await supabaseAdmin
      .from('users')
      .update({
        lastCreditReset: now.toISOString(),
        nextCreditReset: nextReset.toISOString()
      })
      .eq('id', userId);

    if (userUpdateError) throw userUpdateError;

    // Criar log do reset
    await logCreditReset(userId, previousCredits, newCreditLimit, plan?.name || 'FREE');

    console.log(`Credits reset for user ${userId}: ${previousCredits} -> ${newCreditLimit}`);

    return {
      success: true,
      previousCredits,
      newCredits: newCreditLimit,
      nextReset,
      message: 'Reset realizado com sucesso'
    };
  } catch (error) {
    console.error('Erro no reset de créditos:', error);
    return {
      success: false,
      previousCredits: 0,
      newCredits: 0,
      nextReset: new Date(),
      message: 'Erro no reset'
    };
  }
}

/**
 * Calcula a próxima data de reset (30 dias após a data atual)
 */
export function calculateNextResetDate(lastReset: Date): Date {
  const nextReset = new Date(lastReset);
  nextReset.setDate(nextReset.getDate() + 30);
  return nextReset;
}

/**
 * Cria log do reset de créditos
 */
export async function logCreditReset(
  userId: string,
  previousCredits: number,
  newCredits: number,
  planName: string
): Promise<void> {
  try {
    const { error } = await supabaseAdmin
      .from('CreditResetLog')
      .insert({
        userId,
        resetDate: new Date().toISOString(),
        previousCredits,
        newCredits,
        planName,
        resetReason: 'monthly_cycle'
      });

    if (error) {
      console.error('Erro ao criar log de reset:', error);
    }
  } catch (error) {
    console.error('Erro ao criar log de reset:', error);
  }
}

/**
 * Busca histórico de resets do usuário
 */
export async function getCreditResetHistory(userId: string, limit = 10): Promise<{
  success: boolean;
  history: any[];
  message?: string;
}> {
  try {
    const { data: history, error } = await supabaseAdmin
      .from('CreditResetLog')
      .select('*')
      .eq('userId', userId)
      .order('resetDate', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return {
      success: true,
      history: history || []
    };
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    return {
      success: false,
      history: [],
      message: 'Erro ao buscar histórico'
    };
  }
}

/**
 * Upgrade de plano com reset de créditos
 */
export async function upgradePlan(userId: string, newPlanId: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // Atualizar plano do usuário
    const { error: userError } = await supabaseAdmin
      .from('users')
      .update({
        currentPlanId: newPlanId,
        planStartDate: new Date().toISOString(),
        planEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // +30 dias
      })
      .eq('id', userId);
      
    if (userError) throw userError;
    
    // Resetar créditos para o novo plano
    const { error: resetError } = await supabaseAdmin
      .from('UserUsage')
      .upsert({
        userId,
        usageType: 'ai_credits',
        usageValue: 0,
        lastReset: new Date().toISOString(),
        resetPeriod: 'monthly'
      }, {
        onConflict: 'userId,usageType'
      });
      
    if (resetError) throw resetError;
    
    return {
      success: true,
      message: 'Plano atualizado com sucesso'
    };
  } catch (error) {
    console.error('Erro no upgrade:', error);
    return {
      success: false,
      message: 'Erro ao atualizar plano'
    };
  }
}

/**
 * Consome créditos para geração de imagem
 */
export async function consumeImageGenerationCredits(userId: string): Promise<{
  success: boolean;
  creditsUsed: number;
  remainingCredits: number;
  message?: string;
}> {
  return await consumeCredits(userId, 'IMAGE_GENERATION');
}

/**
 * Consome créditos para edição de imagem
 */
export async function consumeImageEditingCredits(userId: string): Promise<{
  success: boolean;
  creditsUsed: number;
  remainingCredits: number;
  message?: string;
}> {
  return await consumeCredits(userId, 'IMAGE_EDITING');
}

/**
 * Consome créditos para geração de slide
 */
export async function consumeSlideGenerationCredits(userId: string): Promise<{
  success: boolean;
  creditsUsed: number;
  remainingCredits: number;
  message?: string;
}> {
  return await consumeCredits(userId, 'SLIDE_GENERATION');
}

/**
 * Consome créditos para regeneração de tópico
 */
export async function consumeTopicRegenerationCredits(userId: string): Promise<{
  success: boolean;
  creditsUsed: number;
  remainingCredits: number;
  message?: string;
}> {
  return await consumeCredits(userId, 'TOPIC_REGENERATION');
}

/**
 * Consome créditos para geração de card
 */
export async function consumeCardGenerationCredits(userId: string): Promise<{
  success: boolean;
  creditsUsed: number;
  remainingCredits: number;
  message?: string;
}> {
  return await consumeCredits(userId, 'CARD_GENERATION');
}

/**
 * Consome créditos para criação de apresentação completa
 */
export async function consumePresentationCreationCredits(userId: string): Promise<{
  success: boolean;
  creditsUsed: number;
  remainingCredits: number;
  message?: string;
}> {
  return await consumeCredits(userId, 'PRESENTATION_CREATION');
}

/**
 * Verifica se o usuário pode executar uma ação específica
 */
export async function canExecuteAction(
  userId: string, 
  action: CreditAction
): Promise<{
  allowed: boolean;
  cost: number;
  currentCredits: number;
  creditLimit: number;
  isUnlimited: boolean;
  message?: string;
}> {
  return await canConsumeCredits(userId, action);
}
