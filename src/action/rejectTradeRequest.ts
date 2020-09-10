import { Action } from "./action";
import { logger } from "../utilities/logger";
import { Validate } from "./validate";
import { Controller } from "../../controllers/controller";
import { Agent, Trade, Conversation } from "../models/index";

export const ActionRejectTradeRequest: Action = {
  name: "reject-trade-request",
  formats: [
    {
      agentID: "number"
    }
  ],
  enact: (agent: Agent, inputData: any) => {
    const controller = new Controller();
    const toAgent: Agent = Agent.getByID(inputData.agentID);
    controller.removeTradeRequest(agent, toAgent);
    logger.log("Event reject-trade-request from (" + agent + ") to agent " + toAgent + " registered.", 2);

    controller.sendUpdates();
  },
  validate: (agent: Agent, socket: any, inputData: any) => {
    let res;
    if (!(res = Validate.validate_agent_logged_in(agent)).status) {
      return res;
    }
    const toAgent = Agent.getByID(inputData.agentID);
    if (!(res = Validate.validate_agent_logged_in(toAgent)).status) {
      return res;
    }
    if (!(res = Validate.validate_agents_share_conversation(agent, toAgent)).status) {
      return res;
    }
    if (!(res = Validate.validate_agents_not_already_trading(agent, toAgent)).status) {
      return res;
    }
    return Validate.successMsg;
  }
};
