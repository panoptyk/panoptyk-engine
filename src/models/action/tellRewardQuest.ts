import { Action } from "./action";
import { logger } from "../../utilities/logger";
import { Validate } from "../validate";
import { Controller } from "../../controllers/controller";
import { Agent, Trade, Conversation, Info } from "../index";
import { Quest } from "../quest";

export const ActionTellRewardQuest: Action = {
  name: "tell-reward-quest",
  formats: [
    {
      questID: "number",
      reward: "object"
    }
  ],
  enact: (agent: Agent, inputData: any) => {
    const controller = new Controller();
    const quest: Quest = Quest.getByID(inputData.questID);

    controller.addRewardQuest(quest, inputData.reward);
    logger.log("Event tell-reward-quest from " + agent + " on " + quest + " registered.", 2);
    controller.sendUpdates();
  },
  validate: (agent: Agent, socket: any, inputData: any) => {
    let res;
    if (!(res = Validate.validate_agent_logged_in(agent)).status) {
      return res;
    }
    const quest: Quest = Quest.getByID(inputData.questID);
    if (!(res = Validate.validate_agent_assigned_quest(agent, quest)).status) {
      return res;
    }
    if (!(res = Validate.validate_valid_question(inputData.reward, [])).status) {
        return res;
    }
    return Validate.successMsg;
  }
};
