#!/usr/bin/env node

/**
 * Script para converter credenciais do Google Cloud de arquivo JSON para string base64
 * Uso: node scripts/convert-google-credentials.js /caminho/para/service-account.json
 */

const fs = require('fs');
const path = require('path');

function convertCredentials(filePath) {
  try {
    // Verificar se o arquivo existe
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Arquivo não encontrado: ${filePath}`);
      process.exit(1);
    }

    // Ler o arquivo
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Validar se é um JSON válido
    let credentials;
    try {
      credentials = JSON.parse(fileContent);
    } catch (error) {
      console.error(`❌ Arquivo não é um JSON válido: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      process.exit(1);
    }

    // Verificar se tem as propriedades necessárias de um service account
    const requiredFields = ['type', 'project_id', 'private_key', 'client_email'];
    const missingFields = requiredFields.filter(field => !credentials[field]);
    
    if (missingFields.length > 0) {
      console.error(`❌ Service account JSON inválido. Campos obrigatórios ausentes: ${missingFields.join(', ')}`);
      process.exit(1);
    }

    // Converter para base64
    const base64Credentials = Buffer.from(fileContent).toString('base64');

    console.log('\n🔑 Credenciais do Google Cloud convertidas com sucesso!\n');
    console.log('📋 Adicione a seguinte variável ao seu .env de produção:\n');
    console.log(`GOOGLE_SERVICE_ACCOUNT_KEY=${base64Credentials}\n`);
    
    console.log('📝 Informações da Service Account:');
    console.log(`   Project ID: ${credentials.project_id}`);
    console.log(`   Client Email: ${credentials.client_email}`);
    console.log(`   Type: ${credentials.type}\n`);
    
    console.log('⚠️  IMPORTANTE:');
    console.log('   - Mantenha esta variável de ambiente SEGURA');
    console.log('   - Não commit no repositório');
    console.log('   - Use apenas em variáveis de ambiente de produção');
    console.log('   - Para desenvolvimento local, continue usando GOOGLE_APPLICATION_CREDENTIALS\n');

    // Também salvar em arquivo (opcional)
    const outputFile = path.join(process.cwd(), 'google-credentials-base64.txt');
    fs.writeFileSync(outputFile, base64Credentials);
    console.log(`💾 Credenciais base64 salvas em: ${outputFile}`);
    console.log('   (Lembre-se de deletar este arquivo após usar!)\n');

  } catch (error) {
    console.error(`❌ Erro ao processar arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    process.exit(1);
  }
}

// Verificar argumentos
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`
🔑 Conversor de Credenciais do Google Cloud

Uso: node scripts/convert-google-credentials.js <caminho-para-service-account.json>

Exemplo:
  node scripts/convert-google-credentials.js ./path/to/service-account-key.json

Este script converte um arquivo JSON de service account do Google Cloud 
para uma string base64 que pode ser usada na variável GOOGLE_SERVICE_ACCOUNT_KEY
em ambientes de produção.
`);
  process.exit(0);
}

const filePath = args[0];
if (filePath) {
  convertCredentials(path.resolve(filePath));
} else {
  console.error('❌ Caminho do arquivo é obrigatório');
  process.exit(1);
} 