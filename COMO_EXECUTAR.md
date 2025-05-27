# 🚀 Como Executar o ALLWEONE AI Presentation Generator

## ✅ Status da Configuração

### Já Configurado:
- ✅ Node.js v23.10.0 instalado
- ✅ pnpm instalado
- ✅ PostgreSQL 14.17 instalado
- ✅ Arquivo .env criado com suas chaves de API
- ✅ Script de configuração criado

### Ainda Precisa Configurar:
- ⚠️ Google OAuth Client ID (veja GOOGLE_OAUTH_SETUP.md)

## 🎯 Passos para Executar

### 1. Execute o Script de Configuração
```bash
cd presentation-ai
./setup.sh
```

Este script irá:
- Instalar todas as dependências
- Iniciar o PostgreSQL
- Criar o banco de dados
- Configurar o schema do banco
- Gerar o cliente Prisma

### 2. Configure o Google OAuth (Opcional mas Recomendado)
- Siga o guia em `GOOGLE_OAUTH_SETUP.md`
- Atualize o `GOOGLE_CLIENT_ID` no arquivo `.env`

### 3. Execute a Aplicação
```bash
npm run dev
```

### 4. Acesse a Aplicação
Abra seu navegador em: http://localhost:3000

## 🔧 Comandos Úteis

### Desenvolvimento
```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # Verificar código
```

### Banco de Dados
```bash
npx prisma db push   # Sincronizar schema
npx prisma studio    # Interface visual do banco
npx prisma generate  # Gerar cliente Prisma
```

## 🎨 Funcionalidades Disponíveis

### Com as APIs Configuradas:
- ✅ **OpenAI**: Geração de conteúdo de apresentações
- ✅ **Together AI**: Geração de imagens para slides
- ✅ **UploadThing**: Upload de arquivos e imagens

### Sem Google OAuth:
- ❌ Login com Google (mas a app ainda funciona)
- ✅ Todas as outras funcionalidades de criação de apresentações

## 🐛 Solução de Problemas

### Erro de Conexão com Banco
```bash
# Verificar se PostgreSQL está rodando
brew services list | grep postgresql

# Iniciar PostgreSQL
brew services start postgresql@14

# Recriar banco se necessário
dropdb presentation_ai
createdb presentation_ai
npx prisma db push
```

### Erro de Dependências
```bash
# Limpar cache e reinstalar
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

### Erro de Porta em Uso
```bash
# Verificar o que está usando a porta 3000
lsof -i :3000

# Matar processo se necessário
kill -9 <PID>
```

## 📝 Notas Importantes

1. **Primeira execução**: Pode demorar alguns minutos para instalar todas as dependências
2. **Google OAuth**: Não é obrigatório para testar a aplicação
3. **APIs de IA**: Necessárias para funcionalidade completa
4. **PostgreSQL**: Deve estar rodando para a aplicação funcionar

## 🎉 Pronto!

Após seguir estes passos, você terá o ALLWEONE AI Presentation Generator rodando localmente!
