import { Action } from "./action";
import { logger } from "../../utilities/logger";
import { Validate } from "../validate";
import { Controller } from "../../controllers/controller";
import { Agent, Trade } from "../index";

export const ActionReadyTrade: Action = {
  name: "ready-trade",
  formats: [
    {
      tradeID: "number",
      readyStatus: "boolean"
    }
  ],
  enact: (agent: Agent, inputData: any) => {
    const controller = new Controller();
    const trade = Trade.getByID(inputData.tradeID);
    const readyStatus = inputData.readyStatus;

    controller.setTradeAgentStatus(
      trade,
      agent,
      readyStatus
    );

    logger.log("Event ready-trade " + trade.trade_id + " registered.", 2);
    controller.sendUpdates();
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
