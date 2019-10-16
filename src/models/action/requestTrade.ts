import { Action } from "./action";
import { logger } from "../../utilities/logger";
import { Validate } from "../validate";
import { Controller } from "../../controllers/controller";
import { Agent, Trade, Conversation } from "../index";

export const ActionRequestTrade: Action = {
  name: "request-trade",
  formats: [
    {
      agentID: "number"
    }
  ],
  enact: (agent: Agent, inputData: any) => {
    const controller = new Controller();
    const conversation = agent.conversation;
    const toAgent = Agent.getByID(inputData.agentID);

    let trade = Trade.getRequestedTradesBetweenAgents(agent, toAgent)[0];  // TODO: Why is this an array??
    if (trade === undefined) {
      trade = controller.createTrade(conversation, agent, toAgent);
      logger.log("Event request-trade (" + trade + ") for agent " + agent + " registered.", 2);
    }
    else if (trade.agentRec === agent) {  // accept trade if receiving agent sent this
      controller.acceptTrade(trade);
      logger.log("Event accept-trade (" + trade + ") for agent " + trade.agentIni + "/" + trade.agentRec + " registered.", 2);
    }
    controller.sendUpdates();
  },
  validate: (agent: Agent, socket: any, inputData: any) => {
    let res;
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
