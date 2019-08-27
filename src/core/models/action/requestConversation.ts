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
    const toAgent = Agent.getByID(inputData.agent_id);

    controller.requestConversation(agent, toAgent);

    logger.log("Event request-conversation from (" + agent.agentName + ") to agent " + toAgent.agentName + " registered.", 2);
    controller.sendUpdates();
  },
  validate: (agent: Agent, socket: any, inputData: any) => {
    let res;
    const toAgent = Agent.getByID(inputData.agent_id);
    if (!(res = Validate.validate_agent_logged_in(toAgent)).status) {
      return res;
    }
    // TODO: validate agents are not already in a conversation
    // TODO: validate agents are in same room
    return Validate.successMsg;
  }
};
