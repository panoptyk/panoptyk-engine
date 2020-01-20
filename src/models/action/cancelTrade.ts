import { Action } from "./action";
import { logger } from "../../utilities/logger";
import { Validate } from "../validate";
import { Controller } from "../../controllers/controller";
import { Agent, Trade } from "../index";

export const ActionCancelTrade: Action = {
  name: "cancel-trade",
  formats: [
    {
    }
  ],
  enact: (agent: Agent, inputData: any) => {
    const controller = new Controller();
    const trade: Trade = agent.trade;

    controller.cancelTrade(trade);

    logger.log("Event cancel-trade (" + trade + ") for agent " + trade.agentIni.agentName + "/" + trade.agentRec.agentName + " registered.", 2);
    controller.sendUpdates();
  },
  validate: (agent: Agent, socket: any, inputData: any) => {
    let res;
    if (!(res = Validate.validate_agent_logged_in(agent)).status) {
      return res;
    }
    const trade: Trade = agent.trade;
    if (!(res = Validate.validate_trade_status(trade, [2, 3])).status) {
      return res;
    }

    return Validate.successMsg;
  }
};
