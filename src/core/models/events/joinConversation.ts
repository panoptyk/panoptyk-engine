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
    // TODO: fix event functionality
    // this.conversation = res.conversation;

    // Controller.addAgentToConversation(this.conversation, this.fromAgent);

    // logger.log("Event join-conversation (" + this.conversation.conversation_id + ") for agent " + this.fromAgent.agentName + " registered.", 2);
  },
  validate: (agent: Agent, socket: any, inputData: any) => {
    let res;
    if (!(res = Validate.validate_conversation_exists(agent.room, Conversation.getByID(inputData.conversationID))).status) {
      return res;
    }
    if (!(res = Validate.validate_conversation_has_space(res.conversation)).status) {
      return res;
    }
    return Validate.successMsg;
  }
};
