import { Action } from "./action";
import { logger } from "../utilities/logger";
import * as Validate from "../validate";
import { ConversationController } from "../controllers";
import { Agent } from "../models/agent";
import { inject } from "../utilities";

export const ActionRejectConversationRequest: Action = {
  name: "reject-conversation-request",
  formats: [
    {
      agentID: "number"
    }
  ],
  enact: (requester: Agent, inputData: any) => {
    const cc: ConversationController = new ConversationController();
    const requestee: Agent = inject.db.retrieveModel(inputData.agentID, Agent) as Agent;
    cc.rejectConversation(requester, requestee);
    logger.log(
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
    const requestee: Agent = inject.db.retrieveModel(inputData.agentID, Agent) as Agent;
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
