// src/lib/formPersistence.ts

/* import { DataStorage } from '@lib/core/storage';
import { LocalStorageAdapter } from '@lib/core/local-storage-adapter'; */
import { DataStorage } from 'json-obj-manager';
import { LocalStorageAdapter } from 'json-obj-manager/browser';
import { Emitter } from '@utils/Emitter';
import { allApiKeys,type ApiKey,ConfigID,type ProviderText,providersWithTextKeys } from '@assets/defaultConfig';
import { configApi, aiModel } from '@utils/fetch/configapi';
const emitterData = new Emitter();
// 1. Instancia única del almacenamiento.
const configStorage = new DataStorage<string>(new LocalStorageAdapter('config'));
configStorage.setEmitMode('info');
interface DataEvent {
  key: string;
  data: any;
}
configStorage.on('save', async ({key,data}:DataEvent) => {
  if (!data)return;
  if (allApiKeys.includes(key as ApiKey)){    
    const savedata = await configStorage.getAll()
    const SaveDataKeys = Object.fromEntries(
      allApiKeys
        .filter(key => savedata[key] !== undefined)
        .map(key => [key, savedata[key]])
    );
    configApi.setConfig(SaveDataKeys);
    console.log("configStorage change",key, data, SaveDataKeys);
  }
  if (key === ConfigID.AI_PROVIDER){
    if (!providersWithTextKeys.find((p)=>p === data))return;
    emitterData.emit(`update:${ConfigID.AI_MODEL}`,data);
  }
  if (key === ConfigID.MODEL2D){
    configApi.setConfig({[ConfigID.MODEL2D]:data});
  }
  if (key === ConfigID.BACKGROUND_IMG){
    emitterData.emit(`update:${ConfigID.BACKGROUND_IMG}`,data);
  }
  if (key.startsWith('AI_')){
    configApi.setConfig({[key.replace('AI_','')]:data});
  }
})

// 2. Lógica para actualizar el display del select (la única lógica extra)
function updateSelectDisplay(selectElement: HTMLSelectElement) {
  const displayElement = selectElement.parentElement?.querySelector('.select-display');
  const selectedOption = selectElement.options[selectElement.selectedIndex];
  if (displayElement && selectedOption) {
    displayElement.textContent = selectedOption.textContent;
  }
}

// 3. Definimos la configuración para cada tipo de control de formulario.
const controlConfigs = [
  {
    selector: 'input[type="number"][id]',
    event: 'input',
    // Cómo obtener el valor del elemento
    getValue: (el: HTMLInputElement) => el.value,
    // Cómo establecer el valor en el elemento
    setValue: (el: HTMLInputElement, value: string) => {
      el.value = value;
    },
  },
  {
    selector: 'input[type="text"][id], input[type="email"][id], input[type="password"][id], input[type="url"][id]',
    event: 'input',
    getValue: (el: HTMLInputElement) => el.value,
    setValue: (el: HTMLInputElement, value: string) => {
      el.value = value;
    },
  },
  {
    selector: 'input[type="checkbox"][id].peer', // Usamos .peer para ser más específicos al Switch
    event: 'change',
    getValue: (el: HTMLInputElement) => el.checked.toString(),
    setValue: (el: HTMLInputElement, value: string) => {
      el.checked = (value === 'true');
    },
  },
  {
    selector: 'select[id]',
    event: 'change',
    getValue: (el: HTMLSelectElement) => el.value,
    setValue: (el: HTMLSelectElement, value: string) => {
      el.value = value;
      // Actualizamos la UI al cargar la página
      updateSelectDisplay(el); 
    },
    // Callback opcional para ejecutar después de un cambio
    onUpdate: (el: HTMLSelectElement) => {
      updateSelectDisplay(el);
    }
  }
];

// 4. Función principal que se ejecutará una vez
async function initializePersistentFormControls() {
  console.log("Initializing persistent form controls...");
  const allData = await configStorage.getAll();
  console.log("ConfigData from Storage:", allData);

  controlConfigs.forEach(config => {
    const elements = document.querySelectorAll<HTMLElement>(config.selector);
    
    elements.forEach(element => {
      const el = element as (HTMLInputElement | HTMLSelectElement); // Type assertion
      const id = el.getAttribute('id');

      if (!id) return;

      // Inicializar el valor desde el storage
      const storedValue = allData[id];
      if (storedValue !== undefined && storedValue !== null) {
        config.setValue(el as any, storedValue);
      }

      // Añadir el listener para guardar los cambios
      el.addEventListener(config.event, (event) => {
        const target = event.target as (HTMLInputElement | HTMLSelectElement);
        const valueToSave = config.getValue(target as any);
        
        console.log(`Saving -> id: ${id}, value: ${valueToSave}`);
        configStorage.save(id, valueToSave);
        emitterData.emit(id,valueToSave);
        // Si hay una función de 'onUpdate', la ejecutamos
        if (config.onUpdate) {
          config.onUpdate(target as any);
        }
      });
    });
  });
}
export {
    initializePersistentFormControls,
    configStorage,
    emitterData
}