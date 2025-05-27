# 🚀 Como Executar o Sistema

## ⚡ Execução Rápida (se já configurado)

```bash
# 1. Instalar dependências
pnpm install

# 2. Executar o sistema
pnpm dev

# 3. Acessar
http://localhost:3000
```

## 🔧 Primeira Configuração

### 1. Configurar Supabase

1. **Criar projeto no Supabase:**
   - Acesse [supabase.com](https://supabase.com)
   - Crie um novo projeto
   - Anote a senha do banco

2. **Obter credenciais:**
   - Vá em Settings → API
   - Copie: Project URL, anon key, service_role key

3. **Configurar banco:**
   - Vá em SQL Editor no Supabase
   - Execute o script `supabase_setup.sql`

### 2. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env
```

Editar `.env` com suas credenciais:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://seu-projeto.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sua-anon-key"
SUPABASE_SERVICE_ROLE_KEY="sua-service-role-key"

# NextAuth
NEXTAUTH_SECRET="sua-secret-key-aleatoria"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (opcional)
GOOGLE_CLIENT_ID="sua-google-client-id"
GOOGLE_CLIENT_SECRET="sua-google-client-secret"

# OpenAI (para IA)
OPENAI_API_KEY="sua-openai-key"
```

### 3. Executar

```bash
# Instalar dependências
pnpm install

# Executar em desenvolvimento
pnpm dev
```

## 🎯 Funcionalidades Disponíveis

### ✅ Autenticação
- **Login com Email/Senha**: Criar conta e fazer login
- **Login com Google**: OAuth integrado
- **Registro**: Página de criação de conta

### ✅ Apresentações
- **Criar apresentações**: Com IA
- **Editar slides**: Editor visual
- **Temas personalizados**: Cores, fontes, logos
- **Salvar/Carregar**: Persistência no Supabase

### ✅ Banco de Dados
- **Supabase**: Banco PostgreSQL na nuvem
- **Row Level Security**: Segurança por usuário
- **Backup automático**: Dados seguros

## 🔍 Verificar se Funcionou

1. **Acesse:** `http://localhost:3000`
2. **Teste login:** Crie uma conta ou use Google
3. **Crie apresentação:** Teste a funcionalidade principal
4. **Verifique Supabase:** Dados devem aparecer no dashboard

## 🛠️ Solução de Problemas

### Erro de conexão com Supabase:
- Verifique as URLs e chaves no `.env`
- Confirme se o projeto Supabase está ativo

### Erro de autenticação:
- Verifique `NEXTAUTH_SECRET` no `.env`
- Confirme se as tabelas foram criadas no Supabase

### Erro de build:
```bash
# Limpar cache e reinstalar
rm -rf node_modules .next
pnpm install
pnpm dev
```

## 📚 Arquivos Importantes

- `INSTRUCOES_SUPABASE.md` - Guia completo do Supabase
- `supabase_setup.sql` - Script para criar tabelas
- `.env.example` - Exemplo de variáveis de ambiente
- `src/lib/supabase.ts` - Cliente Supabase
- `src/server/auth.ts` - Configuração de autenticação

## 🎉 Pronto!

Seu sistema de apresentações com IA está rodando com:
- ✅ Banco Supabase
- ✅ Autenticação completa
- ✅ Interface moderna
- ✅ IA integrada
