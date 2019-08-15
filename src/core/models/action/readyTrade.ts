import { Action } from "./action";
import { logger } from "../../utilities/logger";
import { Validate } from "../validate";
import { Controller } from "../../controllers/controller";
import { Agent } from "../agent";

export const ActionReadyTrade: Action = {
  name: "ready-trade",
  formats: [
    {
      tradeID: "number",
      readyStatus: "boolean"
    }
  ],
  enact: (agent: Agent, inputData: any) => {
    // TODO: fix event functionality
    // this.trade = res.trade;
    // this.readyStatus = inputData.readyStatus;

    // Controller.setTradeAgentStatus(
    //   this.trade,
    //   this.fromAgent,
    //   this.readyStatus
    // );

    // logger.log("Event ready-trade " + this.trade.trade_id + " registered.", 2);
  },
  validate: (agent: Agent, socket: any, inputData: any) => {
    let res;
    if (!(res = Validate.validate_trade_exists(inputData.trade_id)).status) {
      return res;
    }
    if (!(res = Validate.validate_trade_status(res.trade, [2])).status) {
      return res;
    }
    if (
      !(res = Validate.validate_ready_status(
        res.trade,
        agent,
        !inputData.readyStatus
      )).status
    ) {
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