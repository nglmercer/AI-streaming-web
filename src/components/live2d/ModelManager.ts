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
async function setTiledBackground(src: string) {
    if (!canvas) return;
    canvas.style.backgroundImage = `url(${src})`;
    canvas.style.backgroundSize = 'cover';
    
    console.log("setTiledBackground",src,canvas);
}
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