import BaseApi from './commons/BaseApi';
import type { FetchOptions } from './commons/httpservice';
import apiConfig from './config/apiConfig';
export interface Message {
  id: string;               // UUID v4
  text: string;             // Contenido del mensaje
  isRead: boolean;          // Estado de lectura
  createdAt: Date;          // Momento de creación
  readAt?: Date;            // Momento en que se marcó como leído (opcional)
}
interface successMessage {
  success: boolean;
  messages?: Message[];
  message?: Message | boolean;
}
class TaskMessage extends BaseApi {
  constructor(config: any) {
    super(config);
  }

  async getAll(){
    return this.get<successMessage>(`/api/messages/all`);
  }

  async getAllBoolean(boolean?:boolean){
    return this.get<successMessage>(`/api/messages/all/${boolean}`);
  }
  async getNext(){
    return this.get<successMessage>(`/api/messages/next`);
  }
  async UnreadNext(){
    return this.get<successMessage>(`/api/messages/next/unread`);
  }
  async markAsRead(id: string){
    return this.post<successMessage>(`/api/messages/markAsRead/${id}`);
  }
  async addMessage(message: Message){
    return this.post<successMessage>(`/api/messages/add`, message);
  }
}
const messageApi = new TaskMessage(apiConfig);
export function ArrayMessagetotext(messages:Message[]):string {
  if (!messages || !Array.isArray(messages)) {
    return "";
  }
  let text = "";
  messages.forEach(message => {
    text += message.text + "\n";
  });
  return text;
}
async function test() {
        const newMessage: Message = {
            id: '123',
            text: 'hola como va',
            isRead: false,
            createdAt: new Date(),
        }
        //const addresult = await messageApi.addMessage(newMessage);
        const result = await messageApi.getAllBoolean(false);
        const allTostring = ArrayMessagetotext([...result.messages!])
        const getNext = await messageApi.getNext();
        console.log("result",{result,getNext,allTostring} );
}
test();
export {
    messageApi
}