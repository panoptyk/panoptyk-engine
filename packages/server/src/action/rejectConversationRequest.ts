import { Action } from "./action";
import { logger } from "../utilities/logger";
import * as Validate from "../validate";
import { ConversationController } from "../controllers";
import { Models.Agent } from "../models/agent";
import { inject } from "../utilities";

export const ActionRejectConversationRequest: Action = {
  name: "reject-conversation-request",
  formats: [
    {
      agentID: "number"
    }
  ],
  enact: (requester: Models.Agent, inputData: any) => {
    const cc: ConversationController = new ConversationController();
    const requestee: Models.Agent = inject.db.retrieveModel(inputData.agentID, Models.Agent) as Models.Agent;
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
  validate: (agent: Models.Agent, socket: any, inputData: any) => {
    let res;
    if (!(res = Validate.loggedIn(agent)).success) {
      return res;
    }
    const requestee: Models.Agent = inject.db.retrieveModel(inputData.agentID, Models.Agent) as Models.Agent;
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
