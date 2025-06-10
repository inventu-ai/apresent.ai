# Configuração do Google Imagen 3

## Pré-requisitos

1. **Conta Google Cloud Platform** ativa com billing habilitado
2. **Projeto Google Cloud** criado
3. **APIs habilitadas**:
   - Vertex AI API
   - Cloud Resource Manager API

## Passos de Configuração

### 1. Habilitar APIs no Google Cloud Console

```bash
# Via gcloud CLI (opcional)
gcloud services enable aiplatform.googleapis.com
gcloud services enable cloudresourcemanager.googleapis.com
```

Ou no Console Web:
- Vá para [Google Cloud Console](https://console.cloud.google.com)
- Navegue para "APIs & Services" > "Library"
- Procure e habilite "Vertex AI API"

### 2. Criar Service Account

No Google Cloud Console:
1. Vá para "IAM & Admin" > "Service Accounts"
2. Clique em "Create Service Account"
3. Nome: `apresentai-imagen-service`
4. Descrição: `Service account for ApresentAI Imagen generation`

### 3. Atribuir Permissões

Adicione as seguintes roles ao Service Account:
- `Vertex AI User` (roles/aiplatform.user)
- `ML Engine Developer` (roles/ml.developer)

### 4. Gerar Chave JSON

1. No Service Account criado, clique em "Keys"
2. "Add Key" > "Create new key" > "JSON"
3. Baixe o arquivo JSON

### 5. Configurar Variáveis de Ambiente

Adicione ao seu arquivo `.env`:

```env
GOOGLE_CLOUD_PROJECT_ID=seu-project-id
GOOGLE_APPLICATION_CREDENTIALS=/caminho/para/service-account-key.json
```

**Ou** se preferir usar OAuth2:
```env
GOOGLE_CLOUD_PROJECT_ID=seu-project-id
GOOGLE_CLIENT_ID=seu-client-id
GOOGLE_CLIENT_SECRET=seu-client-secret
```

### 6. Testar Configuração

Reinicie o servidor de desenvolvimento:
```bash
pnpm dev
```

Tente gerar uma imagem com o modelo `google-imagen-3`.

## Troubleshooting

### Erro de Autenticação
```
Google Cloud authentication failed
```
**Solução**: Verifique se:
- O arquivo JSON das credenciais existe no caminho especificado
- As permissões do arquivo permitem leitura
- O `GOOGLE_CLOUD_PROJECT_ID` está correto

### Erro de Permissão
```
Google Cloud permission denied
```
**Solução**: Verifique se:
- A Vertex AI API está habilitada
- O Service Account tem as roles corretas
- O projeto tem billing habilitado

### Erro de Quota
```
Google Cloud quota exceeded
```
**Solução**: 
- Verifique limites de quota no Console
- Configure billing alerts
- Considere aumentar quotas se necessário

## Application Default Credentials (Alternativo)

Se estiver executando no Google Cloud (Cloud Run, GKE, etc.), pode usar ADC:

```bash
gcloud auth application-default login
```

Neste caso, não precisa definir `GOOGLE_APPLICATION_CREDENTIALS`.

## Custos

O Google Imagen 3 tem custos por imagem gerada:
- Verifique preços atuais em [Vertex AI Pricing](https://cloud.google.com/vertex-ai/pricing)
- Configure alerts de billing
- Monitore usage no Console

## Aspectos Suportados

O Google Imagen 3 suporta os seguintes aspect ratios:
- `1:1` (quadrado)
- `4:3` (paisagem)
- `3:4` (retrato)
- `16:9` (widescreen)
- `9:16` (vertical)

## Próximos Passos

Após configuração bem-sucedida:
1. Teste geração de imagens
2. Configure monitoring de custos
3. Ajuste parâmetros de qualidade conforme necessário 