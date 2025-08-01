import BaseApi from './commons/BaseApi';
import type { FetchOptions } from './commons/httpservice';
import type { Live2DModelSetting } from 'src/types/model.types';
import apiConfig from './config/apiConfig';


class ModelsApi extends BaseApi {
  constructor(config: any) {
    super(config);
  }
  async getModels(modelName:string){
    return this.get<Live2DModelSetting>(`/models/json/${modelName}`);
  }
}
const modelsApi = new ModelsApi(apiConfig);
/* async function test() {
        const result = await modelsApi.getModels('shizuku');
        console.log("result",result);
}
test(); */
export {
    modelsApi
}