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
    const conversation: Conversation = agent.conversation;
    const toAgent: Agent = Agent.getByID(inputData.agentID);

    if (!toAgent.activeTradeRequestTo(agent)) {
      controller.requestTrade(agent, toAgent);
      logger.log("Event request-trade from (" + agent + ") to agent " + toAgent + " registered.", 2);
    }
    else {  // accept trade if receiving agent sent this
      const trade: Trade = controller.createTrade(conversation, agent, toAgent);
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
    if (!(res = Validate.validate_not_same_agent(agent, toAgent)).status) {
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
