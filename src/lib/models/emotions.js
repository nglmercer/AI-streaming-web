function createLive2DModelConfig(options) {  
  // Validación básica  
  if (!options.name || !options.modelFile) {  
    throw new Error('Name and modelFile are required');  
  }  
  
  const config = {  
    type: "Live2D Model Setting",  
    name: options.name,  
    model: options.modelFile,  
    textures: options.textureFiles || [],  
    physics: options.physicsFile || null,  
    pose: options.poseFile || null,  
    expressions: [],  
    hit_areas: [],  
    motions: {}  
  };  
  
  // Procesar expresiones  
  if (options.expressions && Array.isArray(options.expressions)) {  
    config.expressions = options.expressions.map(exp => {  
      if (!exp.name || !exp.file) {  
        throw new Error('Expression must have name and file properties');  
      }  
      return { name: exp.name, file: exp.file };  
    });  
  }  
  
  // Procesar áreas de hit  
  if (options.hitAreas && Array.isArray(options.hitAreas)) {  
    config.hit_areas = options.hitAreas.map(area => {  
      if (!area.name || !area.id) {  
        throw new Error('Hit area must have name and id properties');  
      }  
      return { name: area.name, id: area.id };  
    });  
  }  
  
  // Procesar motions  
  if (options.motions && typeof options.motions === 'object') {  
    config.motions = options.motions;  
  }  
  
  return config;  
}  
  
// Función helper para crear motions fácilmente  
function createMotionGroup(basePath, motionNames, options = {}) {  
  return motionNames.map(name => {  
    const motion = { file: `${basePath}/${name}.mtn` };  
    if (options.fade_in) motion.fade_in = options.fade_in;  
    if (options.fade_out) motion.fade_out = options.fade_out;  
    return motion;  
  });  
}  
  
// Ejemplo usando la función helper  
const motions = {  
  idle: createMotionGroup('motions', ['idle_00', 'idle_01', 'idle_02'],   
    { fade_in: 2000, fade_out: 2000 }),  
  tap_body: createMotionGroup('motions', ['tapBody_00', 'tapBody_01', 'tapBody_02']),  
  shake: createMotionGroup('motions', ['shake_00', 'shake_01', 'shake_02'])  
};