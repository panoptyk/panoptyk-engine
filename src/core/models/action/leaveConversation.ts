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
    // TODO: fix event functionality
    // this.conversation = res.conversation;

    // Controller.removeAgentFromConversation(this.conversation, this.fromAgent);

    // logger.log("Event leave-conversation (" + this.conversation.conversation_id + ") for agent " + this.fromAgent.agentName + " registered.", 2);
  },
  validate: (agent: Agent, socket: any, inputData: any) => {
    let res;
    if (!(res = Validate.validate_conversation_exists(agent.room, Conversation.getByID(inputData.conversation_id))).status) {
      return res;
    }
    if (!(res = Validate.validate_conversation_has_agent(res.conversation, agent)).status) {
      return res;
    }
    return res;
    return Validate.successMsg;
  }
};
