/**
 * Utilitários de debug para desenvolvimento
 */

// Função para habilitar/desabilitar o debug da fila de imagens
export function toggleImageQueueDebug(enable: boolean = true) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('showImageQueueDebug', enable.toString());
    console.log(`Image Queue Debug ${enable ? 'enabled' : 'disabled'}. Refresh the page to see changes.`);
  }
}

// Função para limpar todas as filas de imagem
export function clearAllImageQueues() {
  if (typeof window !== 'undefined') {
    const { clearImageQueues } = require('@/lib/image-queue');
    clearImageQueues();
    console.log('All image queues cleared.');
  }
}

// Função para obter estatísticas das filas
export function getQueueStats() {
  if (typeof window !== 'undefined') {
    const { getImageQueueStats } = require('@/lib/image-queue');
    const stats = getImageQueueStats();
    console.table(stats);
    return stats;
  }
}

// Adicionar funções ao objeto window para acesso fácil no console
if (typeof window !== 'undefined') {
  (window as any).debugImageQueue = {
    enable: () => toggleImageQueueDebug(true),
    disable: () => toggleImageQueueDebug(false),
    clear: clearAllImageQueues,
    stats: getQueueStats,
    help: () => {
      console.log(`
🔧 Image Queue Debug Commands:
- debugImageQueue.enable()  - Enable debug panel
- debugImageQueue.disable() - Disable debug panel  
- debugImageQueue.clear()   - Clear all queues
- debugImageQueue.stats()   - Show queue statistics
- debugImageQueue.help()    - Show this help

Example usage:
debugImageQueue.enable()    // Enable debug panel
debugImageQueue.stats()     // Check current stats
debugImageQueue.clear()     // Clear stuck queues
      `);
    }
  };
}
