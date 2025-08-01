import BaseApi from './commons/BaseApi';
import type { FetchOptions } from './commons/httpservice';
import type { Live2DModelSetting } from 'src/types/model.types';
import apiConfig from './config/apiConfig';


class ModelsApi extends BaseApi {
  constructor(config: any) {
    super(config);
  }
  async getModel(modelName:string){
    return this.get<Live2DModelSetting>(`/models/json/${modelName}`);
  }
  async getModelList(){
    return this.get<string[]>(`/models/list`);
  }
}
const modelsApi = new ModelsApi(apiConfig);
/* async function test() {
        const result = await modelsApi.getModelList();
        result.forEach(async (item) => {
            const model = await modelsApi.getModel(item);
            console.log("model",model);
        })
        console.log("result",result);
}
test(); */
export {
    modelsApi
}