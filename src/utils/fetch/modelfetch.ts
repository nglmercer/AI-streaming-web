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

  async getModelUrlIfExists(modelName: string): Promise<string | false> {
    const urlV2 = `${this.host}/models/${modelName}/${modelName}.model.json`;
    const urlV3 = `${this.host}/models/${modelName}/${modelName}.model3.json`;
    
      // allways response with object if not exist returl a string example: '404 not found'
      const result = await this.http.get(urlV2, this._requestOptions({}));
      await this.http.get(urlV3, this._requestOptions({}));
      return typeof result === 'object' ? urlV2 : urlV3;
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