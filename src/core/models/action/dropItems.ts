import { Action } from "./action";
import { logger } from "../../utilities/logger";
import { Validate } from "../validate";
import { Controller } from "../../controllers/controller";
import { Agent, Item, Room } from "../index";

export const ActionDropItems: Action = {
  name: "drop-items",
  formats: [
    {
      itemIDs: "object"
    }
  ],
  enact: (agent: Agent, inputData: any) => {
    const controller = new Controller();
    const items: Item[] = Item.getByIDs(inputData.itemIDs);
    const room: Room = agent.room;

    controller.removeItemsFromAgentInventory(items);
    controller.addItemsToRoom(room, items, agent);

    const itemNames = [];
    for (const item of items) {
      itemNames.push(item.itemName);
    }
    // TODO: make sure the next part is already done in controller
    // controller.giveInfoToAgents(room.occupants, (agent.agentName + " dropped " +
    //   itemNames.join(", ") + " in room " + room.name));

    logger.log("Event drop-items (" + JSON.stringify(inputData.itemIDs) + ") for agent "
      + agent.agentName + " registered.", 2);
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
    return Validate.successMsg;
  }
};
