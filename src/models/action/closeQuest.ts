import { Action } from "./action";
import { logger } from "../../utilities/logger";
import { Validate } from "../validate";
import { Controller } from "../../controllers/controller";
import { Agent, Info } from "../index";
import { Quest } from "../quest";

export const ActionCloseQuest: Action = {
  name: "close-quest",
  formats: [
    {
      questID: "number",
      status: "string"
    }
  ],
  enact: (agent: Agent, inputData: any) => {
    const controller = new Controller();
    const quest: Quest = Quest.getByID(inputData.questID);
    controller.closeQuest(agent, quest, inputData.status);
    logger.log(
      "Event close-quest as " +
        inputData.status +
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
    const quest: Quest = Quest.getByID(inputData.questID);
    if (!(res = Validate.validate_agent_assigned_quest(agent, quest)).status) {
      return res;
    }
    return Validate.successMsg;
  }
};
