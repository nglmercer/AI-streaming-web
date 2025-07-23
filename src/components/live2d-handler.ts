// src/scripts/live2d-handler.ts

import { Application } from '@pixi/app';
import { Ticker, TickerPlugin } from '@pixi/ticker';
import { InteractionManager } from '@pixi/interaction';
import { Renderer } from '@pixi/core';
import { Live2DModel } from 'pixi-live2d-display';
// --- REGISTRO DE PLUGINS ---
// Esto se hace aquí, al principio del script del cliente.
// Astro se asegurará de que este código solo se ejecute en el navegador.
Application.registerPlugin(TickerPlugin);
Live2DModel.registerTicker(Ticker);
Renderer.registerPlugin('interaction', InteractionManager);

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
const app = new Application({
    view: canvas,
    autoStart: true,
    resizeTo: canvas.parentElement!, // Usamos '!' para asegurar que no es nulo
    backgroundColor: 0x000000,
    backgroundAlpha: 0.5,
    antialias: true, // Habilitar antialiasing
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
        currentModel = await Live2DModel.from(url);
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

function triggerRandomExpression() {
    if (!currentModel) return;
    const expressions = (currentModel.internalModel.settings as any).expressions;
    if (!expressions || Object.keys(expressions).length === 0) return;
    const expressionNames = Object.keys(expressions);
    const randomExpressionName = expressionNames[Math.floor(Math.random() * expressionNames.length)];
    currentModel.expression(randomExpressionName);
}

function triggerRandomMotion() {
    if (!currentModel) return;
    //currentModel.motion('tap_body'); // Simplificado para el ejemplo, ajusta según el modelo
}

// --- Asignar eventos y carga inicial ---
btnShizuku.onclick = () => loadModel(shizuku_JSON);
btnHaru.onclick = () => loadModel(cubism4Model);
btnExpression.onclick = triggerRandomExpression;
btnMotion.onclick = triggerRandomMotion;

loadModel(cubism2Model); // Cargar el modelo inicial
setTiledBackground('/bg/ceiling-window-room-night.jpeg');
