-- =====================================================
-- RESET IMEDIATO DE CRÉDITOS - EMERGENCIAL
-- =====================================================
-- Execute este script para resolver usuários "negativos"

-- Resetar todos os usuários para 0 créditos usados
UPDATE "UserUsage" 
SET "usageValue" = 0, "lastReset" = NOW()
WHERE "usageType" = 'ai_credits';

-- Atualizar próximo reset para todos os usuários
UPDATE users 
SET "lastCreditReset" = NOW(),
    "nextCreditReset" = (NOW() + INTERVAL '30 days');

-- Verificar resultado
SELECT 
    p.name as plano,
    COUNT(u.id) as total_usuarios,
    AVG(COALESCE(uu."usageValue", 0)) as media_uso_atual
FROM users u
JOIN "Plan" p ON u."currentPlanId" = p.id
LEFT JOIN "UserUsage" uu ON u.id = uu."userId" AND uu."usageType" = 'ai_credits'
GROUP BY p.name
ORDER BY p.name;

-- Resultado esperado: media_uso_atual = 0 para todos os planos 