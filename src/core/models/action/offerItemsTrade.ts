import { Action } from "./action";
import { logger } from "../../utilities/logger";
import { Validate } from "../validate";
import { Controller } from "../../controllers/controller";
import { Agent } from "../agent";

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
    // TODO: fix event functionality
    // this.items = res.items;
    // this.trade = res.trade;

    // Controller.addItemsToTrade(this.trade, this.items, this.fromAgent);

    // logger.log("Event offer-items-trade " + this.trade.trade_id + " registered.", 2);
  },
  validate: (agent: Agent, socket: any, inputData: any) => {
    let res;
    if (!(res = Validate.validate_array_types(inputData.item_ids, "number")).status) {
      return res;
    }
    if (!(res = Validate.validate_agent_owns_items(agent, inputData.item_ids)).status) {
      return res;
    }
    if (!(res = Validate.validate_items_not_in_transaction(res.items)).status) {
      return res;
    }
    const items = res.items;
    if (!(res = Validate.validate_trade_exists(inputData.trade_id)).status) {
      return res;
    }
    if (!(res = Validate.validate_trade_status(res.trade, [2])).status) {
      return res;
    }
    const res2 = res;
    if (!(res = Validate.validate_agent_logged_in(res.trade.agent_ini)).status) {
      return res;
    }
    return Validate.successMsg;
  }
};
