import styleRules from './scheme/styleRules.json';
import exactConfig from './characters/exact.json';
import basePrompt from './scheme/basePrompt.json'
const Providers = {
    "asr": ['mistral'],// api Required
    "tts": ['edget-tts'],
    "llm": ['google','openai','claude','deepseek']// api Required
}

const defaulConfig = {
    port: 12393,
    ws_url: "ws://127.0.0.1:12393/client-ws",
    base_url: "http://127.0.0.1:12393",
    lang: "es-ES",
    background: "/bg/ceiling-window-room-night.jpeg"
}
const Modelconfig = {
    avaible: ['shizuku','haru'],
    default: 'shizuku',
    upload: []
}
function generatePrompt(template:{template: string}, config:{[key: string]: string}, humanName = 'User') {
  let prompt = template.template;
  Object.keys(config).forEach( async key => {
    prompt = prompt.replace(`{${key}}`, config[key]);
  });
  prompt = prompt.replace('{human_name}', humanName);
  prompt = prompt.replace('{style_rules}', JSON.stringify(styleRules.dialogue_rules));
  return prompt;
}
const exacPrompt = generatePrompt(basePrompt, exactConfig);
export {defaulConfig,Providers,exacPrompt}