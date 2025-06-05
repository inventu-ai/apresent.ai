# Correção do Trigger updatedAt

## Problema
O erro `record "new" has no field "updated_at"` ocorre porque o trigger está tentando acessar um campo com nome incorreto.

## Solução
Execute o seguinte SQL no seu banco Supabase para corrigir o trigger:

### Opção 1: Executar via Supabase Dashboard
1. Acesse o Supabase Dashboard
2. Vá para SQL Editor
3. Execute o conteúdo do arquivo `fix_trigger.sql`

### Opção 2: Executar via CLI
```bash
# Se você tem o Supabase CLI instalado
supabase db reset
# ou
psql -h [seu-host] -U [seu-usuario] -d [seu-banco] -f fix_trigger.sql
```

### Opção 3: Comandos SQL Individuais
Execute estes comandos no SQL Editor do Supabase:

```sql
-- 1. Corrigir a função do trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 2. Recriar os triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_base_document_updated_at ON "BaseDocument";
DROP TRIGGER IF EXISTS update_custom_theme_updated_at ON "CustomTheme";
DROP TRIGGER IF EXISTS update_generated_image_updated_at ON "GeneratedImage";

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_base_document_updated_at 
    BEFORE UPDATE ON "BaseDocument" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_theme_updated_at 
    BEFORE UPDATE ON "CustomTheme" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_generated_image_updated_at 
    BEFORE UPDATE ON "GeneratedImage" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Verificação
Após executar a correção, teste criando uma nova apresentação. O erro deve desaparecer e as apresentações devem ser salvas corretamente no banco de dados.

## Arquivos Atualizados
- `fix_trigger.sql` - Script de correção
- `supabase_setup.sql` - Arquivo principal atualizado com a correção
