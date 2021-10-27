import { Util, Agent } from "@panoptyk/core";
import { Action } from "./action";
import * as Validate from "../validate";
import { ConversationController } from "../controllers";

export const ActionRequestConversation: Action = {
  name: "request-conversation",
  formats: [
    {
      agentID: "number"
    }
  ],
  enact: (requester: Agent, inputData: any) => {
    const cc: ConversationController = new ConversationController();
    const requestee: Agent = Util.AppContext.db.retrieveModel(inputData.agentID, Agent) as Agent;

    // if other agent has not requested a conversation
    if (requester.conversationRequesters.indexOf(requestee) === -1) {
      cc.requestConversation(requester, requestee);
      Util.logger.log(
        "Event request-conversation from (" +
          requester +
          ") to agent " +
          requestee +
          " registered.",
        "ACTION"
      );
    }
    // accept conversation request from other agent
    else {
      const conversation = cc.createConversation(
        requester.room,
        requester,
        requestee
      );
      Util.logger.log(
        "Event accept-conversation (" +
          conversation +
          ") for agent " +
          requester +
          "/" +
          requestee +
          " registered.",
        "ACTION"
      );
    }

    cc.sendUpdates();
  },
  validate: (agent: Agent, socket: any, inputData: any) => {
    let res;
    if (!(res = Validate.loggedIn(agent)).success) {
      return res;
    }
    const requestee: Agent = Util.AppContext.db.retrieveModel(inputData.agentID, Agent) as Agent;
    if (!(res = Validate.differentAgents(agent, requestee)).success) {
      return res;
    }
    if (!(res = Validate.loggedIn(requestee)).success) {
      return res;
    }
    if (!(res = Validate.sameRoom([ agent, requestee ])).success) {
      return res;
    }
    if (!(res = Validate.notInConversation([ agent, requestee ])).success) {
      return res;
    }
    return Validate.ValidationSuccess;
  }
};
