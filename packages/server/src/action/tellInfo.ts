import { Agent, Util, Conversation } from "@panoptyk/core/lib";
import { Action } from "./action";
import * as Validate from "../validate";
import { ConversationController } from "../controllers";

export const ActionTellInfo: Action = {
    name: "tell-info",
    formats: [
        {
            conversationId: "number",
        },
    ],
    enact: (agent: Agent, inputData: any) => {
        const cc: ConversationController = new ConversationController();
        const conversation: Conversation = Util.AppContext.db.retrieveModel(
            inputData.conversationID,
            Conversation
        ) as Conversation;

        cc.addAgentToConversation(conversation, agent);
        const info = cc.tellInfoInConversation(conversation, agent);

        Util.logger.log(
            "Event tell-info (" +
                info + 
                ") in conversation (" + 
                conversation +
                ")",
            "ACTION"
        );
        
        cc.sendUpdates();
    },
    validate: (agent: Agent, socket: any, inputData: any) => {
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