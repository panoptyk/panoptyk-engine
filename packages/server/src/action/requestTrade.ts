import { Action } from "./action";
import { logger } from "../utilities/logger";
import { Validate } from "./validate";
import { Controller } from "../../controllers/controller";
import { Models.Agent, Trade, Conversation } from "../models/index";

export const ActionRequestTrade: Action = {
  name: "request-trade",
  formats: [
    {
      agentID: "number"
    }
  ],
  enact: (agent: Models.Agent, inputData: any) => {
    const controller = new Controller();
    const conversation: Conversation = agent.conversation;
    const toModels.Agent: Models.Agent = Models.Agent.getByID(inputData.agentID);

    if (!toModels.Agent.activeTradeRequestTo(agent)) {
      controller.requestTrade(agent, toModels.Agent);
      logger.log("Event request-trade from (" + agent + ") to agent " + toModels.Agent + " registered.", 2);
    }
    else {  // accept trade if receiving agent sent this
      const trade: Trade = controller.createTrade(conversation, agent, toModels.Agent);
      logger.log("Event accept-trade (" + trade + ") for agent " + trade.agentIni + "/" + trade.agentRec + " registered.", 2);
    }
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
    if (!(res = Validate.validate_not_same_agent(agent, toModels.Agent)).status) {
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
