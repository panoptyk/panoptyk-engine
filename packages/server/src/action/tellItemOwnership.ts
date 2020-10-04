import { Action } from "./action";
import { logger } from "../utilities/logger";
import { Validate } from "./validate";
import { Controller } from "../../controllers/controller";
import { Models.Agent, Item, Conversation, Info } from "../models/index";

export const ActionTellItemOwnership: Action = {
  name: "tell-item-ownership",
  formats: [
    {
      itemIDs: "object"
    }
  ],
  enact: (agent: Models.Agent, inputData: any) => {
    const controller = new Controller();
    const items: Item[] = Item.getByIDs(inputData.itemIDs);
    controller.tellItemOwnership(agent, items);

    logger.log("Event tell-item-ownership from agent " + agent
      + " on conversation " + agent.conversation, 2);
    controller.sendUpdates();
  },
  validate: (agent: Models.Agent, socket: any, inputData: any) => {
    let res;
    if (!(res = Validate.validate_agent_logged_in(agent)).status) {
      return res;
    }
    const conversation = agent.conversation;
    if (!(res = Validate.validate_conversation_exists(agent.room, conversation)).status) {
        return res;
    }
    if (!(res = Validate.validate_conversation_has_agent(conversation, agent)).status) {
        return res;
    }
    if (!(res = Validate.validate_array_types(inputData.itemIDs, "number")).status) {
      return res;
    }
    const items: Item[] = Item.getByIDs(inputData.itemIDs);
    if (!(res = Validate.validate_agent_owns_items(agent, items)).status) {
      return res;
    }
    return Validate.successMsg;
  }
};
