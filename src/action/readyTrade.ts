import { Action } from "./action";
import { logger } from "../utilities/logger";
import { Validate } from "./validate";
import { Controller } from "../../controllers/controller";
import { Agent, Trade } from "../models/index";

export const ActionReadyTrade: Action = {
  name: "ready-trade",
  formats: [
    {
      readyStatus: "boolean"
    }
  ],
  enact: (agent: Agent, inputData: any) => {
    const controller = new Controller();
    const trade: Trade = agent.trade;
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
    if (!(res = Validate.validate_agent_logged_in(agent)).status) {
      return res;
    }
    const trade: Trade = agent.trade;
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

    return Validate.successMsg;
  }
};
