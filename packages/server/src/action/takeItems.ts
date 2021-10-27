import { Util, Agent, Item } from "@panoptyk/core";
import { Action } from "./action";
import * as Validate from "../validate";
import { InventoryController } from "../controllers";

export const ActionTakeItems: Action = {
  name: "take-items",
  formats: [
    {
      itemIDs: "object"
    }
  ],
  enact: (agent: Agent, inputData: any) => {
    const ic: InventoryController = new InventoryController();
    const items: Item[] = Util.AppContext.db.retrieveModels(inputData.itemIDs, Item) as Item[];

    ic.pickupItems(agent, items, agent.room);

    const itemNames = [];
    for (const item of items) {
      itemNames.push(item.itemName);
    }
    Util.logger.log("Event take-items (" + JSON.stringify(inputData.itemIDs) + ") for agent "
      + agent + " registered.", "ACTION");

    ic.sendUpdates();
  },
  validate: (agent: Agent, socket: any, inputData: any) => {
    let res;
    if (!(res = Validate.loggedIn(agent)).success) {
      return res;
    }
    // check if item in room
    const items: Item[] = Util.AppContext.db.retrieveModels(inputData.itemIDs, Item) as Item[];
    if (!(res = Validate.inRoom(items, agent.room)).success) {
      return res;
    }
    return Validate.ValidationSuccess;
  }
};
