import styleRules from './scheme/styleRules.json';
import exactConfig from './characters/exact.json';
import basePrompt from './scheme/basePrompt.json';
// Tipos para autocompletado
export type Provider = 'openai' | 'anthropic' | 'google' | 'deepseek' | 'mistral';
export type ProviderText = Exclude<Provider, 'mistral'>;
export type ApiKey = 'OPENAI_API_KEY' | 'ANTHROPIC_API_KEY' | 'GEMINI_API_KEY' | 'DEEPSEEK_API_KEY' | 'MISTRAL_API_KEY';

// Mapeo simple clave-valor
export const providerKeys: Record<Provider, ApiKey> = {
  openai: 'OPENAI_API_KEY',
  anthropic: 'ANTHROPIC_API_KEY',
  google: 'GEMINI_API_KEY',
  deepseek: 'DEEPSEEK_API_KEY',
  mistral: 'MISTRAL_API_KEY',
} as const;
export const ConfigID = {
  AI_PROVIDER: 'AI_provider',
  AI_MODEL: 'AI_model',
  LANG: 'lang',
  WS_URL: 'ws_url',
  BASE_URL: 'base_url',
  MODEL2D: 'model2d',
  BACKGROUND_IMG: 'Background_img',
} as const;
// Arrays derivados automáticamente
export const allProviders = Object.keys(providerKeys) as Provider[];
export const allApiKeys = Object.values(providerKeys);

// Solo proveedores con text keys (excluye mistral)
export const providersWithTextKeys = allProviders.filter(p => p !== 'mistral') as ProviderText[];

// MISTRAL_API_KEY is used for asr(speech recognition)
const Providers = {
    "asr": [],// api Required
    "tts": ['edge-tts'],
    "llm": allProviders// api Required
}
const stringOptions= (arrayString:string[])=>{
    return arrayString.map((item)=>{
        return {
            value: item,
            label: item,
        }
    })
}
const langsOptions = [
            { value: 'es-ES', label: 'Español' },
            { value: 'en-US', label: 'English' },
            { value: 'fr-FR', label: 'Français' },
            { value: 'de-DE', label: 'Deutsch' },
            { value: 'it-IT', label: 'Italiano' },
            { value: 'pt-BR', label: 'Português' },
            { value: 'zh-CN', label: '简体中文' },
            { value: 'zh-TW', label: '繁體中文' },
            { value: 'ja-JP', label: '日本語' },
          ]
const defaulConfig = {
    port: 12393,
    ws_url: "ws://127.0.0.1:12393/client-ws",
    base_url: "http://127.0.0.1:12393",
    lang: "es-ES",
    background: "/bg/ceiling-window-room-night.jpeg"
}
export const cdnModels = {
   cubism2Model: "https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/assets/shizuku/shizuku.model.json",
   cubism4Model: "https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/assets/haru/haru_greeter_t03.model3.json"
}
const Modelconfig = {
    avaible: [{
      label:'shizuku',
      value:cdnModels.cubism2Model,
    }],
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
const defaultPrompt = {
  conf_name: "",
  conf_uid: "",
  persona_prompt: "",
  style_rules: "",
  think_tag: "",
  expression: ""
};
defaultPrompt["conf_name"]
export type DefaultPrompt = typeof defaultPrompt;
export const exactConfigdts = exactConfig as DefaultPrompt
export {defaulConfig,Providers,exacPrompt,langsOptions,stringOptions,Modelconfig, defaultPrompt }