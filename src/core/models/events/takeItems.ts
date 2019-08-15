import { Action } from "./action";
import { logger } from "../../utilities/logger";
import { Validate } from "../validate";
import { Controller } from "../../controllers/controller";
import { Agent } from "../agent";

export const ActionTakeItems: Action = {
  name: "take-items",
  formats: [
    {
      data1: "number"
    }
  ],
  enact: (agent: Agent, inputData: any) => {
    // TODO: fix event functionality
    // this.items = res.items;
    // this.room = this.fromAgent.room;

    // Controller.removeAgentFromConversationIfIn(this.fromAgent);
    // Controller.removeItemsFromRoom(this.items, this.fromAgent);
    // Controller.addItemsToAgentInventory(this.fromAgent, this.items);

    // const itemNames = [];
    // for (const item of this.items) {
    //   itemNames.push(item.name);
    // }
    // Controller.giveInfoToAgents(this.room.occupants, (this.fromAgent.agentName + " picked up " +
    //   itemNames.join(", ") + " in room " + this.room.name));

    // logger.log("Event take-items (" + JSON.stringify(inputData.item_ids) + ") for agent "
    //     + this.fromAgent.agentName + " registered.", 2);
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
