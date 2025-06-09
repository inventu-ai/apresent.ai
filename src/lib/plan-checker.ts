import { supabaseAdmin } from "./supabase";

/**
 * Busca o plano atual do usuário.
 */
export async function getUserCurrentPlan(userId: string) {
  const { data: user, error } = await supabaseAdmin
    .from("users")
    .select("currentPlanId")
    .eq("id", userId)
    .single();

  if (error || !user?.currentPlanId) {
    // fallback: FREE
    const { data: plan } = await supabaseAdmin
      .from("Plan")
      .select("*")
      .eq("name", "FREE")
      .single();
    return plan;
  }

  const { data: plan } = await supabaseAdmin
    .from("Plan")
    .select("*")
    .eq("id", user.currentPlanId)
    .single();

  return plan;
}

/**
 * Busca o valor do limite de um tipo específico para o plano do usuário.
 */
export async function getPlanLimit(userId: string, limitType: string) {
  const plan = await getUserCurrentPlan(userId);
  if (!plan?.id) return { limit: 0, isUnlimited: false };

  const { data: limit } = await supabaseAdmin
    .from("PlanLimit")
    .select("limitValue,isUnlimited")
    .eq("planId", plan.id)
    .eq("limitType", limitType)
    .single();

  return {
    limit: limit?.limitValue ?? 0,
    isUnlimited: !!limit?.isUnlimited,
  };
}

/**
 * Verifica se o usuário pode realizar uma ação baseada no limite.
 * Exemplo: checkUserLimit(userId, "max_cards", 1)
 */
export async function checkUserLimit(userId: string, limitType: string, requested = 1) {
  const { limit, isUnlimited } = await getPlanLimit(userId, limitType);

  if (isUnlimited) return { allowed: true, limit, isUnlimited, current: 0 };

  // Buscar uso atual
  const { data: usage } = await supabaseAdmin
    .from("UserUsage")
    .select("usageValue")
    .eq("userId", userId)
    .eq("usageType", limitType)
    .single();

  const current = usage?.usageValue ?? 0;
  const allowed = current + requested <= limit;

  return { allowed, limit, current, isUnlimited };
}

/**
 * Incrementa o uso do usuário para um tipo de limite.
 */
export async function incrementUserUsage(userId: string, usageType: string, amount = 1) {
  // Tenta atualizar, se não existir, cria
  const { data: usage, error } = await supabaseAdmin
    .from("UserUsage")
    .select("id,usageValue")
    .eq("userId", userId)
    .eq("usageType", usageType)
    .single();

  if (usage) {
    await supabaseAdmin
      .from("UserUsage")
      .update({ usageValue: usage.usageValue + amount })
      .eq("id", usage.id);
  } else {
    await supabaseAdmin
      .from("UserUsage")
      .insert({
        userId,
        usageType,
        usageValue: amount,
      });
  }
}

/**
 * Verifica se o usuário tem uma feature habilitada no plano.
 */
export async function hasPlanFeature(userId: string, featureKey: string) {
  const plan = await getUserCurrentPlan(userId);
  if (!plan?.id) return false;

  const { data: feature } = await supabaseAdmin
    .from("PlanFeature")
    .select("isEnabled")
    .eq("planId", plan.id)
    .eq("featureKey", featureKey)
    .single();

  return !!feature?.isEnabled;
}
