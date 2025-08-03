import { configStorage } from "@components/sidebar/listeners/formPersistence";
import { messageApi, ArrayMessagetotext } from "@utils/fetch/commentapi";
import { SendQuestion } from "@components/chat/input";
async function TaskInterval() {
    const alldata = await configStorage.getAll()
    console.log("alldata",alldata)
    if (alldata){//alldata.comment_task
        const TimeTask = Number(alldata.comment_timeout) || 5000;
        const checkInterval = window.setTimeout(async () => {
            const ExistMessages = await messageApi.getAllBoolean(false);
            const text = ArrayMessagetotext([...ExistMessages.messages!]);
            console.log("text",text);
            await SendQuestion(text,ExistMessages.messages?.map((item) => item.id));
        }, TimeTask);
    }
}
TaskInterval()