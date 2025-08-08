import { modelsApi } from "@utils/fetch/modelfetch";
import { type ModelList,aiModel } from "@utils/fetch/configapi";
import { stringOptions,Modelconfig,ConfigID } from "@assets/defaultConfig";
import { allApiKeys,type ApiKey,type ProviderText,providersWithTextKeys } from '@assets/defaultConfig';

import { configStorage,emitterData } from "./listeners/formPersistence";
import { ws_api } from "@components/live2d/wsInstance";
import type { BackgroundFile } from "@components/types/ws_model";
const modelSelect = document.getElementById(ConfigID.MODEL2D) as HTMLSelectElement;
const BGimgSelect = document.getElementById(ConfigID.BACKGROUND_IMG) as HTMLSelectElement;
const AImodelSelect = document.getElementById(ConfigID.AI_MODEL) as HTMLSelectElement;

emitterData.on(`update:${ConfigID.AI_MODEL}`,async (data)=>{
    const allData = await configStorage.getAll()
    initAImodelSelect(allData);
    console.log("AI_MODEL",data)
})
async function initAImodelSelect(allData:Record<string,string>) {
        if (!AImodelSelect)return;
        const models = await aiModel.getModels();
        if (!models)return;
        if (!providersWithTextKeys.find((p)=>p === allData[ConfigID.AI_PROVIDER]))return;
        const modelsOptions = models.data[allData[ConfigID.AI_PROVIDER] as ProviderText]
        if (!modelsOptions)return;
        AImodelSelect.innerHTML = '';
        console.log("models modelsOptions",models,modelsOptions);
        modelsOptions.models.map((item)=>{
            const newOp = new Option(item, item);
            AImodelSelect.add(newOp);
        })
        if (allData[ConfigID.AI_MODEL]){
            AImodelSelect.value = allData[ConfigID.AI_MODEL];
        }

}
async function initSelects() {
        const allData = await configStorage.getAll()
        initmodelSelect(allData)
        initBackgroundSelect([],allData)
        initAImodelSelect(allData);

}
async function initmodelSelect(allData:Record<string,string>) {
    if (!modelSelect)return;
    modelSelect.innerHTML = '';
    const fetchListModels = await modelsApi.getModelList();
    const modelsOptions = [
        ... fetchListModels.map((item) => {
            return {
                label: item+'🟢',
                value: item,
            }
        }),
        ...Modelconfig.avaible
    ]
    modelsOptions.forEach(op => {          
            const newOp = new Option(op.label, op.value, (allData.model2d === op.value));
            modelSelect.add(newOp);
    });
    if (allData.model2d){
        Object.entries(modelSelect.options).forEach(([key, value]) => {
            if (value.value === allData.model2d) modelSelect.selectedIndex = Number(key);
        });        
       modelSelect.value = allData.model2d;
    }   
}
const transparent = new Option('transparent','');
BGimgSelect?.add(transparent);
export async function initBackgroundSelect(files?:BackgroundFile[],allData?:Record<string,string>){
    console.log("BGimgSelect",BGimgSelect)
    if (!BGimgSelect)return;
    if (!files || !Array.isArray(files))return;
    files.map((item)=>{
        const newOp = new Option(item.name, item.url);
        BGimgSelect.add(newOp);
    })
    if (!allData?.Background_img)return;
    BGimgSelect.value = allData?.Background_img;
}
initSelects()