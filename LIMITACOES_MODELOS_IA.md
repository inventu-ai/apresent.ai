# 🎨 Limitações de Modelos de IA por Planos

Este documento descreve a implementação das limitações de modelos de IA baseado nos planos de assinatura do Apresent.ai.

## 📋 Visão Geral

O sistema implementa restrições hierárquicas onde usuários em planos superiores têm acesso a todos os modelos dos planos inferiores, plus modelos exclusivos do seu nível.

## 🎯 Divisão por Planos

### 🆓 **PLANO FREE** - Modelos Básicos (5 créditos)

**Modelos Disponíveis:**
- ⚡ **Flux Fast 1.1** (Black Forest) - Modelo rápido e básico
- ⚡ **Google Imagen 3 Fast** (Google) - Versão acelerada
- ⚡ **Ideogram V2** (Ideogram) - Modelo básico

**Características:**
- Foco em rapidez e economia de recursos
- Qualidade adequada para rascunhos e testes
- Menor custo computacional
- Ideal para usuários iniciantes

---

### ⭐ **PLANO PRO** - Modelos Intermediários (10 créditos)

**Modelos Disponíveis:**
- Todos do **PLANO FREE** +
- 🔥 **Flux Pro** (Black Forest) - Qualidade profissional
- 🔥 **Flux Dev** (Black Forest) - Desenvolvimento avançado
- 🔥 **Flux Pro 1.1** (Black Forest) - Versão melhorada
- 🔥 **Ideogram V2 Turbo** (Ideogram) - Velocidade e qualidade
- 🔥 **Google Imagen 3** (Google) - Qualidade padrão

**Características:**
- Qualidade superior aos modelos FREE
- Context window maior
- Melhor coerência e detalhamento
- Adequado para uso profissional

---

### 💎 **PLANO PREMIUM** - Modelos Premium (15 créditos)

**Modelos Disponíveis:**
- Todos dos **PLANOS FREE e PRO** +
- 👑 **Midjourney Imagine** (Midjourney) - Estado da arte
- 👑 **DALL-E 3** (OpenAI) - Tecnologia OpenAI avançada
- 👑 **GPT Image 1** (OpenAI) - Novo modelo GPT para imagens
- 👑 **Flux Pro 1.1 Ultra** (Black Forest) - Máxima qualidade
- 👑 **Ideogram V3** (Ideogram) - Mais recente e avançado

**Características:**
- Máxima qualidade disponível
- Melhores resultados artísticos
- Maior refinamento e detalhamento
- Suporte a prompts complexos

## 🏗️ Implementação Técnica

### Arquivo de Configuração

```typescript
// src/lib/image-model-restrictions.ts
export const IMAGE_MODELS_BY_PLAN = {
  FREE: ["flux-fast-1.1", "google-imagen-3-fast", "ideogram-v2"],
  PRO: ["flux-pro", "flux-dev", "flux-pro-1.1", "ideogram-v2-turbo", "google-imagen-3"],
  PREMIUM: ["midjourney-imagine", "dall-e-3", "gpt-image-1", "flux-pro-1.1-ultra", "ideogram-v3"],
};
```

### Funções de Validação

1. **`canUseImageModel(userId, model)`**
   - Valida se usuário pode usar modelo específico
   - Retorna plano necessário se bloqueado

2. **`getModelsForPlan(planName)`**
   - Retorna todos modelos disponíveis para um plano
   - Inclui modelos hierarchicamente inferiores

3. **`consumeImageModelCredits(userId, model)`**
   - Consome créditos baseado no modelo usado
   - Valida permissão antes do consumo

### Integração no Frontend

**Componentes Atualizados:**
- `image-generation-model.tsx` - Seletor no editor
- `ThemeSettings.tsx` - Configurações gerais
- Ambos organizam modelos por seções de plano

**Interface Melhorada por Seções:**
```tsx
// Organização hierárquica por planos
<SelectContent>
  {/* Seção Gratuito */}
  <div className="section-header">
    <Zap /> Gratuito
  </div>
  <SelectItem>Flux Fast 1.1</SelectItem>
  <SelectItem>Google Imagen 3 Fast</SelectItem>
  
  {/* Seção Pro */}
  <div className="section-header">
    <Star /> Pro <Badge>PLUS</Badge>
  </div>
  <SelectItem disabled={!isPro}>Flux Pro</SelectItem>
  <SelectItem disabled={!isPro}>🔒 Requer Pro</SelectItem>
  
  {/* Seção Premium */}
  <div className="section-header">
    <Crown /> Premium <Badge>PLUS</Badge>
  </div>
  <SelectItem disabled={!isPremium}>Midjourney Imagine</SelectItem>
  <SelectItem disabled={!isPremium}>🔒 Requer Premium</SelectItem>
</SelectContent>
```

**Funcionalidades da Interface:**
- ✅ **Visibilidade Total**: Todos os modelos são sempre visíveis
- 🔒 **Restrições Visuais**: Modelos indisponíveis ficam desabilitados
- 📋 **Organização por Seções**: Agrupamento claro por plano
- 🏷️ **Badges Informativos**: Indicam plano necessário para modelos bloqueados
- ⚡ **Validação em Tempo Real**: Impede uso de modelos não disponíveis

## 🔄 Validação no Backend

### Action de Geração

```typescript
// src/app/_actions/image/generate.ts
export async function generateImageAction(prompt, model, quality, aspectRatio) {
  // Verificar se usuário pode usar este modelo
  const modelCheck = await canUseImageModel(session.user.id, model);
  
  if (!modelCheck.allowed) {
    return {
      success: false,
      error: `Modelo ${model} requer plano ${modelCheck.requiredPlan}`,
      requiredPlan: modelCheck.requiredPlan,
      availableModels: modelCheck.availableModels,
    };
  }
  
  // ... resto da lógica
}
```

## 💰 Mapeamento de Custos

```typescript
export const MODEL_CREDIT_MAPPING = {
  // FREE - 5 créditos
  "flux-fast-1.1": "BASIC_IMAGE",
  "google-imagen-3-fast": "BASIC_IMAGE",
  "ideogram-v2": "BASIC_IMAGE",
  
  // PRO - 10 créditos  
  "flux-pro": "ADVANCED_IMAGE",
  "flux-dev": "ADVANCED_IMAGE",
  "google-imagen-3": "ADVANCED_IMAGE",
  
  // PREMIUM - 15 créditos
  "midjourney-imagine": "PREMIUM_IMAGE",
  "dall-e-3": "PREMIUM_IMAGE",
  "gpt-image-1": "PREMIUM_IMAGE",
  "flux-pro-1.1-ultra": "PREMIUM_IMAGE",
};
```

## 📊 Benefícios da Implementação

### Para Usuários
- **Clara progressão de valor** entre planos
- **Acesso incremental** a tecnologias melhores
- **Transparência** sobre o que cada plano oferece

### Para o Negócio
- **Incentivo claro** para upgrade de planos
- **Controle de custos** operacionais por modelo
- **Segmentação eficiente** da base de usuários

### Para o Sistema
- **Validação robusta** no frontend e backend
- **Flexibilidade** para adicionar novos modelos
- **Manutenibilidade** da configuração centralizada

## 🚀 Próximos Passos

1. **Análise de Uso**: Monitorar quais modelos são mais populares por plano
2. **Otimização**: Ajustar custos baseado no uso real
3. **Novos Modelos**: Adicionar novos modelos conforme disponibilidade
4. **A/B Testing**: Testar diferentes configurações de planos

## 📈 Métricas a Acompanhar

- Taxa de conversão FREE → PRO ao tentar usar modelos PRO
- Taxa de conversão PRO → PREMIUM ao tentar usar modelos PREMIUM  
- Uso por modelo em cada plano
- Satisfação do usuário com qualidade por plano 