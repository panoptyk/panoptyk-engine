import { Action } from "./action";
import { logger } from "../utilities/logger";
import { Validate } from "./validate";
import { ConversationController } from "../controllers";
import { Agent } from "../models/agent";
import { inject } from "../utilities";

export const ActionRequestConversation: Action = {
  name: "request-conversation",
  formats: [
    {
      agentID: "number"
    }
  ],
  enact: (requester: Agent, inputData: any) => {
    const cc: ConversationController = new ConversationController();
    const requestee: Agent = inject.db.retrieveModel(inputData.agentID, Agent) as Agent;

    // if other agent has not requested a conversation
    if (requester.conversationRequesters.indexOf(requestee) === -1) {
      cc.requestConversation(requester, requestee);
      logger.log(
        "Event request-conversation from (" +
          requester +
          ") to agent " +
          requestee +
          " registered.",
        2
      );
    }
    // accept conversation request from other agent
    else {
      const conversation = cc.createConversation(
        requester.room,
        requester,
        requestee
      );
      logger.log(
        "Event accept-conversation (" +
          conversation +
          ") for agent " +
          requester +
          "/" +
          requestee +
          " registered.",
        2
      );
    }

    cc.sendUpdates();
  },
  validate: (agent: Agent, socket: any, inputData: any) => {
    let res;
    if (!(res = Validate.validate_agent_logged_in(agent)).status) {
      return res;
    }
    const requestee: Agent = inject.db.retrieveModel(inputData.agentID, Agent) as Agent;
    if (!(res = Validate.validate_not_same_agent(agent, requestee)).status) {
      return res;
    }
    if (!(res = Validate.validate_agent_logged_in(requestee)).status) {
      return res;
    }
    if (!(res = Validate.validate_agents_in_same_room(agent, requestee)).status) {
      return res;
    }
    if (!(res = Validate.validate_agents_not_conversing([agent, requestee])).status) {
      return res;
    }
    return Validate.successMsg;
  }
};
