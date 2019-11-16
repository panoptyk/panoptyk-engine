import { Action } from "./action";
import { logger } from "../../utilities/logger";
import { Validate } from "../validate";
import { Controller } from "../../controllers/controller";
import { Agent, Item, Trade } from "../index";

export const ActionWithdrawItemsTrade: Action = {
  name: "withdraw-items-trade",
  formats: [
    {
      itemIDs: "object"
    }
  ],
  enact: (agent: Agent, inputData: any) => {
    const controller = new Controller();
    const items: Item[] = Item.getByIDs(inputData.itemIDs);
    const trade: Trade = agent.trade;

    controller.removeItemsFromTrade(trade, items, agent);

    logger.log("Event withdraw-items-trade " + trade + " registered.", 2);
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
    const trade: Trade = agent.trade;
    if (!(res = Validate.validate_trade_status(trade, [2])).status) {
      return res;
    }
    if (!(res = Validate.validate_items_in_trade(items, trade, agent)).status) {
      return res;
    }
    if (!(res = Validate.validate_agent_logged_in(trade.agentIni)).status) {
      return res;
    }
    return Validate.successMsg;
  }
};
