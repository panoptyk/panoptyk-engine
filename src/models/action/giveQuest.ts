import { Action } from "./action";
import { logger } from "../../utilities/logger";
import { Validate } from "../validate";
import { Controller } from "../../controllers/controller";
import { Agent, Trade, Conversation, Info } from "../index";

export const ActionGiveQuest: Action = {
  name: "give-quest",
  formats: [
    {
      receiverID: "number",
      rawInfo: "object",
      isQuestion: "boolean",
      deadline: "number",
      reason: "string",
      rewards: "object"
    }
  ],
  enact: (agent: Agent, inputData: any) => {
    const controller = new Controller();
    const rawInfo = inputData.rawInfo;
    const toAgent = Agent.getByID(inputData.receiverID);
    const reason = inputData.reason;
    const quest = controller.sendQuest(
      agent,
      toAgent,
      rawInfo,
      inputData.isQuestion,
      inputData.deadline,
      reason,
      inputData.rewards
    );
    logger.log(
      "Event give-quest " +
        quest +
        " from agent " +
        agent +
        " to agent " +
        toAgent,
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
    // TODO: validate that rawInfo is valid
    // TODO: validate deadline is valid
    return Validate.successMsg;
  }
};
