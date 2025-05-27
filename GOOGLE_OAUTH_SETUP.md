# Configuração do Google OAuth

Para que a autenticação funcione corretamente, você precisa configurar o Google OAuth. Siga estes passos:

## 1. Acesse o Google Cloud Console
- Vá para: https://console.cloud.google.com/

## 2. Crie ou Selecione um Projeto
- Se não tiver um projeto, clique em "Criar Projeto"
- Dê um nome como "Presentation AI" ou similar
- Aguarde a criação do projeto

## 3. Ative as APIs Necessárias
- No menu lateral, vá em "APIs e Serviços" > "Biblioteca"
- Procure por "Google+ API" e ative
- Procure por "People API" e ative (opcional, mas recomendado)

## 4. Configurar Tela de Consentimento OAuth
- Vá em "APIs e Serviços" > "Tela de consentimento OAuth"
- Escolha "Externo" (a menos que tenha Google Workspace)
- Preencha as informações obrigatórias:
  - Nome do app: "Presentation AI"
  - Email de suporte: seu email
  - Email de contato do desenvolvedor: seu email
- Salve e continue

## 5. Criar Credenciais OAuth 2.0
- Vá em "APIs e Serviços" > "Credenciais"
- Clique em "Criar Credenciais" > "ID do cliente OAuth 2.0"
- Tipo de aplicativo: "Aplicativo da Web"
- Nome: "Presentation AI Web Client"
- URIs de redirecionamento autorizados:
  - Adicione: `http://localhost:3000/api/auth/callback/google`
- Clique em "Criar"

## 6. Copiar as Credenciais
Após criar, você receberá:
- **Client ID**: Uma string longa que começa com números
- **Client Secret**: Uma string que você já tem (GOCSPX-...)

## 7. Atualizar o arquivo .env
Substitua no arquivo `.env`:
```
GOOGLE_CLIENT_ID="cole-aqui-o-client-id-que-voce-copiou"
```

## 8. Testar a Configuração
Após configurar, reinicie a aplicação e teste o login com Google.

## Exemplo de Client ID
O Client ID deve ser algo como:
```
123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com
```

## Problemas Comuns
- **Erro de URI de redirecionamento**: Verifique se adicionou exatamente `http://localhost:3000/api/auth/callback/google`
- **Erro de domínio**: Certifique-se de que está acessando via `localhost:3000` e não `127.0.0.1:3000`
