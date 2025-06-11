import { GoogleAuth } from "google-auth-library";
import { env } from "@/env";
import fs from "fs";
import path from "path";

interface GoogleCredentials {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

/**
 * Cria uma instância do GoogleAuth configurada adequadamente para o ambiente atual
 * Prioridade:
 * 1. GOOGLE_SERVICE_ACCOUNT_KEY (string JSON base64) - para produção
 * 2. GOOGLE_APPLICATION_CREDENTIALS (caminho do arquivo) - para desenvolvimento
 * 3. Application Default Credentials - fallback
 */
export async function createGoogleAuth(): Promise<GoogleAuth> {
  const scopes = ["https://www.googleapis.com/auth/cloud-platform"];

  try {
    // Opção 1: Usar GOOGLE_SERVICE_ACCOUNT_KEY (recomendado para produção)
    if (env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      console.log("🔑 Usando GOOGLE_SERVICE_ACCOUNT_KEY para autenticação");
      
      let credentials: GoogleCredentials;
      
      try {
        // Primeiro tenta como JSON direto (mais simples)
        credentials = JSON.parse(env.GOOGLE_SERVICE_ACCOUNT_KEY);
      } catch {
        try {
          // Se falhar, tenta decodificar base64 (compatibilidade)
          const decodedKey = Buffer.from(env.GOOGLE_SERVICE_ACCOUNT_KEY, 'base64').toString('utf-8');
          credentials = JSON.parse(decodedKey);
        } catch (error) {
          throw new Error(`Formato inválido para GOOGLE_SERVICE_ACCOUNT_KEY. Use JSON direto ou base64. Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`);
        }
      }

      return new GoogleAuth({
        credentials,
        scopes,
      });
    }

    // Opção 2: Usar GOOGLE_APPLICATION_CREDENTIALS (desenvolvimento)
    if (env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.log("📁 Usando GOOGLE_APPLICATION_CREDENTIALS para autenticação");
      
      // Verifica se o arquivo existe
      if (!fs.existsSync(env.GOOGLE_APPLICATION_CREDENTIALS)) {
        throw new Error(`Arquivo de credenciais não encontrado: ${env.GOOGLE_APPLICATION_CREDENTIALS}`);
      }

      return new GoogleAuth({
        keyFile: env.GOOGLE_APPLICATION_CREDENTIALS,
        scopes,
      });
    }

    // Opção 3: Application Default Credentials (fallback)
    console.log("🌐 Tentando usar Application Default Credentials");
    return new GoogleAuth({
      scopes,
    });

  } catch (error) {
    console.error("❌ Erro ao configurar autenticação do Google Cloud:", error);
    throw new Error(
      `Falha na autenticação do Google Cloud: ${error instanceof Error ? error.message : "Erro desconhecido"}. ` +
      "Verifique se GOOGLE_SERVICE_ACCOUNT_KEY ou GOOGLE_APPLICATION_CREDENTIALS estão configurados corretamente."
    );
  }
}

/**
 * Obtém um token de acesso válido para o Google Cloud
 */
export async function getGoogleAccessToken(): Promise<string> {
  const auth = await createGoogleAuth();
  const authClient = await auth.getClient();
  const accessToken = await authClient.getAccessToken();

  if (!accessToken.token) {
    throw new Error("Falha ao obter token de acesso do Google Cloud");
  }

  return accessToken.token;
}

/**
 * Valida se as credenciais do Google Cloud estão configuradas corretamente
 */
export async function validateGoogleCredentials(): Promise<{
  valid: boolean;
  method: string;
  projectId?: string;
  error?: string;
}> {
  try {
    const auth = await createGoogleAuth();
    const authClient = await auth.getClient();
    
    // Tenta obter um token para validar
    const accessToken = await authClient.getAccessToken();
    
    if (!accessToken.token) {
      return {
        valid: false,
        method: "unknown",
        error: "Não foi possível obter token de acesso"
      };
    }

    // Determina qual método está sendo usado
    let method = "unknown";
    if (env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      method = "service_account_key";
    } else if (env.GOOGLE_APPLICATION_CREDENTIALS) {
      method = "credentials_file";
    } else {
      method = "application_default";
    }

    return {
      valid: true,
      method,
      projectId: env.GOOGLE_CLOUD_PROJECT_ID
    };

  } catch (error) {
    return {
      valid: false,
      method: "unknown",
      error: error instanceof Error ? error.message : "Erro desconhecido"
    };
  }
} 