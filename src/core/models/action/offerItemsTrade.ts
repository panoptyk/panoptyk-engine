import { Action } from "./action";
import { logger } from "../../utilities/logger";
import { Validate } from "../validate";
import { Controller } from "../../controllers/controller";
import { Agent, Item, Trade } from "../index";

export const ActionOfferItemsTrade: Action = {
  name: "offer-items-trade",
  formats: [
    {
      "tradeID": "number",
      "itemIDs": "object"
    }
  ],
  enact: (agent: Agent, inputData: any) => {
    const controller = new Controller();
    const items = Item.getByIDs(inputData.itemIDs);
    const trade = Trade.getByID(inputData.tradeIDs);

    controller.addItemsToTrade(trade, items, agent);

    logger.log("Event offer-items-trade " + trade.tradeID + " registered.", 2);
    controller.sendUpdates();
  },
  validate: (agent: Agent, socket: any, inputData: any) => {
    let res;
    if (!(res = Validate.validate_array_types(inputData.itemIDs, "number")).status) {
      return res;
    }
    const items: Item[] = Item.getByIDs(inputData.itemIDs);
    if (!(res = Validate.validate_agent_owns_items(agent, items)).status) {
      return res;
    }
    if (!(res = Validate.validate_items_not_in_transaction(items)).status) {
      return res;
    }
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
    return Validate.successMsg;
  }
};
