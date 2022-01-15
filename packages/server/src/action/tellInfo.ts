import { Agent, Util, Information } from "@panoptyk/core/lib";
import { Action } from "./action";
import * as Validate from "../validate";
import { ConversationController } from "../controllers";

export const ActionTellInfo: Action = {
    name: "tell-info",
    formats: [
        {
            infoID: "number",
        },
    ],
    enact: (agent: Agent, inputData: any) => {
        const cc: ConversationController = new ConversationController();
        const info = Util.AppContext.db.retrieveModel(
            inputData.infoID, 
            Information
        );

        cc.tellInfoInConversation(
            agent.conversation,
            agent,
            info
        );

        Util.logger.log(
            `Event tell-info ${info} from teller ${agent} 
                on conversation ${agent.conversation}`,
            "ACTION"
        );

        cc.sendUpdates();
    },
    validate: (agent: Agent, socket: any, inputData: any) => {
        let res;

        if (!(res = Validate.loggedIn(agent)).success) {
            return res;
        }

        const conversation = agent.conversation;

        if (!(res = Validate.conversationInAgentsRoom(conversation, agent.room)).success) {
            return res;
        }

        if (!(res = Validate.conversationContainsAgent(conversation, agent)).success) {
            return res;
        }

        if (!(res = Validate.invalidConversation(conversation)).success) {
            return res;
        }

        const info = Util.AppContext.db.retrieveModel(
            inputData.infoID, 
            Information
        );

        if (!(res = Validate.ownsInfos(agent, [info])).success) {
            return res;
        }

        return Validate.ValidationSuccess;
    }
};
