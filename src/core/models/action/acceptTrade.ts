import { Action } from "./action";
import { logger } from "../../utilities/logger";
import { Validate } from "../validate";
import { Controller } from "../../controllers/controller";
import { Agent } from "../agent";

export const ActionAcceptTrade: Action = {
  name: "accept-trade",
  formats: [
    {
      tradeID: "number"
    }
  ],
  enact: (agent: Agent, inputData: any) => {
    // TODO: fix event functionality
    // this.conversation = res.conversation;
    // this.toAgent = res.trade.agent_ini;
    // this.trade = res.trade;
    // Controller.acceptTrade(this.trade);
    // logger.log("Event accept-trade (" + trade + ") for agent " + this.fromAgent.agentName + "/" + this.toAgent.agentName + " registered.", 2);
  },
  validate: (agent: Agent, socket: any, inputData: any) => {
    let res;
    if (!(res = Validate.validate_agent_logged_in(agent)).status) {
      return res;
    }
    if (!(res = Validate.validate_trade_exists(inputData.trade_id)).status) {
      return res;
    }
    if (!(res = Validate.validate_trade_status(res.trade, [3])).status) {
      return res;
    }
    const res2 = res;
    if (
      !(res = Validate.validate_agent_logged_in(res.trade.agent_ini)).status
    ) {
      return res;
    }

    return Validate.successMsg;
  }
};
