import { Action } from "./action";
import { logger } from "../../utilities/logger";
import { Validate } from "../validate";
import { Controller } from "../../controllers/controller";
import { Agent, Trade } from "../index";

export const ActionCancelTrade: Action = {
  name: "cancel-trade",
  formats: [
    {
      tradeID: "number"
    }
  ],
  enact: (agent: Agent, inputData: any) => {
    const controller = new Controller();
    const trade = Trade.getByID(inputData.tradeID);

    controller.cancelTrade(trade);

    logger.log("Event cancel-trade (" + trade.trade_id + ") for agent " + trade.agent_ini.name + "/" + trade.agent_res.name + " registered.", 2);
    controller.sendUpdates();
  },
  validate: (agent: Agent, socket: any, inputData: any) => {
    let res;
    if (!(res = Validate.validate_trade_exists(inputData.tradeID)).status) {
      return res;
    }
    if (!(res = Validate.validate_trade_status(res.trade, [2, 3])).status) {
      return res;
    }
    const res2 = res;
    if (!(res = Validate.validate_agent_logged_in(res.trade.agent_ini)).status) {
      return res;
    }

    return Validate.successMsg;
  }
};
