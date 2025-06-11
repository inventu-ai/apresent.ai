# 🔑 Configuração do Google Cloud para Deploy

Este guia explica como configurar as credenciais do Google Cloud para funcionar tanto em desenvolvimento local quanto em produção/deploy.

## 📋 Visão Geral

O sistema agora suporta duas formas de autenticação com o Google Cloud:

1. **🏠 Desenvolvimento Local**: Arquivo JSON local (`GOOGLE_APPLICATION_CREDENTIALS`)
2. **🚀 Produção/Deploy**: Service Account Key como string base64 (`GOOGLE_SERVICE_ACCOUNT_KEY`)

## 🏠 Configuração para Desenvolvimento

Para desenvolvimento local, continue usando o método atual:

```bash
# .env.local
GOOGLE_CLOUD_PROJECT_ID=seu-projeto-id
GOOGLE_APPLICATION_CREDENTIALS=/caminho/para/service-account-key.json
```

## 🚀 Configuração para Produção/Deploy

### Passo 1: Preparar Credenciais

Você tem duas opções (escolha a mais fácil):

#### Opção A: JSON Direto (MAIS SIMPLES) ⭐
```bash
# Copie o conteúdo do seu service-account.json e cole no .env em uma linha:
GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"seu-projeto",...}'
```

#### Opção B: Converter para Base64 (se preferir)
```bash
# Usando npm script
npm run convert-google-credentials /caminho/para/service-account-key.json
```

### Passo 2: Configurar Variáveis de Ambiente na Produção

Adicione as seguintes variáveis no seu ambiente de produção (Vercel, Railway, etc.):

```bash
# Obrigatórias para produção
GOOGLE_CLOUD_PROJECT_ID=seu-projeto-id
GOOGLE_SERVICE_ACCOUNT_KEY=<string-base64-gerada-pelo-script>

# Opcional - para fallback
GOOGLE_APPLICATION_CREDENTIALS=/app/credentials.json  # apenas se necessário
```

## ⚙️ Como Funciona

O sistema usa a seguinte ordem de prioridade para autenticação:

1. **🔑 GOOGLE_SERVICE_ACCOUNT_KEY** (recomendado para produção)
   - String JSON em base64
   - Seguro para variáveis de ambiente
   - Funciona em qualquer plataforma

2. **📁 GOOGLE_APPLICATION_CREDENTIALS** (desenvolvimento)
   - Caminho para arquivo JSON local
   - Ideal para desenvolvimento
   - Não funciona em deploy

3. **🌐 Application Default Credentials** (fallback)
   - Credenciais automáticas do ambiente
   - Funciona no Google Cloud Platform

## 🔒 Segurança

### ✅ Boas Práticas

- ✅ Use `GOOGLE_SERVICE_ACCOUNT_KEY` em produção
- ✅ Mantenha credenciais fora do código fonte
- ✅ Delete arquivos temporários após conversão
- ✅ Use princípio de menor privilégio nas IAM roles
- ✅ Monitore uso das APIs

### ❌ Evite

- ❌ Nunca faça commit de arquivos de credenciais
- ❌ Não exponha credenciais em logs
- ❌ Não use credenciais de desenvolvimento em produção

## 🧪 Testando a Configuração

### Teste Local
```bash
npm run dev
# Verificar logs: "📁 Usando GOOGLE_APPLICATION_CREDENTIALS para autenticação"
```

### Teste Produção
```bash
npm run build
npm start
# Verificar logs: "🔑 Usando GOOGLE_SERVICE_ACCOUNT_KEY para autenticação"
```

## 🛠️ Troubleshooting

### Erro: "Credenciais não configuradas"
- ✅ Verifique se `GOOGLE_CLOUD_PROJECT_ID` está definido
- ✅ Confirme que `GOOGLE_SERVICE_ACCOUNT_KEY` ou `GOOGLE_APPLICATION_CREDENTIALS` existe
- ✅ Valide o formato do JSON base64

### Erro: "Token de acesso inválido"
- ✅ Verifique permissões da service account
- ✅ Confirme que Vertex AI API está habilitada
- ✅ Teste credenciais localmente primeiro

### Erro: "Arquivo não encontrado"
- ✅ Confirme caminho do arquivo em `GOOGLE_APPLICATION_CREDENTIALS`
- ✅ Verifique permissões de leitura do arquivo

## 📦 Deploy em Diferentes Plataformas

### Vercel
```bash
# Dashboard → Settings → Environment Variables
GOOGLE_CLOUD_PROJECT_ID=seu-projeto
GOOGLE_SERVICE_ACCOUNT_KEY=<base64-string>
```

### Railway
```bash
# Dashboard → Variables
GOOGLE_CLOUD_PROJECT_ID=seu-projeto
GOOGLE_SERVICE_ACCOUNT_KEY=<base64-string>
```

### Docker
```dockerfile
ENV GOOGLE_CLOUD_PROJECT_ID=seu-projeto
ENV GOOGLE_SERVICE_ACCOUNT_KEY=<base64-string>
```

### Google Cloud Run
```bash
gcloud run deploy --set-env-vars="GOOGLE_CLOUD_PROJECT_ID=seu-projeto,GOOGLE_SERVICE_ACCOUNT_KEY=<base64-string>"
```

## 🔧 Scripts Utilitários

### Converter Credenciais
```bash
npm run convert-google-credentials <arquivo.json>
```

### Validar Configuração (futuro)
```bash
npm run validate-google-credentials
```

## 📝 Exemplo Completo

### 1. Desenvolvimento (.env.local)
```bash
GOOGLE_CLOUD_PROJECT_ID=meu-projeto-dev
GOOGLE_APPLICATION_CREDENTIALS=./credentials/service-account-dev.json
```

### 2. Produção (Vercel/Railway)
```bash
GOOGLE_CLOUD_PROJECT_ID=meu-projeto-prod
GOOGLE_SERVICE_ACCOUNT_KEY=ewogICJ0eXBlIjogInNlcnZpY2VfYWNjb3VudCIsCiAgInByb2plY3RfaWQiOiAibWV1LXByb2pldG8iLAogIC...
```

## 🆘 Suporte

Se você encontrar problemas:

1. 📋 Verifique os logs do console para mensagens de autenticação
2. 🧪 Teste credenciais localmente primeiro
3. 🔍 Confirme permissões IAM da service account
4. 📖 Consulte documentação do Google Cloud

---

## 🔄 Migração do Sistema Antigo

Se você já estava usando `GOOGLE_APPLICATION_CREDENTIALS` em produção:

1. 🔄 Converta suas credenciais usando o script
2. ➕ Adicione `GOOGLE_SERVICE_ACCOUNT_KEY` nas variáveis de ambiente
3. 🗑️ Remova `GOOGLE_APPLICATION_CREDENTIALS` da produção (opcional)
4. 🧪 Teste deploy para confirmar funcionamento

O sistema é retrocompatível, então ambos os métodos funcionam simultaneamente. 