import { Action } from "./action";
import { logger } from "../../utilities/logger";
import { Validate } from "../validate";
import { Controller } from "../../controllers/controller";
import { Agent, Item, Trade } from "../index";

export const ActionRequestGoldTrade: Action = {
  name: "request-gold-trade",
  formats: [
    {
        amount: "number"
    }
  ],
  enact: (agent: Agent, inputData: any) => {
    const controller = new Controller();
    const trade: Trade = agent.trade;
    controller.requestGoldTrade(agent, inputData.amount);

    logger.log("Event request-gold-trade from " + agent + " on " + trade + " registered.", 2);
    controller.sendUpdates();
  },
  validate: (agent: Agent, socket: any, inputData: any) => {
    let res;
    if (!(res = Validate.validate_agent_logged_in(agent)).status) {
      return res;
    }
    const trade: Trade = agent.trade;
    if (!(res = Validate.validate_trade_status(trade, [2])).status) {
      return res;
    }
    // TODO: validate amount not negative
    return Validate.successMsg;
  }
};