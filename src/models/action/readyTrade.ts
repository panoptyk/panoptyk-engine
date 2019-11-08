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
    const trade: Trade = Trade.getByID(inputData.tradeID);
    const readyStatus: boolean = inputData.readyStatus;

    controller.setTradeAgentStatus(
      trade,
      agent,
      readyStatus
    );

    logger.log("Event ready-trade " + trade + " from " + agent + " registered.", 2);
    controller.sendUpdates();
  },
  validate: (agent: Agent, socket: any, inputData: any) => {
    let res;
    if (!(res = Validate.validate_trade_exists(inputData.tradeID)).status) {
      return res;
    }
    const trade: Trade = Trade.getByID(inputData.tradeID);
    if (!(res = Validate.validate_trade_status(trade, [2])).status) {
      return res;
    }
    if (
      !(res = Validate.validate_ready_status(
        trade,
        agent,
        !inputData.readyStatus
      )).status
    ) {
      return res;
    }
    if (
      !(res = Validate.validate_agent_logged_in(trade.agentIni)).status
    ) {
      return res;
    }

    return Validate.successMsg;
  }
};
