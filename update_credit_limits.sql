d-- =====================================================
-- ATUALIZAÇÃO DOS LIMITES DE CRÉDITOS
-- =====================================================
-- Execute este script no Supabase Dashboard → SQL Editor

-- Verificar valores atuais antes da alteração
SELECT 
    p.name as plano, 
    pl."limitValue" as limite_atual, 
    pl."isUnlimited" as eh_ilimitado
FROM "Plan" p
JOIN "PlanLimit" pl ON p.id = pl."planId"
WHERE pl."limitType" = 'ai_credits'
ORDER BY p.name;

-- =====================================================
-- APLICAR NOVOS LIMITES
-- =====================================================

-- FREE: 500 → 200 créditos
UPDATE "PlanLimit" 
SET "limitValue" = 200
WHERE "limitType" = 'ai_credits' 
AND "planId" = (SELECT id FROM "Plan" WHERE name = 'FREE');

-- PRO: 2000 → 800 créditos  
UPDATE "PlanLimit" 
SET "limitValue" = 800
WHERE "limitType" = 'ai_credits' 
AND "planId" = (SELECT id FROM "Plan" WHERE name = 'PRO');

-- PREMIUM: ilimitado → 3000 créditos (MUDANÇA IMPORTANTE!)
UPDATE "PlanLimit" 
SET "limitValue" = 3000, "isUnlimited" = false
WHERE "limitType" = 'ai_credits' 
AND "planId" = (SELECT id FROM "Plan" WHERE name = 'PREMIUM');

-- =====================================================
-- VERIFICAR ALTERAÇÕES
-- =====================================================

-- Conferir se as alterações foram aplicadas
SELECT 
    p.name as plano, 
    pl."limitValue" as novo_limite, 
    pl."isUnlimited" as eh_ilimitado
FROM "Plan" p
JOIN "PlanLimit" pl ON p.id = pl."planId"
WHERE pl."limitType" = 'ai_credits'
ORDER BY p.name;

-- Resultado esperado:
-- FREE: 200, false
-- PRO: 800, false  
-- PREMIUM: 3000, false

-- =====================================================
-- OPCIONAL: RESETAR USUÁRIOS EXISTENTES
-- =====================================================

-- DESCOMENTE SE QUISER RESETAR TODOS OS USUÁRIOS PARA 0 CRÉDITOS USADOS
-- (Recomendado para evitar usuários "negativos")

-- UPDATE "UserUsage" 
-- SET "usageValue" = 0, "lastReset" = NOW()
-- WHERE "usageType" = 'ai_credits';

-- UPDATE users 
-- SET "lastCreditReset" = NOW(),
--     "nextCreditReset" = (NOW() + INTERVAL '30 days');

-- =====================================================
-- ANÁLISE DE IMPACTO (OPCIONAL)
-- =====================================================

-- Ver quantos usuários serão afetados
SELECT 
    p.name as plano,
    COUNT(u.id) as total_usuarios,
    AVG(COALESCE(uu."usageValue", 0)) as media_uso_atual,
    MAX(COALESCE(uu."usageValue", 0)) as max_uso_atual
FROM users u
JOIN "Plan" p ON u."currentPlanId" = p.id
LEFT JOIN "UserUsage" uu ON u.id = uu."userId" AND uu."usageType" = 'ai_credits'
GROUP BY p.name
ORDER BY p.name;

-- Usuários que ficariam "negativos" com novos limites
SELECT 
    p.name as plano,
    COUNT(*) as usuarios_afetados
FROM users u
JOIN "Plan" p ON u."currentPlanId" = p.id
JOIN "UserUsage" uu ON u.id = uu."userId" AND uu."usageType" = 'ai_credits'
WHERE uu."usageValue" > CASE 
    WHEN p.name = 'FREE' THEN 200
    WHEN p.name = 'PRO' THEN 800
    WHEN p.name = 'PREMIUM' THEN 3000
END
GROUP BY p.name
ORDER BY p.name;

-- =====================================================
-- SCRIPT EXECUTADO COM SUCESSO! 
-- =====================================================
-- Novos limites aplicados:
-- - FREE: 200 créditos/mês
-- - PRO: 800 créditos/mês  
-- - PREMIUM: 3000 créditos/mês
-- ===================================================== 