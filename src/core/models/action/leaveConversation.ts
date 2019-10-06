import { Action } from "./action";
import { logger } from "../../utilities/logger";
import { Validate } from "../validate";
import { Controller } from "../../controllers/controller";
import { Conversation } from "../conversation";
import { Agent } from "../agent";

export const ActionLeaveConversation: Action = {
  name: "leave-conversation",
  formats: [
    {
      conversationID: "number"
    }
  ],
  enact: (agent: Agent, inputData: any) => {
    const controller = new Controller();
    const conversation: Conversation = Conversation.getByID(inputData.conversationID);

    controller.removeAgentFromConversation(conversation, agent);

    logger.log("Event leave-conversation (" + conversation.id + ") for agent " + agent.agentName + " registered.", 2);
    controller.sendUpdates();
  },
  validate: (agent: Agent, socket: any, inputData: any) => {
    const conversation =  Conversation.getByID(inputData.conversationID);
    let res;
    if (!(res = Validate.validate_conversation_exists(agent.room, conversation)).status) {
      return res;
    }
    if (!(res = Validate.validate_conversation_has_agent(conversation, agent)).status) {
      return res;
    }
    return Validate.successMsg;
  }
};
