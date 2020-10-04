import { Action } from "./action";
import { logger } from "../utilities/logger";
import { Validate } from "./validate";
import { Controller } from "../../controllers/controller";
import { Models.Agent, Item, Trade } from "../models/index";

export const ActionRequestItemTrade: Action = {
  name: "request-item-trade",
  formats: [
    {
        itemID: "number"
    }
  ],
  enact: (agent: Models.Agent, inputData: any) => {
    const controller = new Controller();
    const item: Item = Item.getByID(inputData.itemID);
    const trade: Trade = agent.trade;

    controller.requestItemTrade(agent, trade, item);

    logger.log("Event request-item-trade from " + agent + " on " + trade + " registered.", 2);
    controller.sendUpdates();
  },
  validate: (agent: Models.Agent, socket: any, inputData: any) => {
    let res;
    if (!(res = Validate.validate_agent_logged_in(agent)).status) {
      return res;
    }
    const trade: Trade = agent.trade;
    if (!(res = Validate.validate_trade_status(trade, [2])).status) {
      return res;
    }
    return Validate.successMsg;
  }
};
