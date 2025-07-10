# Apresent.ai - Gerador de Apresentações com IA

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3.0-green?logo=supabase&logoColor=white)](https://supabase.com/)

> Um gerador de apresentações com IA que cria slides profissionais em minutos. Sistema completo com planos, créditos e múltiplos modelos de IA.

## 🌟 Principais Funcionalidades

### 🎯 **Geração de Apresentações com IA**
- Criação completa de apresentações a partir de tópicos
- Geração automática de outline editável
- Múltiplos modelos de IA para diferentes necessidades
- Suporte a 3 idiomas: Português, Inglês e Espanhol

### 🎨 **Sistema de Temas Avançado**
- **9 temas built-in** profissionais
- **Criação de temas customizados** do zero
- **Editor visual completo** para cores, fontes e logos
- **Pré-visualização em tempo real**

### 💎 **Sistema de Planos e Créditos**
- **3 planos**: FREE (500 créditos), PRO (2000 créditos), PREMIUM (ilimitado)
- **Reset automático** de créditos a cada 30 dias
- **Limitação inteligente** de cards por plano (10/20/30)
- **Badges visuais** de plano em toda interface

### 🖼️ **Modelos de IA de Imagem**
Suporte a **13 modelos diferentes** organizados por qualidade:

#### 🆓 **FREE**
- Flux Fast 1.1
- Google Imagen 3 Fast
- Ideogram v2

#### ⭐ **PRO**
- Flux Pro / Flux Dev / Flux Pro 1.1
- Ideogram v2 Turbo
- Google Imagen 3

#### 💎 **PREMIUM**
- Midjourney Imagine
- DALL-E 3
- Flux Pro 1.1 Ultra
- Ideogram v3
- GPT Image 1

### 🎨 **Editor de Slides Avançado**
- **Plate Editor** com rich text
- **Drag & Drop** para reorganização
- **Edição em tempo real** de texto e imagens
- **Regeneração de conteúdo** com IA
- **Modo apresentação** integrado

### 🌍 **Internacionalização (i18n)**
- **Português (pt-BR)** - Idioma principal
- **Inglês (en-US)** - Internacional
- **Espanhol (es-ES)** - Expansão latina
- **Detecção automática** do idioma do browser
- **Configuração por usuário** sincronizada

### 🔐 **Autenticação e Perfil**
- **NextAuth.js** com Google OAuth
- **Perfil completo** com configurações
- **Gerenciamento de créditos** em tempo real
- **Histórico de uso** e resets

## 🚀 Instalação e Configuração

### Pré-requisitos
- Node.js 18.x ou superior
- pnpm (gerenciador de pacotes)
- Banco PostgreSQL (Supabase recomendado)

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/apresent-ai.git
cd apresent.ai
```

### 2. Instale as dependências
```bash
pnpm install
```

### 3. Configure as variáveis de ambiente
Crie um arquivo `.env.local` com:

```env
# Banco de dados
DATABASE_URL="postgresql://usuario:senha@localhost:5432/apresentai"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://seu-projeto.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sua-chave-publica"
SUPABASE_SERVICE_ROLE_KEY="sua-chave-servico"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="sua-chave-secreta-super-forte"

# OAuth Google
GOOGLE_CLIENT_ID="seu-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="seu-client-secret"

# APIs de IA
OPENAI_API_KEY="sk-sua-chave-openai"
TOGETHER_AI_API_KEY="sua-chave-together"
APIFRAME_API_KEY="sua-chave-apiframe"
IDEOGRAM_API_KEY="sua-chave-ideogram"

# Google Cloud (para Imagen)
GOOGLE_CLOUD_PROJECT_ID="seu-projeto-id"
GOOGLE_SERVICE_ACCOUNT_KEY="sua-chave-service-account-json"
```

### 4. Configure o banco de dados
```bash
# Aplicar schema do Prisma
pnpm db:push

# Executar setup completo do Supabase
psql -f supabase_setup.sql
```

### 5. Execute o projeto
```bash
pnpm dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 🏗️ Arquitetura do Sistema

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── auth/              # Autenticação
│   ├── presentation/      # Editor de apresentações
│   └── profile/           # Perfil do usuário
├── components/            # Componentes React
│   ├── auth/             # Auth UI
│   ├── presentation/     # Editor e dashboard
│   ├── text-editor/      # Plate Editor
│   └── ui/               # Componentes base
├── lib/                  # Utilitários
│   ├── credit-system.ts  # Sistema de créditos
│   ├── i18n/            # Internacionalização
│   └── supabase.ts      # Configuração DB
├── hooks/                # React Hooks
├── contexts/             # Context Providers
└── states/               # Zustand stores
```

## 💻 Principais Componentes

### Sistema de Créditos
```typescript
// Custos por ação
CREDIT_COSTS = {
  PRESENTATION_CREATION: 40,  // Apresentação completa
  IMAGE_GENERATION: 5,        // Gerar imagem
  SLIDE_GENERATION: 5,        // Gerar slide
  CARD_GENERATION: 2,         // Gerar card
  TOPIC_REGENERATION: 2,      // Regenerar tópico
}
```

### Modelos de IA
```typescript
// Modelos por plano
IMAGE_MODELS_BY_PLAN = {
  FREE: ["flux-fast-1.1", "google-imagen-3-fast", "ideogram-v2"],
  PRO: ["flux-pro", "flux-dev", "google-imagen-3"],
  PREMIUM: ["dall-e-3", "midjourney-imagine", "gpt-image-1"]
}
```

### Limitações por Plano
```typescript
MAX_CARDS_BY_PLAN = {
  FREE: 10,     // Máximo 10 cards
  PRO: 20,      // Máximo 20 cards  
  PREMIUM: 30,  // Máximo 30 cards
}
```

## 🎯 Funcionalidades Implementadas

### ✅ Sistema de Usuários
- [x] Autenticação com Google OAuth
- [x] Perfil completo com configurações
- [x] Sistema de planos (FREE/PRO/PREMIUM)
- [x] Badges visuais de plano
- [x] Gerenciamento de créditos

### ✅ Geração de Apresentações
- [x] Criação automática com IA
- [x] Outline editável
- [x] Múltiplos temas
- [x] Customização de temas
- [x] Geração de imagens

### ✅ Editor de Slides
- [x] Plate Editor integrado
- [x] Drag & Drop
- [x] Edição em tempo real
- [x] Regeneração de conteúdo
- [x] Modo apresentação

### ✅ Sistema de Créditos
- [x] Consumo por ação
- [x] Reset automático (30 dias)
- [x] Limitações por plano
- [x] Histórico de uso

### ✅ Modelos de IA
- [x] 13 modelos de imagem
- [x] Restrições por plano
- [x] Qualidades diferentes
- [x] Integração com múltiplas APIs

### ✅ Internacionalização
- [x] 3 idiomas suportados
- [x] Detecção automática
- [x] Sincronização com perfil
- [x] Traduções completas

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev                    # Servidor de desenvolvimento
pnpm build                  # Build de produção
pnpm start                  # Servidor de produção

# Banco de dados
pnpm db:push               # Aplicar schema
pnpm db:studio             # Prisma Studio

# Utilitários
pnpm lint                  # ESLint
pnpm convert-google-credentials  # Converter credenciais Google
```

## 🌐 Tecnologias Utilizadas

### **Frontend**
- **Next.js 14.2** - Framework React com App Router
- **TypeScript 5.7** - Tipagem estática
- **Tailwind CSS 3.4** - Estilização
- **Radix UI** - Componentes acessíveis
- **Plate Editor** - Editor rich text
- **Zustand** - Gerenciamento de estado

### **Backend**
- **NextAuth.js 5.0** - Autenticação
- **Prisma 5.22** - ORM
- **Supabase** - Banco PostgreSQL
- **tRPC** - API type-safe

### **Integrações de IA**
- **OpenAI API** - DALL-E 3, GPT Image 1
- **Together AI** - Flux models
- **Google Cloud** - Imagen 3 / Imagen 3 Fast
- **APIFrame** - Midjourney, Flux Pro
- **Ideogram API** - Ideogram v2/v3

### **Infraestrutura**
- **Vercel** - Deploy e hosting
- **Supabase** - Banco e auth
- **UploadThing** - Upload de arquivos
- **Google Cloud** - AI services

## 📊 Métricas e Limites

### Planos de Uso
| Plano | Créditos/mês | Cards máx | Modelos | Preço |
|-------|-------------|-----------|---------|-------|
| FREE | 500 | 10 | 3 básicos | Grátis |
| PRO | 2000 | 20 | 8 modelos | R$29.99 |
| PREMIUM | Ilimitado | 30 | 13 modelos | R$59.99 |

### Custos por Ação
- **Apresentação completa**: 40 créditos
- **Imagem básica**: 5 créditos
- **Imagem avançada**: 10 créditos
- **Imagem premium**: 15 créditos
- **Regenerar slide**: 5 créditos

## 🔐 Segurança

- **Autenticação** com NextAuth.js e Google OAuth
- **Autorização** baseada em planos
- **Validação** de créditos server-side
- **Rate limiting** para APIs
- **Sanitização** de inputs
- **Variáveis de ambiente** seguras

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório GitHub
2. Configure as variáveis de ambiente
3. Deploy automático

### Docker
```dockerfile
# Dockerfile incluído no projeto
docker build -t apresentai .
docker run -p 3000:3000 apresentai
```

### Configuração de Produção
```env
# .env.production
NODE_ENV=production
NEXTAUTH_URL=https://seu-dominio.com
DATABASE_URL=sua-url-producao
# ... outras variáveis
```
---

**Construído com ❤️ pela equipe Inventu**

Para mais informações sobre configuração específica, consulte os arquivos de documentação no diretório raiz do projeto. 
