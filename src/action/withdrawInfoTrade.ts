import { Action } from "./action";
import { logger } from "../utilities/logger";
import { Validate } from "./validate";
import { Controller } from "../../controllers/controller";
import { Agent, Info, Trade } from "../models/index";

export const ActionWithdrawInfoTrade: Action = {
  name: "withdraw-info-trade",
  formats: [
    {
      "infoID": "number"
    }
  ],
  enact: (agent: Agent, inputData: any) => {
    const controller = new Controller();
    const trade: Trade = agent.trade;
    const info: Info = Info.getByID(inputData.infoID);

    controller.removeInfoFromTrade(trade, info, agent);
    logger.log("Event withdraw-info-trade from " + agent + " on " + trade + " registered.", 2);
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
    const info: Info = Info.getByID(inputData.infoID);
    if (!(res = Validate.validate_agent_owns_info(agent, info)).status) {
        return res;
    }
    return Validate.successMsg;
  }
};
