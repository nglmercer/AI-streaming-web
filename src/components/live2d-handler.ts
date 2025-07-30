// src/scripts/live2d-handler.ts

import * as PIXI from "pixi.js";
import { defaulConfig } from "@assets/defaultConfig";
import {   
  Live2DModel,   
  MotionPreloadStrategy,   
  MotionPriority   
} from 'pixi-live2d-display-lipsyncpatch';
// --- REGISTRO DE PLUGINS ---
// Esto se hace aquí, al principio del script del cliente.
// Astro se asegurará de que este código solo se ejecute en el navegador.

// --- Definición de los modelos ---
const cubism2Model = "https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/assets/shizuku/shizuku.model.json";
const cubism4Model = "https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/assets/haru/haru_greeter_t03.model3.json";
const shizuku_JSON = '/models/shizuku/shizuku.model.json';
// --- Variables Globales ---
let currentModel: Live2DModel | null = null;

// Obtener elementos del DOM (Asegúrate de que el script se cargue después de que el HTML exista)
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const btnShizuku = document.getElementById('btn-shizuku') as HTMLButtonElement;
const btnHaru = document.getElementById('btn-haru') as HTMLButtonElement;
const btnExpression = document.getElementById('btn-expression') as HTMLButtonElement;
const btnMotion = document.getElementById('btn-motion') as HTMLButtonElement;
const loadingText = document.getElementById('loading-text') as HTMLParagraphElement;

// @ts-ignore
const app = new PIXI.Application({  
    view: canvas,  
    autoStart: true,  
    backgroundColor: 0x000000,  
    resolution: window.devicePixelRatio || 1,
    autoResize: true,
    backgroundAlpha: 0
});

async function setTiledBackground(src: string) {
    if (!canvas) return;
    canvas.style.backgroundImage = `url(${src})`;
    canvas.style.backgroundSize = 'cover';
    
    console.log("setTiledBackground",src,canvas);
}
// --- Funciones (sin cambios) ---

async function loadModel(url: string) {  
    toggleControls(false);  
    loadingText.classList.remove('hidden');  
  
    if (currentModel) {  
        app.stage.removeChild(currentModel as any);  
        currentModel.destroy({ children: true, texture: true, baseTexture: true });  
    }  
  
    try {  
        // Usar opciones avanzadas del módulo lipsync  
        currentModel = await Live2DModel.from(url, {  
            autoHitTest: true,  
            autoFocus: false,  
            autoUpdate: true,  
            ticker: app.ticker as any,
            motionPreload: MotionPreloadStrategy.IDLE,  
            // idleMotionGroupName: 'idle' // opcional, si tu modelo lo soporta  
        });  
          
        app.stage.addChild(currentModel as any);  
  
        const scale = Math.min(  
            (app.view.width * 0.8) / currentModel.width,  
            (app.view.height * 0.8) / currentModel.height  
        );  
        currentModel.scale.set(scale);  
        currentModel.x = (app.view.width - currentModel.width) / 2;  
        currentModel.y = (app.view.height - currentModel.height) / 2;  
          
        currentModel.eventMode = 'auto';  
        currentModel.on('hit', () => triggerRandomMotion());  
  
    } catch (error) {  
        console.error("Error al cargar el modelo:", error);  
    } finally {  
        toggleControls(true);  
        loadingText.classList.add('hidden');  
    }  
}

function toggleControls(enabled: boolean) {
    btnShizuku.disabled = !enabled;
    btnHaru.disabled = !enabled;
    btnExpression.disabled = !enabled;
    btnMotion.disabled = !enabled;
}
// Función adicional para obtener lista de expresiones  
function getAvailableExpressions(): string[] {  
    if (!currentModel) return [];  
      
    const expressionManager = currentModel.internalModel.motionManager.expressionManager;  
    return expressionManager?.definitions.map(d => d.name) || [];  
}
function triggerRandomExpression(expression?:string |number ) {  
    if (!currentModel) return;  
    
    // Usar el expressionManager del módulo lipsync  
    const expressionManager = currentModel.internalModel.motionManager.expressionManager;  
    if (!expressionManager) return;  
    
    const expressions = expressionManager.definitions;  
    if (!expressions || expressions.length === 0) return;  
    
    const randomIndex = Math.floor(Math.random() * expressions.length);  
    const randomExpression = expressions[randomIndex].name;  
    console.log("triggerRandomExpression",expression || randomExpression)
      
    expressionManager.setExpression(expression || randomExpression);  
}  

function triggerRandomMotion(groupName?: string): void {
    if (!currentModel) {
        console.error("Current model is not defined");
        return;
    }
    
    const priority = MotionPriority.NORMAL;
    const motionManager = currentModel.internalModel.motionManager;
    
    if (!motionManager.motionGroups) return;
    console.log("triggerRandomMotion", motionManager.motionGroups);

    const motions = Object.keys(motionManager.motionGroups);
    if (motions.length === 0) return;

    const randomIndex = Math.floor(Math.random() * motions.length);
    const randomMotion = motions[randomIndex];

    console.log("Selected random motion:", randomMotion);

    // Reproducir el movimiento seleccionado
    currentModel.motion(groupName || randomMotion, undefined, priority);
}
/**
 * Reproduce un audio con lip-sync y notifica su estado a través de callbacks.
 * @param audioUrl La URL del audio a reproducir.
 * @param onFinish Callback que se ejecuta cuando el audio termina.
 * @param onError Callback que se ejecuta si hay un error.
 */
async function speakWithLipSync(audioUrl: string, onFinish: () => void, onError: (e: any) => void) {
    if (!currentModel) {
        console.error("No hay un modelo Live2D cargado para hablar.");
        onError(new Error("No Live2D model loaded."));
        return;
    }

    try {
        // La biblioteca de lipsync ya proporciona callbacks
        await currentModel.speak(audioUrl, {
            onFinish, // Pasamos el callback directamente
            onError,  // Pasamos el callback directamente
        });
    } catch (error) {
        console.error("Error al iniciar el lip sync:", error);
        onError(error);
    }
}

/**
 * Detiene cualquier audio que se esté reproduciendo a través del lip-sync.
 */
function stopLipSyncAudio() {
    if (currentModel) {
        // La biblioteca tiene su propio método para detener el habla
        currentModel.stopSpeaking();
    }
}
// --- Asignar eventos y carga inicial ---
btnShizuku.onclick = () => loadModel(shizuku_JSON);
btnHaru.onclick = () => loadModel(cubism4Model);
btnExpression.onclick = ()=>{triggerRandomExpression()}
btnMotion.onclick = ()=>{triggerRandomMotion()}

setTiledBackground(defaulConfig.background);
setTimeout(() => setTiledBackground(defaulConfig.background), 1000);
loadModel(cubism2Model); // Cargar el modelo inicial
export {
    speakWithLipSync,
    getAvailableExpressions,
    triggerRandomExpression,
    triggerRandomMotion,
    stopLipSyncAudio
}