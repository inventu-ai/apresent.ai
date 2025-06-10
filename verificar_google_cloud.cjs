require('dotenv').config();
const { GoogleAuth } = require('google-auth-library');
const fs = require('fs');

async function verificarConfiguracao() {
  console.log("🔍 Verificando configuração do Google Cloud...\n");

  // 1. Verificar variáveis de ambiente
  console.log("1. Verificando variáveis de ambiente:");
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  
  console.log(`   GOOGLE_CLOUD_PROJECT_ID: ${projectId ? '✅ Configurado' : '❌ Não configurado'}`);
  console.log(`   GOOGLE_APPLICATION_CREDENTIALS: ${credentialsPath ? '✅ Configurado' : '❌ Não configurado'}`);
  
  if (!projectId) {
    console.log("❌ GOOGLE_CLOUD_PROJECT_ID não está configurado no .env");
    return;
  }

  // 2. Verificar arquivo de credenciais
  console.log("\n2. Verificando arquivo de credenciais:");
  if (credentialsPath && fs.existsSync(credentialsPath)) {
    console.log(`   ✅ Arquivo existe: ${credentialsPath}`);
    
    try {
      const credentialsContent = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
      console.log(`   ✅ Project ID no arquivo: ${credentialsContent.project_id}`);
      console.log(`   ✅ Client email: ${credentialsContent.client_email}`);
      
      if (credentialsContent.project_id !== projectId) {
        console.log(`   ⚠️  Project ID no arquivo (${credentialsContent.project_id}) difere da variável de ambiente (${projectId})`);
      }
    } catch (error) {
      console.log(`   ❌ Erro ao ler arquivo de credenciais: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      return;
    }
  } else {
    console.log(`   ❌ Arquivo não encontrado: ${credentialsPath}`);
    return;
  }

  // 3. Testar autenticação
  console.log("\n3. Testando autenticação:");
  try {
    const auth = new GoogleAuth({
      keyFile: credentialsPath,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    const authClient = await auth.getClient();
    const accessToken = await authClient.getAccessToken();
    
    if (accessToken.token) {
      console.log("   ✅ Autenticação bem-sucedida");
      console.log(`   ✅ Token obtido (primeiros 20 chars): ${accessToken.token.substring(0, 20)}...`);
    } else {
      console.log("   ❌ Falha ao obter token de acesso");
      return;
    }

    // 4. Testar acesso à API Vertex AI
    console.log("\n4. Testando acesso à API Vertex AI:");
    const endpoint = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/imagen-3.0-generate-001`;
    
    console.log(`   Testando endpoint: ${endpoint}`);
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken.token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`   Status da resposta: ${response.status} ${response.statusText}`);
    
    if (response.status === 404) {
      console.log("   ⚠️  Endpoint retornou 404 - isso pode ser normal para um GET request");
    } else if (response.status === 403) {
      console.log("   ❌ Acesso negado (403) - verificar permissões IAM");
    } else if (response.status === 401) {
      console.log("   ❌ Não autorizado (401) - problema de autenticação");
    } else {
      console.log(`   ✅ API acessível (status ${response.status})`);
    }

  } catch (error) {
    console.log(`   ❌ Erro na autenticação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }

  // 5. Verificar modelo Fast
  console.log("\n5. Testando modelo Imagen 3 Fast:");
  try {
    const auth = new GoogleAuth({
      keyFile: credentialsPath,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    const authClient = await auth.getClient();
    const accessToken = await authClient.getAccessToken();
    
    const fastEndpoint = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/imagen-3.0-fast-generate-001`;
    
    console.log(`   Testando endpoint Fast: ${fastEndpoint}`);
    
    const response = await fetch(fastEndpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken.token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`   Status da resposta Fast: ${response.status} ${response.statusText}`);
    
  } catch (error) {
    console.log(`   ❌ Erro ao testar modelo Fast: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }

  console.log("\n📋 Próximos passos se houver problemas:");
  console.log("1. Verificar se a Vertex AI API está habilitada:");
  console.log("   gcloud services enable aiplatform.googleapis.com");
  console.log("2. Verificar permissões IAM do Service Account:");
  console.log("   - Vertex AI User (roles/aiplatform.user)");
  console.log("   - ML Engine Developer (roles/ml.developer)");
  console.log("3. Verificar se o projeto tem billing habilitado");
  console.log("4. Tentar na região us-central1 especificamente");
}

// Executar verificação
verificarConfiguracao().catch(console.error); 