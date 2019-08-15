import { Action } from "./action";
import { logger } from "../../utilities/logger";
import { Validate } from "../validate";
import { Controller } from "../../controllers/controller";
import { Agent } from "../agent";

export const ActionCancelTrade: Action = {
  name: "cancel-trade",
  formats: [
    {
      tradeID: "number"
    }
  ],
  enact: (agent: Agent, inputData: any) => {
    // TODO: fix event functionality
    // this.trade = res.trade;

    // Controller.cancelTrade(this.trade);

    // logger.log("Event cancel-trade (" + this.trade.trade_id + ") for agent " + this.trade.agent_ini.name + "/" + this.trade.agent_res.name + " registered.", 2);
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
