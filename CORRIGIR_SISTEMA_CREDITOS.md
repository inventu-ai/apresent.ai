# Correção Completa do Sistema de Créditos

## Problema Identificado
O erro `record "new" has no field "updated_at"` e problemas de salvamento estão relacionados a dois problemas principais:

1. **Trigger SQL incorreto** - Tentando acessar campo com nome errado
2. **Tabelas do sistema de créditos ausentes** - Sistema tentando usar tabelas que não existem

## Solução Completa

### 1. Corrigir Trigger (URGENTE)
Execute no **Supabase Dashboard → SQL Editor**:

```sql
-- Corrigir função do trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Recriar trigger para BaseDocument
DROP TRIGGER IF EXISTS update_base_document_updated_at ON "BaseDocument";
CREATE TRIGGER update_base_document_updated_at 
    BEFORE UPDATE ON "BaseDocument" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 2. Criar Tabelas do Sistema de Créditos
Execute o arquivo **`credit_system_tables.sql`** no Supabase Dashboard.

Este arquivo criará:
- ✅ Tabela `Plan` (planos FREE, PRO, PREMIUM)
- ✅ Tabela `PlanLimit` (limites por plano)
- ✅ Tabela `PlanFeature` (features por plano)
- ✅ Tabela `UserUsage` (uso atual do usuário)
- ✅ Tabela `CreditResetLog` (histórico de resets)
- ✅ Campos adicionais na tabela `users`
- ✅ Políticas RLS e permissões
- ✅ Dados iniciais (planos e limites)

### 3. Configuração dos Planos

#### Plano FREE (Padrão):
- 500 créditos AI por mês
- Máximo 10 cards por apresentação
- Temas básicos
- Suporte padrão

#### Plano PRO:
- 2000 créditos AI por mês
- Máximo 20 cards por apresentação
- Temas avançados
- Suporte prioritário

#### Plano PREMIUM:
- Créditos AI ilimitados
- Máximo 30 cards por apresentação
- Temas customizados
- Suporte prioritário + White label

## Verificação Pós-Instalação

### 1. Verificar se as tabelas foram criadas:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('Plan', 'PlanLimit', 'PlanFeature', 'UserUsage', 'CreditResetLog');
```

### 2. Verificar se os planos foram inseridos:
```sql
SELECT * FROM "Plan";
```

### 3. Verificar se usuários têm plano atribuído:
```sql
SELECT id, email, "currentPlanId", "nextCreditReset" FROM users LIMIT 5;
```

### 4. Verificar limites dos planos:
```sql
SELECT p.name, pl."limitType", pl."limitValue", pl."isUnlimited"
FROM "Plan" p
JOIN "PlanLimit" pl ON p.id = pl."planId"
ORDER BY p.name, pl."limitType";
```

## Como o Sistema Funciona

### Verificação de Créditos:
1. **Ao criar apresentação**: Verifica se tem créditos suficientes (40 créditos)
2. **Ao gerar imagens**: Verifica créditos por imagem (varia por modelo)
3. **Reset automático**: A cada 30 dias os créditos são resetados

### Verificação de Limites:
1. **Max cards**: Verifica quantos slides pode criar por apresentação
2. **Features**: Verifica se tem acesso a temas avançados, etc.

### Fluxo de Uso:
```
Usuário cria apresentação → 
Verifica plano → 
Verifica créditos → 
Verifica limite de cards → 
Consome créditos → 
Salva apresentação
```

## Troubleshooting

### Se ainda der erro após aplicar as correções:

1. **Verificar logs do servidor** para erros específicos
2. **Verificar se o usuário tem plano atribuído**:
   ```sql
   SELECT "currentPlanId" FROM users WHERE id = 'USER_ID';
   ```
3. **Verificar se tem créditos**:
   ```sql
   SELECT * FROM "UserUsage" WHERE "userId" = 'USER_ID' AND "usageType" = 'ai_credits';
   ```
4. **Resetar créditos manualmente** se necessário:
   ```sql
   UPDATE "UserUsage" 
   SET "usageValue" = 0, "lastReset" = NOW()
   WHERE "userId" = 'USER_ID' AND "usageType" = 'ai_credits';
   ```

## Arquivos Relacionados

- `fix_trigger.sql` - Correção do trigger
- `credit_system_tables.sql` - Tabelas do sistema de créditos
- `supabase_setup.sql` - Schema principal (já corrigido)
- `src/lib/credit-system.ts` - Lógica do sistema de créditos
- `src/lib/plan-checker.ts` - Verificação de planos e limites

## Ordem de Execução

1. **Primeiro**: Execute `fix_trigger.sql` (corrige o erro imediato)
2. **Segundo**: Execute `credit_system_tables.sql` (cria sistema completo)
3. **Terceiro**: Teste criando uma apresentação

Após essas correções, o sistema deve funcionar completamente!
