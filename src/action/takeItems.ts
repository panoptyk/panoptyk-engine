import { Action } from "./action";
import { logger } from "../utilities/logger";
import { Validate } from "./validate";
import { InventoryController } from "../controllers";
import { Agent, Room, Item } from "../models/index";
import { inject } from "../utilities";

export const ActionTakeItems: Action = {
  name: "take-items",
  formats: [
    {
      itemIDs: "object"
    }
  ],
  enact: (agent: Agent, inputData: any) => {
    const ic: InventoryController = new InventoryController();
    const items: Item[] = inject.db.retrieveModels(inputData.itemIDs, Item) as Item[];

    ic.pickupItems(agent, items, agent.room);

    const itemNames = [];
    for (const item of items) {
      itemNames.push(item.itemName);
    }
    logger.log("Event take-items (" + JSON.stringify(inputData.itemIDs) + ") for agent "
      + agent + " registered.", 2);

    ic.sendUpdates();
  },
  validate: (agent: Agent, socket: any, inputData: any) => {
    let res;
    if (!(res = Validate.validate_agent_logged_in(agent)).status) {
      return res;
    }
    // check if item in room
    if (!(res = Validate.validate_items_in_room(agent.room, inputData.itemIDs)).status) {
      return res;
    }
    return Validate.successMsg;
  }
};
