// src/scripts/live2d-handler.ts

import * as PIXI from "pixi.js";

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

// Crear la aplicación Pixi
const app = new PIXI.Application({  
    view: canvas,  
    autoStart: true,  
    resizeTo: canvas.parentElement!,  
    backgroundColor: 0x000000,  
    backgroundAlpha: 0.5,  
    antialias: true,  
    powerPreference: "high-performance", // Mejor rendimiento  
    resolution: window.devicePixelRatio || 1, // Soporte para pantallas de alta densidad  
    autoDensity: true  
});

async function setTiledBackground(src: string) {
    if (!canvas) return;
    canvas.style.backgroundImage = `url(${src})`;
    canvas.style.backgroundSize = 'cover';
}
// --- Funciones (sin cambios) ---

async function loadModel(url: string) {  
    toggleControls(false);  
    loadingText.classList.remove('hidden');  
  
    if (currentModel) {  
        app.stage.removeChild(currentModel);  
        currentModel.destroy({ children: true, texture: true, baseTexture: true });  
    }  
  
    try {  
        // Usar opciones avanzadas del módulo lipsync  
        currentModel = await Live2DModel.from(url, {  
            autoHitTest: true,  
            autoFocus: false,  
            autoUpdate: true,  
            ticker: app.ticker,  
            motionPreload: MotionPreloadStrategy.IDLE,  
            // idleMotionGroupName: 'idle' // opcional, si tu modelo lo soporta  
        });  
          
        app.stage.addChild(currentModel);  
  
        const scale = Math.min(  
            (app.view.width * 0.8) / currentModel.width,  
            (app.view.height * 0.8) / currentModel.height  
        );  
        currentModel.scale.set(scale);  
        currentModel.x = (app.view.width - currentModel.width) / 2;  
        currentModel.y = (app.view.height - currentModel.height) / 2;  
          
        currentModel.interactive = true;  
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
function triggerRandomExpression() {  
    if (!currentModel) return;  
      
    // Usar el expressionManager del módulo lipsync  
    const expressionManager = currentModel.internalModel.motionManager.expressionManager;  
    if (!expressionManager) return;  
      
    const expressions = expressionManager.definitions;  
    if (!expressions || expressions.length === 0) return;  
      
    const randomIndex = Math.floor(Math.random() * expressions.length);  
    const randomExpression = expressions[randomIndex].name;  
      
    expressionManager.setExpression(randomExpression);  
}  

function triggerRandomMotion() {  
    if (!currentModel) return;  
      
    // Usar prioridades para mejor control de animaciones  
    const priority = MotionPriority.NORMAL;  
    currentModel.motion('tap_body', undefined, priority);  
}
async function speakWithLipSync(audioUrl: string, text?: string) {  
    if (!currentModel) return;  
      
    try {  
        // El módulo lipsync permite usar la función speak  
        await currentModel.speak(audioUrl, {  
            onFinish: () => {  
                console.log("Audio terminado");  
            },  
            onError: (error) => {  
                console.error("Error en audio:", error);  
            }  
        });  
    } catch (error) {  
        console.error("Error en lip sync:", error);  
    }  
}  
// --- Asignar eventos y carga inicial ---
btnShizuku.onclick = () => loadModel(shizuku_JSON);
btnHaru.onclick = () => loadModel(cubism4Model);
btnExpression.onclick = triggerRandomExpression;
btnMotion.onclick = triggerRandomMotion;

loadModel(cubism2Model); // Cargar el modelo inicial
setTiledBackground('/bg/ceiling-window-room-night.jpeg');
