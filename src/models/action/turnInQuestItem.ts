import { Action } from "./action";
import { logger } from "../../utilities/logger";
import { Validate } from "../validate";
import { Controller } from "../../controllers/controller";
import { Agent } from "../index";
import { Quest } from "../quest";
import { Item } from "../item";

export const ActionTurnInQuestItem: Action = {
  name: "turn-in-quest-item",
  formats: [
    {
      solutionID: "number",
      questID: "number"
    }
  ],
  enact: (agent: Agent, inputData: any) => {
    const controller = new Controller();
    const solution = Item.getByID(inputData.solutionID);
    const quest: Quest = Quest.getByID(inputData.questID);
    controller.turnInQuestItem(agent, quest, solution);

    logger.log(
      "Event turn-in-quest-item " +
        solution +
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
    const solution = Item.getByID(inputData.solutionID);
    if (
      !(res = Validate.validate_item_satisfies_quest(solution, quest)).status
    ) {
      return res;
    }
    return Validate.successMsg;
  }
};
