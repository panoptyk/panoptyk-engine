import { Action } from "./action";
import { logger } from "../../utilities/logger";
import { Validate } from "../validate";
import { Controller } from "../../controllers/controller";
import { Agent } from "../agent";

export const ActionDropItems: Action = {
  name: "drop-items",
  formats: [
    {
      itemIDs: "object"
    }
  ],
  enact: (agent: Agent, inputData: any) => {
    // TODO: fix event functionality
    // this.items = res.items;
    // this.room = this.fromAgent.room;

    // Controller.removeItemsFromAgentInventory(this.items);
    // Controller.addItemsToRoom(this.room, this.items, this.fromAgent);

    // const itemNames = [];
    // for (const item of this.items) {
    //   itemNames.push(item.name);
    // }
    // Controller.giveInfoToAgents(this.room.occupants, (this.fromAgent.agentName + " dropped " +
    //   itemNames.join(", ") + " in room " + this.room.name));

    // logger.log("Event drop-items (" + JSON.stringify(inputData.item_ids) + ") for agent "
    //     + this.fromAgent.agentName + " registered.", 2);
  },
  validate: (agent: Agent, socket: any, inputData: any) => {
    let res;
    if (!(res = Validate.validate_array_types(inputData.itemIDs, "number")).status) {
      return res;
    }
    if (!(res = Validate.validate_agent_owns_items(agent, inputData.itemIDs)).status) {
      return res;
    }
    if (!(res = Validate.validate_items_not_in_transaction(res.items)).status) {
      return res;
    }
    return Validate.successMsg;
  }
};
