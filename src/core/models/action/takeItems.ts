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
    const items = Item.getByIDs(inputData.itemIDs);
    const room = agent.room;

    controller.removeAgentFromConversationIfIn(agent);
    controller.removeItemsFromRoom(items, agent);
    controller.addItemsToAgentInventory(agent, items);

    const itemNames = [];
    for (const item of items) {
      itemNames.push(item.name);
    }
    // TODO: make sure the next part is already done in controller
    // controller.giveInfoToAgents(room.occupants, (agent.agentName + " picked up " +
    //   itemNames.join(", ") + " in room " + room.name));

    logger.log("Event take-items (" + JSON.stringify(inputData.item_ids) + ") for agent "
      + agent.agentName + " registered.", 2);
    controller.sendUpdates();
  },
  validate: (agent: Agent, socket: any, inputData: any) => {
    let res;
    // check if item in room
    if (!(res = Validate.validate_items_in_room(agent.room, inputData.item_ids)).status) {
      return res;
    }
    return Validate.successMsg;
  }
};
