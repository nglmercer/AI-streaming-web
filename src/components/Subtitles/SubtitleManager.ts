// src/lib/subtitles/SubtitleManager.ts

import type {
  SubtitleConfig,
  SubtitlePosition,
  SubtitleStyle,
  AnimationConfig,
  QueuedSubtitle,
  ActiveSubtitle,
} from "./types";
function calculateReadingTimeSimple(text:string, wpm = 200) {
  if (!text || typeof text !== 'string') {
    return 0;
  }

  // Use a regular expression to split by any whitespace and count the words.
  const wordCount = text.trim().split(/\s+/).length;

  // Calculate the time in minutes.
  const timeInMinutes = wordCount / wpm;

  // Convert minutes to milliseconds and round up.
  const timeInMs = Math.ceil(timeInMinutes * 60 * 1000);

  return timeInMs;
}

export class SubtitleManager {
  private root: HTMLElement | null = null;
  private subtitles: Map<string, ActiveSubtitle> = new Map();
  private queues: Map<string, QueuedSubtitle[]> = new Map();
  private activeQueues: Set<string> = new Set();
  private subtitleCounter = 0;
  private hideTimeouts: Map<string, number> = new Map(); // Track hide timeouts

  static POSITIONS = {
    BOTTOM_CENTER: {
      bottom: "10%",
      left: "50%",
      transform: "translateX(-50%)",
    },
    TOP_CENTER: { top: "10%", left: "50%", transform: "translateX(-50%)" },
    BOTTOM_LEFT: { bottom: "10%", left: "5%" },
    BOTTOM_RIGHT: { bottom: "10%", right: "5%" },
    CENTER: { top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
    TOP_LEFT: { top: "10%", left: "5%" },
    TOP_RIGHT: { top: "10%", right: "5%" },
  };

  static STYLES = {
    DEFAULT: {
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      color: "white",
      fontSize: "1.125rem",
      borderRadius: "0.5rem",
      padding: "0.75rem",
      maxWidth: "90%",
      textAlign: "center" as const,
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    },
    ELEGANT: {
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      color: "#1f2937",
      fontSize: "1rem",
      borderRadius: "1rem",
      padding: "1rem 1.5rem",
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
      backdropFilter: "blur(10px)",
    },
    MINIMAL: {
      backgroundColor: "transparent",
      color: "white",
      fontSize: "1.25rem",
      fontWeight: "bold",
      textAlign: "center" as const,
      textShadow: "2px 2px 4px rgba(0, 0, 0, 0.8)",
    },
    CINEMA: {
      backgroundColor: "rgba(0, 0, 0, 0.9)",
      color: "#f9fafb",
      fontSize: "1.375rem",
      fontWeight: "500",
      borderRadius: "0.25rem",
      padding: "1rem 2rem",
      letterSpacing: "0.025em",
    },
  };

  static ANIMATIONS = {
    FADE: {
      enter: "animate-fade-in",
      exit: "animate-fade-out",
      duration: 300,
    },
    SLIDE_UP: {
      enter: "animate-slide-up",
      exit: "animate-slide-down",
      duration: 400,
    },
    SCALE: {
      enter: "animate-scale-in",
      exit: "animate-scale-out",
      duration: 350,
    },
  };

  constructor() {
    if (typeof document === "undefined") {
      console.warn(
        "SubtitleManager: `document` no está disponible. El manager no funcionará en el servidor."
      );
    }
  }

  /**
   * Inicializa el manager. Debe ser llamado en el lado del cliente
   * una vez que el DOM esté listo.
   */
  public init(rootElementId: string = "subtitles-root"): boolean {
    // Evitamos que se inicialice múltiples veces
    if (this.root) return true;

    // Wait for DOM to be ready if it's not
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init(rootElementId));
      return false;
    }

    const rootEl = document.getElementById(rootElementId);
    if (!rootEl) {
      console.error(`Subtitle root element ('#${rootElementId}') not found.`);
      return false;
    }
    
    this.root = rootEl;
    this.injectCSS(); // Inject required CSS animations
    console.log(`SubtitleManager initialized with root: #${rootElementId}`);
    return true;
  }

  private injectCSS(): void {
    // Check if styles are already injected
    if (document.getElementById('subtitle-animations')) return;

    const style = document.createElement('style');
    style.id = 'subtitle-animations';
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
      
      @keyframes slideUp {
        from { 
          opacity: 0; 
          transform: translateY(20px); 
        }
        to { 
          opacity: 1; 
          transform: translateY(0); 
        }
      }
      
      @keyframes slideDown {
        from { 
          opacity: 1; 
          transform: translateY(0); 
        }
        to { 
          opacity: 0; 
          transform: translateY(20px); 
        }
      }
      
      @keyframes scaleIn {
        from { 
          opacity: 0; 
          transform: scale(0.8); 
        }
        to { 
          opacity: 1; 
          transform: scale(1); 
        }
      }
      
      @keyframes scaleOut {
        from { 
          opacity: 1; 
          transform: scale(1); 
        }
        to { 
          opacity: 0; 
          transform: scale(0.8); 
        }
      }
      
      .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
      .animate-fade-out { animation: fadeOut 0.3s ease-out forwards; }
      .animate-slide-up { animation: slideUp 0.4s ease-out forwards; }
      .animate-slide-down { animation: slideDown 0.4s ease-out forwards; }
      .animate-scale-in { animation: scaleIn 0.35s ease-out forwards; }
      .animate-scale-out { animation: scaleOut 0.35s ease-out forwards; }
    `;
    document.head.appendChild(style);
  }

  private generateId(): string {
    return `subtitle-${++this.subtitleCounter}-${Date.now()}`;
  }

  private applyStyles(element: HTMLElement, styles: Record<string, any>): void {
    for (const key in styles) {
      (element.style as any)[key] = styles[key];
    }
  }

  private createElement(config: SubtitleConfig): HTMLElement {
    const id = config.id || this.generateId();
    config.id = id;

    const finalConfig: SubtitleConfig = {
      ...config,
      position: config.position || SubtitleManager.POSITIONS.BOTTOM_CENTER,
      style: config.style || SubtitleManager.STYLES.DEFAULT,
      animation: config.animation || SubtitleManager.ANIMATIONS.FADE,
    };

    const element = document.createElement("div");
    element.id = id;
    element.className = `subtitle-item ${config.className || ""}`;
    this.applyStyles(element, {
      position: "absolute",
      ...finalConfig.position,
      ...finalConfig.style,
    });

    const textElement = document.createElement("p");
    textElement.style.margin = "0";
    if (config.allowHtml) {
      textElement.innerHTML = config.text;
    } else {
      textElement.textContent = config.text;
    }

    element.appendChild(textElement);
    this.subtitles.set(id, { element, config: finalConfig });

    return element;
  }

  public show(config: SubtitleConfig): string {
    if (!this.root) {
      console.error("SubtitleManager not initialized. Call init() first.");
      return "";
    }

    const element = this.createElement(config);
    const activeSubtitle = this.subtitles.get(element.id)!;
    const { animation } = activeSubtitle.config;

    // Clear any existing hide timeout for this subtitle
    const existingTimeout = this.hideTimeouts.get(element.id);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      this.hideTimeouts.delete(element.id);
    }

    // Apply entrance animation
    if (animation?.enter) {
      element.classList.add(animation.enter);
    }

    this.root.appendChild(element);
    const duration= typeof config.duration === 'number' ? config.duration : calculateReadingTimeSimple(config.text);
    // Set auto-hide timer if duration is specified
      const timeoutId = window.setTimeout(() => {
        this.hide(element.id);
      }, duration);
      this.hideTimeouts.set(element.id, timeoutId);
    

    console.log(`Subtitle shown: ${element.id}, duration: ${duration}ms`);
    return element.id;
  }

  public hide(id: string): boolean {
    const activeSubtitle = this.subtitles.get(id);
    if (!activeSubtitle) {
      console.warn(`Subtitle ${id} not found or already hidden`);
      return false;
    }

    const { element, config } = activeSubtitle;
    const animation = config.animation || SubtitleManager.ANIMATIONS.FADE;

    // Clear any pending hide timeout
    const timeoutId = this.hideTimeouts.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.hideTimeouts.delete(id);
    }

    // Remove entrance animation and apply exit animation
    if (animation.enter) element.classList.remove(animation.enter);
    if (animation.exit) element.classList.add(animation.exit);

    // Remove element after animation completes
    setTimeout(() => {
      if (element.parentNode) {
        element.remove();
      }
      this.subtitles.delete(id);
      console.log(`Subtitle hidden: ${id}`);
    }, animation.duration);

    return true;
  }

  public queue(queueId: string, subtitles: QueuedSubtitle[]): void {
    this.queues.set(queueId, [...subtitles]);
    if (!this.activeQueues.has(queueId)) {
      this.processQueue(queueId);
    }
  }

  private async processQueue(queueId: string): Promise<void> {
    this.activeQueues.add(queueId);
    const queue = this.queues.get(queueId);

    if (!queue || queue.length === 0) {
      this.activeQueues.delete(queueId);
      this.queues.delete(queueId);
      return;
    }

    for (const subtitleConfig of queue) {
      // Check if queue was stopped
      if (!this.activeQueues.has(queueId)) break;

      // Wait for delay if specified
      if (subtitleConfig.delay) {
        await new Promise((resolve) => setTimeout(resolve, subtitleConfig.delay));
      }

      // Check again after delay
      if (!this.activeQueues.has(queueId)) break;

      // Show subtitle - it will auto-hide based on its duration
      const id = this.show(subtitleConfig);
      
      // Wait for the subtitle duration before showing the next one
      // This prevents overlapping unless intentional
      if (subtitleConfig.duration) {
        await new Promise((resolve) => setTimeout(resolve, subtitleConfig.duration));
      }
    }

    // Queue finished
    this.activeQueues.delete(queueId);
    this.queues.delete(queueId);
  }

  public stopQueue(queueId: string): void {
    this.activeQueues.delete(queueId);
    this.queues.delete(queueId);
  }

  public clear(): void {
    this.activeQueues.clear();
    this.queues.clear();
    this.hideAll();
  }

  public hideAll(): void {
    // Clear all hide timeouts
    this.hideTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
    this.hideTimeouts.clear();
    
    // Hide all active subtitles
    this.subtitles.forEach((_, id) => this.hide(id));
  }

  public count = (): number => this.subtitles.size;
  public getActiveIds = (): string[] => Array.from(this.subtitles.keys());
  public isVisible = (id: string): boolean => this.subtitles.has(id);

  public updatePosition(id: string, position: SubtitlePosition): boolean {
    const activeSubtitle = this.subtitles.get(id);
    if (!activeSubtitle) return false;
    this.applyStyles(activeSubtitle.element, position);
    return true;
  }
}