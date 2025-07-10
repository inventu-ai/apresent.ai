/**
 * Sistema de fila para controlar requisições de geração de imagem
 * Evita rate limiting e gerencia concorrência
 */

import type { ImageModelList } from "@/app/_actions/image/generate";

interface QueueItem {
  id: string;
  model: ImageModelList;
  prompt: string;
  aspectRatio: string;
  resolve: (result: string) => void;
  reject: (error: Error) => void;
  attempts: number;
  maxAttempts: number;
}

type Provider = 'google' | 'apiframe' | 'ideogram' | 'direct';

class ImageGenerationQueue {
  private googleQueue: QueueItem[] = [];
  private apiframeQueue: QueueItem[] = [];
  private ideogramQueue: QueueItem[] = [];
  
  private isProcessingGoogle = false;
  private isProcessingApiframe = false;
  private isProcessingIdeogram = false;
  
  // Configurações específicas por provider
  private readonly QUEUE_CONFIGS = {
    google: { delay: 1500, maxRetries: 3 },      // 1.5s delay
    apiframe: { delay: 2000, maxRetries: 3 },    // 2s delay (APIFrame pode precisar de mais tempo)
    ideogram: { delay: 1000, maxRetries: 2 }     // 1s delay (mais estável)
  };

  /**
   * Determina qual provider usar baseado no modelo
   */
  private getModelProvider(model: ImageModelList): Provider {
    if (model.includes('google-imagen')) {
      return 'google';
    }
    
    if (['midjourney-imagine', 'flux-pro', 'flux-dev', 'flux-pro-1.1', 'flux-pro-1.1-ultra', 'flux-fast-1.1'].includes(model)) {
      return 'apiframe';
    }
    
    if (['ideogram-v2', 'ideogram-v2-turbo', 'ideogram-v3'].includes(model)) {
      return 'ideogram';
    }
    
    // OpenAI e outros modelos que não precisam de fila
    return 'direct';
  }

  /**
   * Adiciona uma requisição à fila apropriada
   */
  async enqueue(
    model: ImageModelList,
    prompt: string,
    aspectRatio: string,
    generateFunction: (prompt: string, model: string, aspectRatio: string) => Promise<string>
  ): Promise<string> {
    const id = this.generateId();
    const provider = this.getModelProvider(model);

    // Se não precisa de fila, executa imediatamente
    if (provider === 'direct') {
      return await generateFunction(prompt, model, aspectRatio);
    }

    // Adiciona à fila apropriada
    return new Promise<string>((resolve, reject) => {
      const config = this.QUEUE_CONFIGS[provider];
      const queueItem: QueueItem = {
        id,
        model,
        prompt,
        aspectRatio,
        resolve,
        reject,
        attempts: 0,
        maxAttempts: config.maxRetries
      };

      // Adiciona à fila correta
      if (provider === 'google') {
        this.googleQueue.push(queueItem);
        console.log(`🔄 Adicionado à fila Google: ${model} (${this.googleQueue.length} na fila)`);
        if (!this.isProcessingGoogle) {
          this.processQueue('google', generateFunction);
        }
      } else if (provider === 'apiframe') {
        this.apiframeQueue.push(queueItem);
        console.log(`🔄 Adicionado à fila APIFrame: ${model} (${this.apiframeQueue.length} na fila)`);
        if (!this.isProcessingApiframe) {
          this.processQueue('apiframe', generateFunction);
        }
      } else if (provider === 'ideogram') {
        this.ideogramQueue.push(queueItem);
        console.log(`🔄 Adicionado à fila Ideogram: ${model} (${this.ideogramQueue.length} na fila)`);
        if (!this.isProcessingIdeogram) {
          this.processQueue('ideogram', generateFunction);
        }
      }
    });
  }

  /**
   * Processa uma fila específica sequencialmente
   */
  private async processQueue(
    provider: 'google' | 'apiframe' | 'ideogram',
    generateFunction: (prompt: string, model: string, aspectRatio: string) => Promise<string>
  ): Promise<void> {
    // Verifica se já está processando
    if (provider === 'google' && this.isProcessingGoogle) return;
    if (provider === 'apiframe' && this.isProcessingApiframe) return;
    if (provider === 'ideogram' && this.isProcessingIdeogram) return;
    
    // Marca como processando
    if (provider === 'google') this.isProcessingGoogle = true;
    if (provider === 'apiframe') this.isProcessingApiframe = true;
    if (provider === 'ideogram') this.isProcessingIdeogram = true;
    
    const queue = this.getQueue(provider);
    const config = this.QUEUE_CONFIGS[provider];
    
    console.log(`🚀 Iniciando processamento da fila ${provider.toUpperCase()} (${queue.length} itens)`);

    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) continue;

      try {
        console.log(`🎯 Processando ${provider}: ${item.model} (tentativa ${item.attempts + 1}/${item.maxAttempts})`);
        
        // Executa a geração
        const result = await generateFunction(item.prompt, item.model, item.aspectRatio);
        
        console.log(`✅ Sucesso ${provider}: ${item.model} - ${item.id}`);
        item.resolve(result);

      } catch (error) {
        item.attempts++;
        console.error(`❌ Erro ${provider}: ${item.model} - tentativa ${item.attempts}/${item.maxAttempts}:`, error);

        if (item.attempts < item.maxAttempts) {
          // Recoloca na fila para retry com backoff exponencial
          const delay = this.calculateBackoffDelay(item.attempts);
          console.log(`🔄 Reagendando ${provider}: ${item.model} em ${delay}ms`);
          
          setTimeout(() => {
            queue.unshift(item); // Adiciona no início para prioridade
          }, delay);
        } else {
          // Máximo de tentativas atingido, rejeita
          console.error(`💥 Máximo de tentativas atingido para ${provider}: ${item.model} - ${item.id}`);
          item.reject(error instanceof Error ? error : new Error('Falha na geração após múltiplas tentativas'));
        }
      }

      // Delay entre requisições para evitar rate limiting
      if (queue.length > 0) {
        console.log(`⏳ Aguardando ${config.delay}ms antes da próxima requisição ${provider}...`);
        await this.delay(config.delay);
      }
    }

    // Marca como não processando
    if (provider === 'google') this.isProcessingGoogle = false;
    if (provider === 'apiframe') this.isProcessingApiframe = false;
    if (provider === 'ideogram') this.isProcessingIdeogram = false;
    
    console.log(`🏁 Processamento da fila ${provider.toUpperCase()} finalizado`);
  }

  /**
   * Obtém a fila correspondente ao provider
   */
  private getQueue(provider: 'google' | 'apiframe' | 'ideogram'): QueueItem[] {
    if (provider === 'google') {
      return this.googleQueue;
    } else if (provider === 'apiframe') {
      return this.apiframeQueue;
    } else if (provider === 'ideogram') {
      return this.ideogramQueue;
    } else {
      throw new Error("Provider desconhecido");
    }
  }

  /**
   * Calcula delay para backoff exponencial
   */
  private calculateBackoffDelay(attempt: number): number {
    // 2^attempt * 1000ms (1s, 2s, 4s, 8s...)
    return Math.min(Math.pow(2, attempt) * 1000, 10000); // Máximo 10s
  }

  /**
   * Gera ID único para requisição
   */
  private generateId(): string {
    return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Utilitário para delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Obtém estatísticas de todas as filas
   */
  getQueueStats() {
    return {
      google: {
        queueLength: this.googleQueue.length,
        isProcessing: this.isProcessingGoogle,
        delay: this.QUEUE_CONFIGS.google.delay,
        maxRetries: this.QUEUE_CONFIGS.google.maxRetries
      },
      apiframe: {
        queueLength: this.apiframeQueue.length,
        isProcessing: this.isProcessingApiframe,
        delay: this.QUEUE_CONFIGS.apiframe.delay,
        maxRetries: this.QUEUE_CONFIGS.apiframe.maxRetries
      },
      ideogram: {
        queueLength: this.ideogramQueue.length,
        isProcessing: this.isProcessingIdeogram,
        delay: this.QUEUE_CONFIGS.ideogram.delay,
        maxRetries: this.QUEUE_CONFIGS.ideogram.maxRetries
      }
    };
  }

  /**
   * Limpa todas as filas (para testes ou reset)
   */
  clearQueues(): void {
    // Limpa fila Google
    this.googleQueue.forEach(item => {
      item.reject(new Error('Fila limpa'));
    });
    this.googleQueue = [];
    this.isProcessingGoogle = false;

    // Limpa fila APIFrame
    this.apiframeQueue.forEach(item => {
      item.reject(new Error('Fila limpa'));
    });
    this.apiframeQueue = [];
    this.isProcessingApiframe = false;

    // Limpa fila Ideogram
    this.ideogramQueue.forEach(item => {
      item.reject(new Error('Fila limpa'));
    });
    this.ideogramQueue = [];
    this.isProcessingIdeogram = false;

    console.log('🧹 Todas as filas foram limpas');
  }

  /**
   * Obtém informações sobre qual provider um modelo usa
   */
  getModelProviderInfo(model: ImageModelList): {
    provider: Provider;
    needsQueue: boolean;
    config?: { delay: number; maxRetries: number };
  } {
    const provider = this.getModelProvider(model);
    const needsQueue = provider !== 'direct';
    
    let config: { delay: number; maxRetries: number } | undefined = undefined;
    if (needsQueue && (provider === 'google' || provider === 'apiframe' || provider === 'ideogram')) {
      config = this.QUEUE_CONFIGS[provider];
    }

    return {
      provider,
      needsQueue,
      config
    };
  }
}

// Instância singleton da fila
export const imageQueue = new ImageGenerationQueue();

/**
 * Função helper para adicionar requisição à fila
 */
export async function queueImageGeneration(
  model: ImageModelList,
  prompt: string,
  aspectRatio: string,
  generateFunction: (prompt: string, model: string, aspectRatio: string) => Promise<string>
): Promise<string> {
  return await imageQueue.enqueue(model, prompt, aspectRatio, generateFunction);
}

/**
 * Função helper para obter estatísticas
 */
export function getImageQueueStats() {
  return imageQueue.getQueueStats();
}

/**
 * Função helper para limpar filas
 */
export function clearImageQueues() {
  imageQueue.clearQueues();
}

/**
 * Função helper para obter informações do provider de um modelo
 */
export function getModelProviderInfo(model: ImageModelList) {
  return imageQueue.getModelProviderInfo(model);
}
