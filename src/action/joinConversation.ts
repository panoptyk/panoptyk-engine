import { Action } from "./action";
import { logger } from "../utilities/logger";
import { Validate } from "./validate";
import { ConversationController } from "../controllers";
import { Conversation } from "../models/conversation";
import { Agent } from "../models/agent";
import { inject } from "../utilities";

export const ActionJoinConversation: Action = {
  name: "join-conversation",
  formats: [
    {
      conversationID: "number"
    }
  ],
  enact: (agent: Agent, inputData: any) => {
    const cc: ConversationController = new ConversationController();
    const conversation: Conversation = inject.db.retrieveModel(inputData.conversationID, Conversation) as Conversation;

    cc.addAgentToConversation(conversation, agent);

    logger.log("Event join-conversation (" + conversation + ") for agent " + agent.agentName + " registered.", 2);

    cc.sendUpdates();
  },
  validate: (agent: Agent, socket: any, inputData: any) => {
    let res;
    if (!(res = Validate.validate_agent_logged_in(agent)).status) {
      return res;
    }
    const conversation: Conversation = inject.db.retrieveModel(inputData.conversationID, Conversation) as Conversation;
    if (!(res = Validate.validate_conversation_exists(agent.room, conversation)).status) {
      return res;
    }
    if (!(res = Validate.validate_conversation_has_space(conversation)).status) {
      return res;
    }
    return Validate.successMsg;
  }
};
