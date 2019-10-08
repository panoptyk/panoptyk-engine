import { Action } from "./action";
import { logger } from "../../utilities/logger";
import { Validate } from "../validate";
import { Controller } from "../../controllers/controller";
import { Agent, Room, Item } from "../index";

export const ActionTakeItems: Action = {
  name: "take-items",
  formats: [
    {
      itemIDs: "object"
    }
  ],
  enact: (agent: Agent, inputData: any) => {
    const controller = new Controller();
    const items: Item[] = Item.getByIDs(inputData.itemIDs);

    controller.pickUpItems(agent, items);

    const itemNames = [];
    for (const item of items) {
      itemNames.push(item.itemName);
    }
    logger.log("Event take-items (" + JSON.stringify(inputData.itemIDs) + ") for agent "
      + agent.agentName + " registered.", 2);

    controller.sendUpdates();
  },
  validate: (agent: Agent, socket: any, inputData: any) => {
    let res;
    // check if item in room
    if (!(res = Validate.validate_items_in_room(agent.room, inputData.itemIDs)).status) {
      return res;
    }
    return Validate.successMsg;
  }
};
