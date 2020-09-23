import { Action } from "./action";
import { logger } from "../utilities/logger";
import { Validate } from "./validate";
import { InventoryController } from "../controllers";
import { Agent, Item, Room } from "../models/index";
import { inject } from "../utilities";

export const ActionDropItems: Action = {
  name: "drop-items",
  formats: [
    {
      itemIDs: "object"
    }
  ],
  enact: (agent: Agent, inputData: any) => {
    const ic: InventoryController = new InventoryController();
    const items: Item[] = inject.db.retrieveModels(inputData.itemID, Item) as Item[];

    ic.dropItems(agent, items, agent.room);

    const itemNames = [];
    for (const item of items) {
      itemNames.push(item.itemName);
    }
    logger.log("Event drop-items (" + JSON.stringify(inputData.itemIDs) + ") for agent "
      + agent.agentName + " registered.", 2);

    ic.sendUpdates();
  },
  validate: (agent: Agent, socket: any, inputData: any) => {
    let res;
    if (!(res = Validate.validate_agent_logged_in(agent)).status) {
      return res;
    }
    if (!(res = Validate.validate_array_types(inputData.itemIDs, "number")).status) {
      return res;
    }
    const items: Item[] = inject.db.retrieveModels(inputData.itemID, Item) as Item[];
    if (!(res = Validate.validate_agent_owns_items(agent, items)).status) {
      return res;
    }
    if (!(res = Validate.validate_items_not_in_transaction(items)).status) {
      return res;
    }
    return Validate.successMsg;
  }
};
