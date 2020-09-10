import { Action } from "./action";
import { logger } from "../utilities/logger";
import { Validate } from "./validate";
import { Controller } from "../../controllers/controller";
import { Agent, Trade } from "../models/index";

export const ActionModifyGoldTrade: Action = {
  name: "modify-gold-trade",
  formats: [
    {
      "amount": "number"
    }
  ],
  enact: (agent: Agent, inputData: any) => {
    const controller = new Controller();
    const trade: Trade = agent.trade;

    controller.modifyGoldTrade(agent, trade, inputData.amount);

    logger.log("Event modify-gold-trade from " + agent + " on " + trade + " registered.", 2);
    controller.sendUpdates();
  },
  validate: (agent: Agent, socket: any, inputData: any) => {
    let res;
    if (!(res = Validate.validate_agent_logged_in(agent)).status) {
      return res;
    }
    if (!(res = Validate.validate_agent_has_enough_gold(agent, inputData.amount)).status) {
        return res;
    }
    const trade: Trade = agent.trade;
    if (!(res = Validate.validate_trade_status(trade, [2])).status) {
      return res;
    }
    if (!(res = Validate.validate_trade_gold_change(agent, trade, inputData.amount)).status) {
        return res;
    }
    return Validate.successMsg;
  }
};
