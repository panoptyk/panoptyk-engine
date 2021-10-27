import { Util, Agent, Conversation } from "@panoptyk/core";
import { Action } from "./action";
import * as Validate from "../validate";
import { ConversationController } from "../controllers";

export const ActionLeaveConversation: Action = {
  name: "leave-conversation",
  formats: [
    {
      conversationID: "number"
    }
  ],
  enact: (agent: Agent, inputData: any) => {
    const cc: ConversationController = new ConversationController();
    const conversation: Conversation = Util.AppContext.db.retrieveModel(inputData.conversationID, Conversation) as Conversation;

    cc.removeAgentFromConversation(conversation, agent);

    Util.logger.log("Event leave-conversation (" + conversation + ") for agent " + agent.agentName + " registered.", "ACTION");
    cc.sendUpdates();
  },
  validate: (agent: Agent, socket: any, inputData: any) => {
    let res;
    if (!(res = Validate.loggedIn(agent)).success) {
      return res;
    }
    const conversation: Conversation = Util.AppContext.db.retrieveModel(inputData.conversationID, Conversation) as Conversation;
    if (!(res = Validate.conversationInAgentsRoom(conversation, agent.room).success)) {
      return res;
    }
    if (!(res = Validate.hasAgent(conversation, agent)).success) {
      return res;
    }
    return Validate.ValidationSuccess;
  }
};
