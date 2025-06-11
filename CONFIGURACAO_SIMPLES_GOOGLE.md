# 🔑 Configuração Simples do Google Cloud

## 🎯 Método Mais Fácil (Recomendado)

Ao invés de converter arquivos para base64, você pode usar o JSON diretamente no `.env`!

### 📋 Passo a Passo:

#### 1. 📥 Copie o conteúdo do seu arquivo JSON
Abra seu arquivo `service-account-key.json` e copie todo o conteúdo.

#### 2. 📝 Cole no .env como string
No seu arquivo `.env` ou `.env.production`, adicione:

```bash
# Google Cloud - JSON direto (SEM quebras de linha)
GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"seu-projeto","private_key_id":"abc123...","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BA...\n-----END PRIVATE KEY-----\n","client_email":"service-account@seu-projeto.iam.gserviceaccount.com","client_id":"123456789","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/service-account%40seu-projeto.iam.gserviceaccount.com"}'

GOOGLE_CLOUD_PROJECT_ID="seu-projeto-id"
```

#### 3. ⚠️ IMPORTANTE: Use aspas simples
- Use aspas **simples** (`'`) ao redor do JSON
- Mantenha tudo em **uma linha só**
- **NÃO** adicione quebras de linha dentro da string

### 🏠 Para Desenvolvimento Local

Continue usando o método atual:
```bash
# .env.local
GOOGLE_APPLICATION_CREDENTIALS="/caminho/para/service-account.json"
GOOGLE_CLOUD_PROJECT_ID="seu-projeto-id"
```

### 🚀 Para Produção (Vercel, Railway, etc.)

Use o JSON direto:
```bash
# Variáveis de ambiente na plataforma
GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...todo o json...}'
GOOGLE_CLOUD_PROJECT_ID="seu-projeto-id"
```

## 🔧 Exemplo Prático

### Seu arquivo service-account.json:
```json
{
  "type": "service_account",
  "project_id": "meu-projeto-123",
  "private_key_id": "abc123def456",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BA...\n-----END PRIVATE KEY-----\n",
  "client_email": "minha-conta@meu-projeto-123.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/minha-conta%40meu-projeto-123.iam.gserviceaccount.com"
}
```

### No .env (tudo em uma linha):
```bash
GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"meu-projeto-123","private_key_id":"abc123def456","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BA...\n-----END PRIVATE KEY-----\n","client_email":"minha-conta@meu-projeto-123.iam.gserviceaccount.com","client_id":"123456789","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/minha-conta%40meu-projeto-123.iam.gserviceaccount.com"}'
```

## 🔍 Como o Sistema Funciona

O sistema agora tenta na seguinte ordem:

1. **🔑 GOOGLE_SERVICE_ACCOUNT_KEY** (JSON direto ou base64)
2. **📁 GOOGLE_APPLICATION_CREDENTIALS** (arquivo local)
3. **🌐 Application Default Credentials** (fallback)

## ✅ Vantagens do Método Simples

- ✅ **Sem scripts**: Não precisa converter nada
- ✅ **Direto**: Copia e cola o JSON
- ✅ **Funciona em qualquer lugar**: Vercel, Railway, Docker, etc.
- ✅ **Seguro**: Credenciais ficam em variáveis de ambiente
- ✅ **Flexível**: Aceita tanto JSON direto quanto base64

## 🚨 Dicas de Segurança

- 🔒 **NUNCA** faça commit do `.env` com credenciais
- 🔒 Use `.env.local` para desenvolvimento
- 🔒 Configure variáveis de ambiente na plataforma de deploy
- 🔒 Mantenha permissões mínimas na service account

## 🐛 Problemas Comuns

### ❌ Erro: "SyntaxError: Unexpected token"
- Verifique se usou aspas simples ao redor do JSON
- Confirme que está tudo em uma linha só

### ❌ Erro: "Invalid format"
- Valide se o JSON está correto
- Teste o JSON em um validador online

### ❌ Erro: "Authentication failed"
- Confirme se o `project_id` no JSON coincide com `GOOGLE_CLOUD_PROJECT_ID`
- Verifique permissões da service account

## 🎉 Pronto!

Agora é só usar o método que preferir:
- **🏠 Desenvolvimento**: Arquivo JSON local
- **🚀 Produção**: JSON direto no .env

Muito mais simples que converter para base64! 😊 