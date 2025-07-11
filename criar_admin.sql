-- =====================================================
-- SCRIPT PARA CRIAR USUÁRIOS ADMIN
-- =====================================================
-- Execute este script no Supabase Dashboard → SQL Editor

-- 1. Verificar usuários existentes
SELECT email, role, name FROM users ORDER BY email;

-- 2. Promover usuário existente para ADMIN
-- SUBSTITUA 'seu-email@exemplo.com' pelo email real
UPDATE users 
SET role = 'ADMIN' 
WHERE email = 'seu-email@exemplo.com';

-- 3. Verificar se funcionou
SELECT email, role, name FROM users WHERE role = 'ADMIN';

-- =====================================================
-- COMANDOS ALTERNATIVOS
-- =====================================================

-- Promover múltiplos usuários para ADMIN
-- UPDATE users 
-- SET role = 'ADMIN' 
-- WHERE email IN ('admin1@exemplo.com', 'admin2@exemplo.com');

-- Despromover ADMIN para usuário normal
-- UPDATE users 
-- SET role = 'USER' 
-- WHERE email = 'ex-admin@exemplo.com';

-- Verificar todos os ADMINs
-- SELECT email, role, name, "createdAt" FROM users WHERE role = 'ADMIN';

-- =====================================================
-- RESULTADO ESPERADO
-- =====================================================
-- Após executar, o usuário especificado:
-- ✅ Terá role = 'ADMIN'
-- ✅ Verá badges "👑 ADMIN" e "∞ Créditos Ilimitados"
-- ✅ Poderá usar o sistema sem gastar créditos
-- ✅ Terá acesso a todos os modelos e qualidades
-- ✅ Não terá limite de cards por apresentação

-- =====================================================
-- SEGURANÇA
-- =====================================================
-- ⚠️ IMPORTANTE: Use com cuidado!
-- ⚠️ Apenas promova usuários confiáveis
-- ⚠️ ADMINs têm acesso ilimitado ao sistema
-- ⚠️ Monitore o uso para evitar abusos 