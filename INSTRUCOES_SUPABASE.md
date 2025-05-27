# 🚀 Instruções para Configurar Supabase

Este guia te ajudará a migrar do Prisma para Supabase e configurar tudo corretamente.

## 📋 Pré-requisitos

1. Conta no [Supabase](https://supabase.com)
2. Node.js instalado
3. pnpm instalado

## 🔧 Passo 1: Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Faça login ou crie uma conta
4. Clique em "New Project"
5. Escolha sua organização
6. Preencha:
   - **Name**: `presentation-ai` (ou nome de sua escolha)
   - **Database Password**: Crie uma senha forte (anote!)
   - **Region**: Escolha a região mais próxima (ex: South America)
7. Clique em "Create new project"
8. Aguarde alguns minutos para o projeto ser criado

## 🔑 Passo 2: Obter Credenciais

1. No dashboard do seu projeto Supabase, vá em **Settings** → **API**
2. Copie as seguintes informações:
   - **Project URL** (ex: `https://abc123.supabase.co`)
   - **anon public** key
   - **service_role** key (⚠️ Mantenha secreta!)

## 📝 Passo 3: Configurar Variáveis de Ambiente

1. Copie o arquivo `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edite o arquivo `.env` e preencha as variáveis do Supabase:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL="https://seu-projeto.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="sua-anon-key-aqui"
   SUPABASE_SERVICE_ROLE_KEY="sua-service-role-key-aqui"
   
   # NextAuth Configuration
   NEXTAUTH_SECRET="sua-secret-key-aqui"
   NEXTAUTH_URL="http://localhost:3000"
   
   # Outras variáveis...
   ```

## 🗄️ Passo 4: Configurar Banco de Dados

1. No dashboard do Supabase, vá em **SQL Editor**
2. Clique em "New query"
3. Copie todo o conteúdo do arquivo `supabase_setup.sql`
4. Cole no editor SQL
5. Clique em "Run" para executar o script
6. Verifique se todas as tabelas foram criadas em **Table Editor**

## 🔐 Passo 5: Configurar Autenticação

1. No dashboard do Supabase, vá em **Authentication** → **Settings**
2. Em **Site URL**, adicione: `http://localhost:3000`
3. Em **Redirect URLs**, adicione:
   - `http://localhost:3000/api/auth/callback/google`
   - `http://localhost:3000`

### Para Google OAuth (Opcional):

1. Vá em **Authentication** → **Providers**
2. Clique em **Google**
3. Ative o provider
4. Adicione suas credenciais do Google:
   - **Client ID**: Sua Google Client ID
   - **Client Secret**: Sua Google Client Secret

## 🚀 Passo 6: Instalar Dependências e Executar

1. Instale as dependências:
   ```bash
   pnpm install
   ```

2. Execute o projeto:
   ```bash
   pnpm dev
   ```

3. Acesse: `http://localhost:3000`

## ✅ Passo 7: Testar a Configuração

1. Tente fazer login na aplicação
2. Verifique se consegue criar apresentações
3. Confirme se os dados estão sendo salvos no Supabase

## 🔍 Verificar se Funcionou

### No Supabase Dashboard:

1. Vá em **Table Editor**
2. Verifique se as tabelas foram criadas:
   - `users`
   - `accounts`
   - `BaseDocument`
   - `Presentation`
   - `CustomTheme`
   - `FavoriteDocument`
   - `GeneratedImage`

3. Vá em **Authentication** → **Users**
4. Após fazer login, você deve ver usuários listados aqui

### Na Aplicação:

1. ✅ Login funciona
2. ✅ Criação de apresentações funciona
3. ✅ Dados são persistidos
4. ✅ Não há erros no console

## 🛠️ Solução de Problemas

### Erro: "Invalid API key"
- Verifique se as chaves estão corretas no `.env`
- Certifique-se de que não há espaços extras

### Erro: "Database connection failed"
- Verifique se o projeto Supabase está ativo
- Confirme se a URL está correta

### Erro: "RLS policy violation"
- Verifique se as políticas RLS foram criadas corretamente
- Execute novamente o script `supabase_setup.sql`

### Tabelas não aparecem:
- Execute o script SQL novamente
- Verifique se não há erros no SQL Editor

## 📚 Recursos Úteis

- [Documentação Supabase](https://supabase.com/docs)
- [NextAuth.js com Supabase](https://next-auth.js.org/adapters/supabase)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## 🎉 Pronto!

Sua aplicação agora está usando Supabase em vez do Prisma! 

### Benefícios da migração:
- ✅ Banco de dados na nuvem
- ✅ Autenticação integrada
- ✅ Row Level Security
- ✅ Dashboard visual
- ✅ APIs automáticas
- ✅ Escalabilidade
- ✅ Backup automático

Se tiver problemas, verifique os logs do console e do Supabase Dashboard.
