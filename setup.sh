#!/bin/bash

echo "🚀 Configurando ALLWEONE AI Presentation Generator..."

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script dentro do diretório presentation-ai"
    exit 1
fi

echo "📦 Instalando dependências..."
pnpm install

echo "🗄️ Configurando banco de dados PostgreSQL..."

# Iniciar PostgreSQL se não estiver rodando
echo "🔄 Iniciando PostgreSQL..."
brew services start postgresql@14

# Aguardar um pouco para o PostgreSQL iniciar
sleep 3

# Criar banco de dados se não existir
echo "🏗️ Criando banco de dados..."
createdb presentation_ai 2>/dev/null || echo "ℹ️ Banco de dados já existe ou erro na criação"

# Executar migrações do Prisma
echo "🔧 Configurando schema do banco de dados..."
npx prisma db push

# Gerar cliente Prisma
echo "⚙️ Gerando cliente Prisma..."
npx prisma generate

echo "✅ Configuração concluída!"
echo ""
echo "🎯 Para executar a aplicação:"
echo "   npm run dev"
echo ""
echo "🌐 A aplicação estará disponível em: http://localhost:3000"
echo ""
echo "⚠️ IMPORTANTE: Você ainda precisa configurar o Google OAuth:"
echo "   1. Acesse: https://console.cloud.google.com/"
echo "   2. Crie um novo projeto ou selecione um existente"
echo "   3. Ative a Google+ API"
echo "   4. Crie credenciais OAuth 2.0"
echo "   5. Adicione http://localhost:3000/api/auth/callback/google como URL de callback"
echo "   6. Substitua GOOGLE_CLIENT_ID no arquivo .env"
