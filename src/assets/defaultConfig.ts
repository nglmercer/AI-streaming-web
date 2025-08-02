import styleRules from './scheme/styleRules.json';
import exactConfig from './characters/exact.json';
import basePrompt from './scheme/basePrompt.json'
const Providers = {
    "asr": [],// api Required
    "tts": ['edget-tts'],
    "llm": ['google','openai','claude','deepseek']// api Required
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