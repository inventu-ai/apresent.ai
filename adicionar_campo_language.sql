-- Adicionar campo language na tabela users se não existir
ALTER TABLE users ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'pt-BR';

-- Atualizar usuários existentes que não têm idioma definido
UPDATE users 
SET language = 'pt-BR' 
WHERE language IS NULL;

-- Verificar se o campo foi adicionado corretamente
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'language';
