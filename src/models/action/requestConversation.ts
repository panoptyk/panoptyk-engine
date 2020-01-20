import { Action } from "./action";
import { logger } from "../../utilities/logger";
import { Validate } from "../validate";
import { Controller } from "../../controllers/controller";
import { Agent } from "../agent";

export const ActionRequestConversation: Action = {
  name: "request-conversation",
  formats: [
    {
      agentID: "number"
    }
  ],
  enact: (agent: Agent, inputData: any) => {
    const controller = new Controller();
    const toAgent: Agent = Agent.getByID(inputData.agentID);

    // if other agent has not requested a conversation
    if (agent.conversationRequesters.indexOf(toAgent) === -1) {
      controller.requestConversation(agent, toAgent);
      logger.log(
        "Event request-conversation from (" +
          agent +
          ") to agent " +
          toAgent +
          " registered.",
        2
      );
    }
    // accept conversation request from other agent
    else {
      const conversation = controller.createConversation(
        agent.room,
        agent,
        toAgent
      );
      logger.log(
        "Event accept-conversation (" +
          conversation +
          ") for agent " +
          agent +
          "/" +
          toAgent +
          " registered.",
        2
      );
    }

    controller.sendUpdates();
  },
  validate: (agent: Agent, socket: any, inputData: any) => {
    let res;
    if (!(res = Validate.validate_agent_logged_in(agent)).status) {
      return res;
    }
    const toAgent = Agent.getByID(inputData.agentID);
    if (!(res = Validate.validate_not_same_agent(agent, toAgent)).status) {
      return res;
    }
    if (!(res = Validate.validate_agent_logged_in(toAgent)).status) {
      return res;
    }
    if (!(res = Validate.validate_agents_in_same_room(agent, toAgent)).status) {
      return res;
    }
    if (!(res = Validate.validate_agents_not_conversing([agent, toAgent])).status) {
      return res;
    }
    return Validate.successMsg;
  }
};
