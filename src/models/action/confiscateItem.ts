import { Action } from "./action";
import { logger } from "../../utilities/logger";
import { Validate } from "../validate";
import { Controller } from "../../controllers/controller";
import { Agent, Item } from "../index";

export const ActionConfiscateItem: Action = {
  name: "confiscate-item",
  requiredFactionType: new Set(["police"]),
  formats: [
    {
        agentID: "number",
        itemID: "number"
    }
  ],
  enact: (agent: Agent, inputData: any) => {
    const controller = new Controller();
    const item: Item = Item.getByID(inputData.itemID);
    const targetAgent: Agent = Agent.getByID(inputData.agentID);

    controller.stealItem(agent, targetAgent, item);

    logger.log("Event confiscate-item (" + item + ") by agent "
      + agent + " targeting " + targetAgent + " registered.", 2);

    controller.sendUpdates();
  },
  validate: (agent: Agent, socket: any, inputData: any) => {
    let res;
    if (!(res = Validate.validate_agent_logged_in(agent)).status) {
        return res;
    }
    const targetAgent: Agent = Agent.getByID(inputData.agentID);
    if (!(res = Validate.validate_agents_in_same_room(agent, targetAgent)).status) {
        return res;
    }
    const item: Item = Item.getByID(inputData.itemID);
    if (!(res = Validate.validate_agent_owns_items(targetAgent, [item])).status) {
        return res;
    }
    if (!(res = Validate.validate_illegal_item(item)).status) {
        return res;
    }
    return Validate.successMsg;
  }
};
