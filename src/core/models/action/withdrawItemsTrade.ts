import { Action } from "./action";
import { logger } from "../../utilities/logger";
import { Validate } from "../validate";
import { Controller } from "../../controllers/controller";
import { Agent, Item, Trade } from "../index";

export const ActionWithdrawItemsTrade: Action = {
  name: "withdraw-items-trade",
  formats: [
    {
      tradeID: "number",
      itemIDs: "object"
    }
  ],
  enact: (agent: Agent, inputData: any) => {
    const controller = new Controller();
    // TODO: fix event functionality
    const items = Item.getByIDs(inputData.itemIDs);
    const trade = Trade.getByID(inputData.tradeID);

    controller.removeItemsFromTrade(trade, items, agent);

    logger.log("Event withdraw-items-trade " + trade.trade_id + " registered.", 2);
    controller.sendUpdates();
  },
  validate: (agent: Agent, socket: any, inputData: any) => {
    let res;
    if (!(res = Validate.validate_array_types(inputData.item_ids, "number")).status) {
      return res;
    }
    if (!(res = Validate.validate_agent_owns_items(agent, inputData.item_ids)).status) {
      return res;
    }
    const items = res.items;
    if (!(res = Validate.validate_trade_exists(inputData.trade_id)).status) {
      return res;
    }
    if (!(res = Validate.validate_trade_status(res.trade, [2])).status) {
      return res;
    }
    if (!(res = Validate.validate_items_in_trade(items, res.trade, agent)).status) {
      return res;
    }
    const res2 = res;
    if (!(res = Validate.validate_agent_logged_in(res.trade.agent_ini)).status) {
      return res;
    }
    return Validate.successMsg;
  }
};
