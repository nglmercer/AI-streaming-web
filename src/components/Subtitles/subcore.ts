// src/lib/subtitles/index.ts
import { SubtitleManager } from './SubtitleManager';
import type { SubtitleConfig, QueuedSubtitle, SubtitlePosition, SubtitleStyle } from './types';

/**
 * Creamos una única instancia global (patrón Singleton).
 * Esto asegura que todos los componentes y scripts en tu aplicación
 * compartan el mismo estado de subtítulos.
 */
const manager = new SubtitleManager();

// Don't initialize immediately - wait for explicit call or DOM ready
let isInitialized = false;

// Auto-initialize when DOM is ready if not already done
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (!isInitialized) {
        isInitialized = manager.init();
      }
    });
  } else {
    // DOM is already ready
    setTimeout(() => {
      if (!isInitialized) {
        isInitialized = manager.init();
      }
    }, 0);
  }
}

// API pública que exportamos para ser usada en cualquier parte de la app.
export const Subtitles = {
  // Inicializador (importante llamarlo en el componente contenedor)
  init: (rootElementId?: string) => {
    isInitialized = manager.init(rootElementId);
    return isInitialized;
  },
 
  // Check if initialized
  isInitialized: () => isInitialized,
 
  // Métodos principales
  show: (config: SubtitleConfig) => {
    if (!isInitialized) {
      console.warn('Subtitles not initialized. Attempting to initialize...');
      isInitialized = manager.init();
      if (!isInitialized) {
        console.error('Failed to initialize subtitles');
        return '';
      }
    }
    return manager.show(config);
  },
  
  hide: (id: string) => manager.hide(id),
  hideAll: () => manager.hideAll(),
  clear: () => manager.clear(),
  
  // Colas
  queue: (queueId: string, subtitles: QueuedSubtitle[]) => manager.queue(queueId, subtitles),
  stopQueue: (queueId: string) => manager.stopQueue(queueId),
  
  // Utilidades
  count: () => manager.count(),
  getActiveIds: () => manager.getActiveIds(),
  isVisible: (id: string) => manager.isVisible(id),
  
  // Actualizaciones dinámicas
  updatePosition: (id: string, position: SubtitlePosition) => manager.updatePosition(id, position),
 
  // Constantes útiles para no tener que importar la clase
  POSITIONS: SubtitleManager.POSITIONS,
  STYLES: SubtitleManager.STYLES,
  ANIMATIONS: SubtitleManager.ANIMATIONS,
  
  // Métodos de conveniencia
  showAt(text: string, positionKey: keyof typeof SubtitleManager.POSITIONS, duration?: number) {
    return this.show({
      text,
      position: SubtitleManager.POSITIONS[positionKey],
      duration,
    });
  },
  
  showWithStyle(text: string, styleKey: keyof typeof SubtitleManager.STYLES, duration?: number) {
    return this.show({
      text,
      style: SubtitleManager.STYLES[styleKey],
      duration,
    });
  },
};