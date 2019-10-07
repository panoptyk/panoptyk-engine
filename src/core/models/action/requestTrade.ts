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

    const sharedRequests = Trade.getRequestedTradesBetweenAgents(agent, toAgent);
    if (sharedRequests.length === 0) {
      const trade = controller.createTrade(conversation, agent, toAgent);
      logger.log("Event request-trade (" + conversation.id + ") for agent " + agent.agentName + " registered.", 2);
    }
    else {
      const trade = sharedRequests[0];  // TODO: Shouldn't there only by one of these?
      controller.acceptTrade(trade);
      logger.log("Event accept-trade (" + trade.id + ") for agent " + trade.agentIni.agentName + "/" + trade.agentRec.agentName + " registered.", 2);
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
