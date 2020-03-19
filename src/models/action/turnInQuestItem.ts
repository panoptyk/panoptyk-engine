import { Action } from "./action";
import { logger } from "../../utilities/logger";
import { Validate } from "../validate";
import { Controller } from "../../controllers/controller";
import { Agent, Info, Item } from "../index";
import { Quest } from "../quest";

export const ActionTurnInQuestItem: Action = {
  name: "turn-in-quest-item",
  formats: [
    {
      itemID: "number",
      questID: "number"
    }
  ],
  enact: (agent: Agent, inputData: any) => {
    const controller = new Controller();
    const item: Item = Item.getByID(inputData.itemID);
    const quest: Quest = Quest.getByID(inputData.questID);
    controller.turnInQuestItem(agent, quest, item);

    logger.log(
      "Event turn-in-quest-item " +
        item +
        " for " +
        quest +
        " from agent " +
        agent,
      2
    );
    controller.sendUpdates();
  },
  validate: (agent: Agent, socket: any, inputData: any) => {
    let res;
    if (!(res = Validate.validate_agent_logged_in(agent)).status) {
      return res;
    }
    const conversation = agent.conversation;
    if (
      !(res = Validate.validate_conversation_exists(agent.room, conversation))
        .status
    ) {
      return res;
    }
    if (
      !(res = Validate.validate_conversation_has_agent(conversation, agent))
        .status
    ) {
      return res;
    }
    const quest: Quest = Quest.getByID(inputData.questID);
    if (
      !(res = Validate.validate_conversation_has_agent(
        conversation,
        quest.giver
      )).status
    ) {
      return res;
    }
    const item: Item = Item.getByID(inputData.itemID);
    if (!(res = Validate.validate_agent_owns_items(agent, [item])).status) {
      return res;
    }
    if (!(res = Validate.validate_item_satisfies_quest(item, quest)).status) {
      return res;
    }
    return Validate.successMsg;
  }
};
