# 🧪 Teste do Sistema de Créditos ADMIN

## 🎯 Como Testar

### **1. Criar Usuário ADMIN**
1. Acesse **Supabase Dashboard** → **SQL Editor**
2. Execute o arquivo `criar_admin.sql`
3. Substitua `'seu-email@exemplo.com'` pelo email real

### **2. Verificar Interface**
1. Faça login com o usuário ADMIN
2. Vá para qualquer página do sistema
3. Procure pelos badges:
   - 👑 **"ADMIN"** (cor roxa)
   - ∞ **"Créditos Ilimitados"** (cor verde)

### **3. Testar Funcionalidades**

#### **Teste 1: Criar Apresentação**
1. Crie uma nova apresentação
2. Escolha **30+ cards** (mais que o limite Premium)
3. Verifique se permite criar
4. Após criação, verifique se **não debitou créditos**

#### **Teste 2: Gerar Imagens**
1. Gere múltiplas imagens
2. Use diferentes qualidades (Básica, Avançada, Premium)
3. Verifique se **não debitou créditos**

#### **Teste 3: Usar Modelos Premium**
1. Tente usar modelos que normalmente requerem plano Premium
2. Verifique se tem acesso a todos os modelos
3. Confirme que **não debitou créditos**

### **4. Comparar com Usuário Normal**
1. Crie outro usuário ou use existente
2. Verifique que usuário normal:
   - Tem limitações de créditos
   - Vê barra de progresso
   - Tem limites por plano
   - **Debita créditos** normalmente

## ✅ Resultado Esperado

### **Usuário ADMIN deve:**
- ✅ Ver badges "👑 ADMIN" e "∞ Créditos Ilimitados"
- ✅ Criar apresentações sem gastar créditos
- ✅ Usar qualquer modelo/qualidade de imagem
- ✅ Não ter limite de cards por apresentação
- ✅ Ter acesso total ao sistema

### **Usuário normal deve:**
- ❌ Ver sistema normal com limitações
- ❌ Gastar créditos normalmente
- ❌ Ter limites por plano
- ❌ Não ter acesso a funcionalidades premium

## 🔍 Verificação no Banco

### **Verificar Role:**
```sql
SELECT email, role FROM users WHERE email = 'seu-email@exemplo.com';
```

### **Verificar Consumo de Créditos:**
```sql
-- Deve retornar 0 ou não existir para ADMINs
SELECT * FROM "UserUsage" 
WHERE "userId" = 'USER_ID_ADMIN' AND "usageType" = 'ai_credits';
```

## 🐛 Possíveis Problemas

### **Se não funcionar:**
1. **Verificar role no banco** - Deve estar como 'ADMIN'
2. **Limpar cache** - Recarregar página
3. **Verificar logs** - Console do DevTools
4. **Recompilação** - `npm run build`

### **Se ainda não funcionar:**
1. Verificar se as modificações estão corretas
2. Verificar se não há erros de TypeScript
3. Verificar conexão com banco
4. Reiniciar servidor de desenvolvimento

## 📝 Checklist de Teste

- [ ] Usuário promovido para ADMIN no banco
- [ ] Badges "👑 ADMIN" e "∞ Créditos Ilimitados" aparecendo
- [ ] Criar apresentação com 30+ cards sem erro
- [ ] Gerar imagens sem debitar créditos
- [ ] Usar modelos premium sem restrição
- [ ] Usuário normal ainda tem limitações
- [ ] Sistema não afeta outros usuários

## 🎉 Sucesso!

Se todos os testes passarem, o sistema está funcionando corretamente e usuários ADMIN têm acesso ilimitado ao sistema sem consumir créditos. 