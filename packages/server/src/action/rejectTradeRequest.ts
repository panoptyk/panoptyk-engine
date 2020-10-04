import { Action } from "./action";
import { logger } from "../utilities/logger";
import { Validate } from "./validate";
import { Controller } from "../../controllers/controller";
import { Models.Agent, Trade, Conversation } from "../models/index";

export const ActionRejectTradeRequest: Action = {
  name: "reject-trade-request",
  formats: [
    {
      agentID: "number"
    }
  ],
  enact: (agent: Models.Agent, inputData: any) => {
    const controller = new Controller();
    const toModels.Agent: Models.Agent = Models.Agent.getByID(inputData.agentID);
    controller.removeTradeRequest(agent, toModels.Agent);
    logger.log("Event reject-trade-request from (" + agent + ") to agent " + toModels.Agent + " registered.", 2);

    controller.sendUpdates();
  },
  validate: (agent: Models.Agent, socket: any, inputData: any) => {
    let res;
    if (!(res = Validate.validate_agent_logged_in(agent)).status) {
      return res;
    }
    const toModels.Agent = Models.Agent.getByID(inputData.agentID);
    if (!(res = Validate.validate_agent_logged_in(toModels.Agent)).status) {
      return res;
    }
    if (!(res = Validate.validate_agents_share_conversation(agent, toModels.Agent)).status) {
      return res;
    }
    if (!(res = Validate.validate_agents_not_already_trading(agent, toModels.Agent)).status) {
      return res;
    }
    return Validate.successMsg;
  }
};
