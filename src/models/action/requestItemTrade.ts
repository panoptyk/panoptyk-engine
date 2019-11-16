import { Action } from "./action";
import { logger } from "../../utilities/logger";
import { Validate } from "../validate";
import { Controller } from "../../controllers/controller";
import { Agent, Item, Trade } from "../index";

export const ActionRequestItemTrade: Action = {
  name: "request-item-trade",
  formats: [
    {
        itemID: "number"
    }
  ],
  enact: (agent: Agent, inputData: any) => {
    const controller = new Controller();
    const item: Item = Item.getByID(inputData.itemID);
    const trade: Trade = agent.trade;

    controller.requestItemTrade(agent, trade, item);

    logger.log("Event request-item-trade " + trade + " registered.", 2);
    controller.sendUpdates();
  },
  validate: (agent: Agent, socket: any, inputData: any) => {
    let res;
    const trade: Trade = agent.trade;
    if (!(res = Validate.validate_trade_status(trade, [2])).status) {
      return res;
    }
    if (!(res = Validate.validate_agent_logged_in(trade.agentIni)).status) {
      return res;
    }
    return Validate.successMsg;
  }
};
