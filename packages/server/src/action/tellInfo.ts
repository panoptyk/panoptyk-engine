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

        if (!(res = Validate.missingAgentInConversation(conversation)).success) {
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


/*
    const controller = new Controller();
    const info: Info = Info.getByID(inputData.infoID);
    const mask: string[] = inputData.mask;

    controller.tellInfoFreely(agent, info, mask);
    logger.log("Event tell-info " + info + " from agent " + agent
      + " on conversation " + agent.conversation, 2);
    controller.sendUpdates();
    },
  validate: (agent: Models.Agent, socket: any, inputData: any) => {
    let res;
    if (!(res = Validate.validate_agent_logged_in(agent)).status) {
      return res;
    }
    const conversation = agent.conversation;
    if (!(res = Validate.validate_conversation_exists(agent.room, conversation)).status) {
        return res;
    }
    if (!(res = Validate.validate_conversation_has_agent(conversation, agent)).status) {
        return res;
    }
    const info: Info = Info.getByID(inputData.infoID);
    if (!(res = Validate.validate_agent_owns_info(agent, info)).status) {
        return res;
    }
    const mask: string[] = inputData.mask;
    if (!(res = Validate.validate_info_mask(info, mask)).status) {
      return res;
    }
    return Validate.successMsg; */