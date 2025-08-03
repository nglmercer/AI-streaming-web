import { modelsApi } from "@utils/fetch/modelfetch";
import { stringOptions,Modelconfig } from "@assets/defaultConfig";
import { configStorage } from "./listeners/formPersistence";
import { ws_api } from "@components/live2d/wsInstance";
import apiConfig from "@utils/fetch/config/apiConfig";
const modelSelect = document.getElementById('model2d') as HTMLSelectElement;
const BGimgSelect = document.getElementById('Background_img') as HTMLSelectElement;
async function initSelects() {
        const allData = await configStorage.getAll()
        initmodelSelect(allData)
        initBackgroundSelect(allData)
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
async function initBackgroundSelect(allData:Record<string,string>){
    if (!BGimgSelect)return;
    ws_api?.on('background-files',(data)=>{
        console.log('background-files',data)
    })
}
initSelects()