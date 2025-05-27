# 🔧 Como Corrigir o Erro de Google OAuth

## Problema Atual
Erro: **"redirect_uri_mismatch"** - A URL de redirecionamento não está configurada corretamente no Google Cloud Console.

## ✅ Solução Passo a Passo

### 1. Acesse o Google Cloud Console
- Vá para: https://console.cloud.google.com/
- Selecione seu projeto "teste presentation"

### 2. Navegue até as Credenciais OAuth
- Menu lateral → "APIs e Serviços" → "Credenciais"
- Clique no seu Client ID OAuth 2.0 existente

### 3. Adicione a URL de Redirecionamento Correta
Na seção **"URIs de redirecionamento autorizados"**:

**REMOVA qualquer URL antiga e ADICIONE EXATAMENTE esta URL:**
```
http://localhost:3002/api/auth/callback/google
```

⚠️ **IMPORTANTE**: 
- Use `localhost` (não `127.0.0.1`)
- Use a porta `3002` (não `3000`)
- O caminho deve ser exatamente `/api/auth/callback/google`

### 4. Salvar as Alterações
- Clique em **"Salvar"**
- Aguarde alguns segundos para as alterações serem aplicadas

### 5. Testar Novamente
Após salvar, acesse: http://localhost:3002 e teste o login com Google.

## 📋 Checklist de Verificação

- [ ] URL de redirecionamento: `http://localhost:3002/api/auth/callback/google`
- [ ] Client ID no .env: `1011801108917-ihjq6h7rac45tvrt1vhf8h9bshpkqpbm.apps.googleusercontent.com`
- [ ] Client Secret no .env: `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`
- [ ] NEXTAUTH_URL no .env: `http://localhost:3002`
- [ ] Servidor rodando na porta 3002

## 🎯 URLs Corretas para Referência

**No Google Cloud Console:**
- URI de redirecionamento: `http://localhost:3002/api/auth/callback/google`

**No arquivo .env:**
```
NEXTAUTH_URL="http://localhost:3002"
GOOGLE_CLIENT_ID="1011801108917-ihjq6h7rac45tvrt1vhf8h9bshpkqpbm.apps.googleusercontent.com"
```

## 🔄 Se Ainda Não Funcionar

1. **Limpe o cache do navegador**
2. **Aguarde 5-10 minutos** (mudanças no Google podem demorar)
3. **Reinicie o servidor** (Ctrl+C e `npm run dev` novamente)
4. **Verifique se não há espaços extras** nas URLs no Google Console

Após fazer essas alterações, o login com Google deve funcionar perfeitamente!
