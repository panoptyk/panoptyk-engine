import { Action } from "./action";
import { logger } from "../utilities/logger";
import * as Validate from "../validate";
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
      + agent.agentName + " registered.", "ACTION");

    ic.sendUpdates();
  },
  validate: (agent: Agent, socket: any, inputData: any) => {
    let res;
    if (!(res = Validate.loggedIn(agent)).success) {
      return res;
    }
    if (!(res = Validate.arrayTypes(inputData.itemIDs, "number")).success) {
      return res;
    }
    const items: Item[] = inject.db.retrieveModels(inputData.itemID, Item) as Item[];
    if (!(res = Validate.ownsItems(agent, items)).success) {
      return res;
    }
    if (!(res = Validate.notInTransaction(items)).success) {
      return res;
    }
    return Validate.ValidationSuccess;
  }
};
