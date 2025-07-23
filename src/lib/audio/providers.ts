import { Emitter } from '../Emitter';
import { speakWithLipSync, stopLipSyncAudio, triggerRandomExpression, triggerRandomMotion } from '../../components/live2d-handler'; 
import type { audioEvent } from '../../components/types/ws_model'

// Interfaz para la configuración del TTS Provider
interface TTSConfig {
    audioFormat?: string;
    [key: string]: any;
}

// Interfaz para opciones de speak
interface SpeakOptions {
    voice?: string;
    rate?: number;
    pitch?: number;
    volume?: number;
    language?: string;
    cb?: void;
    [key: string]: any;
}


// Declaración del audioEmitter (asumiendo que viene de otro módulo)
const audioEmitter: Emitter = new Emitter();

export class TTSProvider {
    protected cfg: TTSConfig;
    protected activeAudio: HTMLAudioElement | null;
    protected emitter: Emitter;

    constructor(cfg: TTSConfig = {}) {
        this.cfg = cfg;
        this.activeAudio = null;
        this.emitter = audioEmitter;
    }

    async init(): Promise<boolean> {
        console.log(`Initializing ${this.constructor.name}`);
        return true;
    }

    isAvailable(): boolean {
        return false;
    }

    getVoices(): any[] {
        return [];
    }

    async speak(text: string, opts: SpeakOptions = {}): Promise<void> {
        console.log(text, opts, "speak debug", this.cfg);
        throw new Error(`'speak' not implemented in ${this.constructor.name}`);
    }

    async generateAudioUrl(text: string, opts: SpeakOptions = {}): Promise<string> {
        throw new Error(`'generateAudioUrl' not implemented in ${this.constructor.name}`);
    }

    pause(): void {
        if (this.activeAudio) {
            console.log(`Pausing audio for ${this.constructor.name}`);
            this.activeAudio.pause();
        }
    }

    stop(): void {
        if (this.activeAudio) {
            console.log(`Stopping audio for ${this.constructor.name}`);
            this.activeAudio.pause();
            this.activeAudio.oncanplaythrough = null;
            this.activeAudio.onended = null;
            this.activeAudio.onerror = null;
            this.activeAudio.src = '';
            this.activeAudio = null;
        }
    }

    resume(): void {
        if (this.activeAudio) {
            console.log(`Resuming audio for ${this.constructor.name}`);
            this.activeAudio.play();
        }
    }
}
function base64ToBlob(b64: string): Blob {
  // Maneja el caso de que la cadena base64 incluya el prefijo de tipo MIME
  const base64Data = b64.startsWith('data:audio') ? b64.split(',')[1] : b64;
  try {
    const bytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    // Asumimos 'audio/wav' o 'audio/mp3', puedes hacerlo más flexible
    return new Blob([bytes], { type: 'audio/wav' }); 
  } catch (e) {
    console.error("Error al decodificar base64:", e);
    // Devuelve un blob vacío para evitar que se rompa el resto del código
    return new Blob([], { type: 'application/octet-stream' });
  }
}

export class WebSocketAudioProvider extends TTSProvider {
  constructor(cfg: TTSConfig = {}) {
    super(cfg);
    console.log("WebSocketAudioProvider inicializado.");
  }

  isAvailable(): boolean {
    return true;
  }
  
  // ¡Método stop corregido!
  stop(): void {
    console.log(`Deteniendo audio (manejado por Live2D) para ${this.constructor.name}`);
    stopLipSyncAudio(); // Llama a la nueva función de tu manejador de Live2D
  }


  /**
   * "Habla" delegando la reproducción al manejador de Live2D para el lip-sync.
   * @param audioBase64 - El audio en formato base64.
   * @param opts - Opciones adicionales.
   * @returns Una promesa que se resuelve cuando el audio termina.
   */
  async speak(audioBase64: string, opts: audioEvent ={
    type:'audio'
  }): Promise<void> {
    return new Promise((resolve, reject) => {
      // Detenemos cualquier audio anterior que este proveedor estuviera reproduciendo.
      this.stop(); 
      
      if (!audioBase64) {
        console.error("WebSocketAudioProvider: se recibió un audio base64 vacío.");
        return reject(new Error("Audio base64 vacío."));
      }

      try {
        const blob = base64ToBlob(audioBase64);
        const url = URL.createObjectURL(blob);

        // --- ÚNICO PUNTO DE REPRODUCCIÓN ---
        // Delegamos la reproducción y el manejo de eventos a speakWithLipSync.
        // Ya no creamos nuestro propio new Audio().

        this.emitter.emit('audio:play', { provider: this.constructor.name });
        if (opts && opts.actions && opts.actions.expressions){
          triggerRandomExpression(opts.actions.expressions?.[0])
        }
        speakWithLipSync(
          url,
          () => { // onFinish callback
            console.log("Reproducción de audio (via Live2D) finalizada.");
            this.emitter.emit('audio:end', { provider: this.constructor.name });
            URL.revokeObjectURL(url); // Liberar memoria
            resolve();
          },
          (error) => { // onError callback
            console.error("Error durante la reproducción del audio (via Live2D):", error);
            this.emitter.emit('audio:error', { provider: this.constructor.name, error });
            URL.revokeObjectURL(url); // Liberar memoria
            reject(error);
          }
        );

      } catch (error) {
        console.error("Error al procesar el audio base64:", error);
        reject(error);
      }
    });
  }
}
export type {
    TTSConfig,
    SpeakOptions,
};
export {
    audioEmitter,
    base64ToBlob
}