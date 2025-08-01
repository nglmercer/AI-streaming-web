import { modelsApi } from "@utils/fetch/modelfetch";
import { stringOptions,Modelconfig } from "@assets/defaultConfig";
import { configStorage } from "./listeners/formPersistence";
import apiConfig from "@utils/fetch/config/apiConfig";
const modelSelect = document.getElementById('model2d') as HTMLSelectElement;

async function initSelect() {
    const options = modelSelect.options; // HTMLCollection de los <option>
    console.log("options", options)
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
    const allData = await configStorage.getAll()
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
//    console.log("modelSelect", modelSelect,allData,modelSelect.selectedIndex)
}
initSelect()