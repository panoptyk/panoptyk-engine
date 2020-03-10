import { Action } from "./action";
import { logger } from "../../utilities/logger";
import { Validate } from "../validate";
import { Controller } from "../../controllers/controller";
import { Agent, Trade, Conversation, Info, Item } from "../index";

export const ActionGiveQuest: Action = {
  name: "give-quest",
  formats: [
    {
      receiverID: "number",
      rawInfo: "object",
      itemID: "number",
      type: "string",
      amount: "number",
      rewardXP: "number",
      deadline: "number"
    }
  ],
  enact: (agent: Agent, inputData: any) => {
    const controller = new Controller();
    const toAgent = Agent.getByID(inputData.receiverID);
    const item = Item.getByID(inputData.itemID);
    const quest = controller.sendQuest(agent, toAgent, inputData.rawInfo, item,  inputData.type, inputData.amount, inputData.deadline);
    quest.setRewardXP(Math.max(0, inputData.rewardXP));
    logger.log("Event give-quest " + quest + " from agent " + agent + " to agent " + toAgent, 2);
    controller.sendUpdates();
  },
  validate: (agent: Agent, socket: any, inputData: any) => {
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
  // TODO: validate that rawInfo is valid
  // TODO: validate deadline is valid
    return Validate.successMsg;
  }
};
