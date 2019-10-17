import { Action } from "./action";
import { logger } from "../../utilities/logger";
import { Validate } from "../validate";
import { Controller } from "../../controllers/controller";
import { Agent, Info, Trade } from "../index";

export const ActionWithdrawInfoTrade: Action = {
  name: "withdraw-info-trade",
  formats: [
    {
      "tradeID": "number",
      "infoID": "number"
    }
  ],
  enact: (agent: Agent, inputData: any) => {
    const controller = new Controller();
    const trade: Trade = Trade.getByID(inputData.tradeID);
    const info: Info = Info.getByID(inputData.infoID);

    controller.removeInfoFromTrade(trade, info, agent);
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
    if (!(res = Validate.validate_agent_logged_in(trade.agentIni)).status) {
      return res;
    }
    const info: Info = Info.getByID(inputData.infoID);
    if (!(res = Validate.validate_agent_owns_info(agent, info)).status) {
        return res;
    }
    return Validate.successMsg;
  }
};
