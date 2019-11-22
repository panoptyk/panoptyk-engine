import { Action } from "./action";
import { logger } from "../../utilities/logger";
import { Validate } from "../validate";
import { Controller } from "../../controllers/controller";
import { Agent } from "../agent";

export const ActionRejectConversationRequest: Action = {
  name: "reject-conversation-request",
  formats: [
    {
      agentID: "number"
    }
  ],
  enact: (agent: Agent, inputData: any) => {
    const controller = new Controller();
    const toAgent: Agent = Agent.getByID(inputData.agentID);
    controller.removeConversationRequest(agent, toAgent);
    logger.log(
    "Event reject-conversation-request from (" +
        agent +
        ") to agent " +
        toAgent +
        " registered.",
    2
    );
    controller.sendUpdates();
  },
  validate: (agent: Agent, socket: any, inputData: any) => {
    let res;
    const toAgent = Agent.getByID(inputData.agentID);
    if (!(res = Validate.validate_agent_logged_in(agent)).status) {
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
