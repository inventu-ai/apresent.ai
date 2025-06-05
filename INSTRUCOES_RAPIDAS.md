# 🚨 CORREÇÃO URGENTE - Erro de Apresentações

## Problema
Erro: `record "new" has no field "updated_at"` + Sistema de créditos incompleto

## Solução em 4 Passos Simples

### ⚡ PASSO 1 (URGENTE - Resolve o erro imediato)
Execute no **Supabase Dashboard → SQL Editor**:
```sql
-- Arquivo: fix_trigger_simples.sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_base_document_updated_at ON "BaseDocument";
CREATE TRIGGER update_base_document_updated_at 
    BEFORE UPDATE ON "BaseDocument" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 📋 PASSO 2A (Criar tabelas)
Execute o arquivo: **`creditos_parte1_tabelas.sql`**

### 📋 PASSO 2B (Inserir dados)
Execute o arquivo: **`creditos_parte2_dados.sql`**

### 📋 PASSO 2C (Configurar usuários)
Execute o arquivo: **`creditos_parte3_usuarios.sql`**

## ✅ Verificação
Após executar todos os passos, teste criando uma apresentação.

## 🔧 Se ainda der erro
Execute este comando para verificar se o usuário tem plano:
```sql
SELECT email, "currentPlanId" FROM users WHERE email = 'SEU_EMAIL';
```

Se retornar `null` no `currentPlanId`, execute:
```sql
UPDATE users 
SET "currentPlanId" = (SELECT id FROM "Plan" WHERE name = 'FREE')
WHERE email = 'SEU_EMAIL';
```

## 📁 Arquivos Criados
- `fix_trigger_simples.sql` - Correção urgente do trigger
- `creditos_parte1_tabelas.sql` - Tabelas do sistema
- `creditos_parte2_dados.sql` - Dados dos planos
- `creditos_parte3_usuarios.sql` - Configuração de usuários

## 🎯 Resultado Final
- ✅ Apresentações serão salvas corretamente
- ✅ Sistema de créditos funcionará (500 créditos/mês no plano FREE)
- ✅ Limite de 10 cards por apresentação
- ✅ Reset automático a cada 30 dias

**Execute os arquivos na ordem: 1 → 2A → 2B → 2C**
