import { Util, Agent, Room, Item } from "@panoptyk/core";
import { Action } from "./action";
import * as Validate from "../validate";
import { ConversationController } from "../controllers";

export const ActionRejectConversationRequest: Action = {
  name: "reject-conversation-request",
  formats: [
    {
      agentID: "number"
    }
  ],
  enact: (requester: Agent, inputData: any) => {
    const cc: ConversationController = new ConversationController();
    const requestee: Agent = Util.AppContext.db.retrieveModel(inputData.agentID, Agent) as Agent;
    cc.rejectConversation(requester, requestee);
    Util.logger.log(
    "Event reject-conversation-request from (" +
        requester +
        ") to agent " +
        requestee +
        " registered.",
    "ACTION"
    );
    cc.sendUpdates();
  },
  validate: (agent: Agent, socket: any, inputData: any) => {
    let res;
    if (!(res = Validate.loggedIn(agent)).success) {
      return res;
    }
    const requestee: Agent = Util.AppContext.db.retrieveModel(inputData.agentID, Agent) as Agent;
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
