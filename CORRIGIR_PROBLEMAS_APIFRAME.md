# Correção de Problemas com APIFrame (Flux/Midjourney)

## Problema Identificado

### Erro Original
```
Error generating image: Error: APIFrame generation failed: {"errors":[{"msg":"内部错误，请联系管理员"}]}
```

### Tradução do Erro
- **内部错误，请联系管理员** = "Erro interno, contate o administrador" (em chinês)
- Indica problema no lado do servidor da APIFrame

### Possíveis Causas

1. **Chave da API inválida ou expirada**
2. **Problemas de créditos na conta APIFrame**
3. **Problemas temporários do serviço APIFrame**
4. **Rate limiting (muitas requisições)**
5. **Configuração incorreta da requisição**

## Soluções Implementadas

### 1. Validação da Chave da API
```typescript
// ✅ Validação adicionada
if (!env.APIFRAME_API_KEY) {
  throw new Error("APIFRAME_API_KEY is not configured");
}
```

### 2. Logs Detalhados para Debug
```typescript
// ✅ Logs de debug adicionados
console.log(`APIFrame: Starting generation with model ${apiModel}`);
console.log(`APIFrame: Request body:`, requestBody);
console.log(`APIFrame: Generation response status: ${generateResponse.status}`);
console.log(`APIFrame: Generation result:`, generateResult);
```

### 3. Tratamento de Erro Melhorado
```typescript
// ✅ Parse inteligente de erros
try {
  const errorObj = JSON.parse(errorText);
  if (errorObj.errors && errorObj.errors[0]?.msg) {
    const errorMsg = errorObj.errors[0].msg;
    if (errorMsg.includes("内部错误") || errorMsg.includes("Internal error")) {
      throw new Error(`APIFrame internal error. This may be due to: API key issues, account credits, or temporary service problems. Original error: ${errorText}`);
    }
  }
} catch (parseError) {
  // Se não conseguir fazer parse, usar erro original
}
```

### 4. Logs de Polling Detalhados
```typescript
// ✅ Monitoramento do processo de polling
console.log(`APIFrame: Starting polling for task ${taskId}`);
console.log(`APIFrame: Polling attempt ${attempts + 1}/${maxAttempts}`);
console.log(`APIFrame: Current status: ${statusResult.status}, waiting...`);
```

## Como Diagnosticar o Problema

### 1. Verificar Logs no Console
Após implementar as melhorias, verifique os logs:

```bash
# Procure por estas mensagens no console:
- "APIFrame: Starting generation with model flux-dev"
- "APIFrame: Request body: {...}"
- "APIFrame: Generation response status: 200"
- "APIFrame: Generation result: {...}"
```

### 2. Verificar Chave da API
```bash
# Confirme que a variável está configurada
echo $APIFRAME_API_KEY
```

### 3. Testar Conectividade
```bash
# Teste manual da API (substitua YOUR_API_KEY)
curl -X POST https://api.apiframe.pro/imagine \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "test image",
    "model": "flux-dev",
    "aspect_ratio": "4:3"
  }'
```

## Possíveis Soluções para o Erro

### 1. Verificar Conta APIFrame
- **Acesse o painel da APIFrame**
- **Verifique saldo de créditos**
- **Confirme status da conta**
- **Verifique se a chave da API está ativa**

### 2. Aguardar e Tentar Novamente
- O erro pode ser temporário
- Espere alguns minutos antes de tentar novamente

### 3. Usar Modelo Alternativo
Teste com outros modelos APIFrame:
```typescript
// Tente estes modelos alternativos:
- "flux-pro"           // Mais caro, mas mais estável
- "midjourney-imagine" // Alternativa ao Flux
- "flux-pro-1.1"       // Versão mais recente
```

### 4. Implementar Fallback
```typescript
// Exemplo de fallback para outros modelos
try {
  imageUrl = await generateWithAPIFrame(prompt, "flux-dev", aspectRatio);
} catch (error) {
  console.warn("Flux-dev failed, trying Ideogram as fallback");
  imageUrl = await generateWithIdeogram(prompt, "ideogram-v3", aspectRatio);
}
```

## Configuração da Variável de Ambiente

### 1. Arquivo .env
```bash
# Adicione no arquivo .env
APIFRAME_API_KEY="sua_chave_apiframe_aqui"
```

### 2. Verificar se está Carregando
```typescript
// No código, verificar se está carregando corretamente
console.log("APIFrame key configured:", !!env.APIFRAME_API_KEY);
```

## Modelos APIFrame Disponíveis

### Flux Models
- `flux-dev` - Versão de desenvolvimento (mais barato)
- `flux-pro` - Versão profissional (melhor qualidade)
- `flux-pro-1.1` - Versão mais recente
- `flux-pro-1.1-ultra` - Versão ultra (melhor qualidade)

### Midjourney
- `midjourney-imagine` - Geração com Midjourney

## Monitoramento e Debug

### 1. Logs a Observar
```bash
# Logs de sucesso:
"APIFrame: Generation completed successfully"
"Image URL: https://..."

# Logs de erro:
"APIFrame internal error"
"APIFrame: Generation failed:"
"APIFrame generation timed out"
```

### 2. Tempo de Processamento
- **Normal**: 30-120 segundos
- **Timeout**: 300 segundos (5 minutos)
- Se demorar mais que isso, pode haver problema

## Contato com Suporte

Se o problema persistir:

1. **Documentar os logs**
2. **Verificar status da API**: https://status.apiframe.pro (se existir)
3. **Contatar suporte da APIFrame**
4. **Considerar usar modelos alternativos temporariamente**

## Comandos para Testar

```bash
# Execute o projeto com logs detalhados
cd apresent.ai
pnpm dev

# No navegador:
# 1. Abra o console (F12)
# 2. Gere uma apresentação com flux-dev
# 3. Observe os logs detalhados do APIFrame
# 4. Identifique onde o processo falha
```

## Conclusão

As melhorias implementadas fornecem **logs detalhados** para identificar exatamente onde o processo está falhando, facilitando o diagnóstico e resolução de problemas com a APIFrame. 