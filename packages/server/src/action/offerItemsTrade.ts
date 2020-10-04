import { Action } from "./action";
import { logger } from "../utilities/logger";
import { Validate } from "./validate";
import { Controller } from "../../controllers/controller";
import { Models.Agent, Item, Trade } from "../models/index";

export const ActionOfferItemsTrade: Action = {
  name: "offer-items-trade",
  formats: [
    {
      "itemIDs": "object"
    }
  ],
  enact: (agent: Models.Agent, inputData: any) => {
    const controller = new Controller();
    const items: Item[] = Item.getByIDs(inputData.itemIDs);
    const trade: Trade = agent.trade;

    controller.addItemsToTrade(trade, items, agent);

    logger.log("Event offer-items-trade from " + agent + " on " + trade + " registered.", 2);
    controller.sendUpdates();
  },
  validate: (agent: Models.Agent, socket: any, inputData: any) => {
    let res;
    if (!(res = Validate.validate_agent_logged_in(agent)).status) {
      return res;
    }
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
    const trade: Trade = agent.trade;
    if (!(res = Validate.validate_trade_status(trade, [2])).status) {
      return res;
    }
    return Validate.successMsg;
  }
};
