import { PEvent, Action } from "./action";
import { logger } from "../../utilities/logger";
import { Validate } from "../validate";
import { Controller } from "../../controllers/controller";
import { Conversation } from "../conversation";
import { Agent } from "../agent";

export const ActionJoinConversation: Action = {
  name: "join-conversation",
  formats: [
    {
      conversationID: "number"
    }
  ],
  enact: (agent: Agent, inputData: any) => {
    const controller = new Controller();
    const conversation: Conversation = Conversation.getByID(inputData.conversationID);

    controller.addAgentToConversation(conversation, agent);

    logger.log("Event join-conversation (" + conversation.id + ") for agent " + agent.agentName + " registered.", 2);

    controller.sendUpdates();
  },
  validate: (agent: Agent, socket: any, inputData: any) => {
    let res;
    if (!(res = Validate.validate_conversation_exists(agent.room, Conversation.getByID(inputData.conversationID))).status) {
      return res;
    }
    const conversation: Conversation = Conversation.getByID(inputData.conversationID);
    if (!(res = Validate.validate_conversation_has_space(conversation)).status) {
      return res;
    }
    return Validate.successMsg;
  }
};
