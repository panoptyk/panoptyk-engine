import { Action } from "./action";
import { logger } from "../../utilities/logger";
import { Validate } from "../validate";
import { Controller } from "../../controllers/controller";
import { Agent, Trade, Conversation, Info } from "../index";

export const ActionGiveQuest: Action = {
  name: "give-quest",
  formats: [
    {
      rawInfo: "object"
    }
  ],
  enact: (agent: Agent, inputData: any) => {
    const controller = new Controller();
    const rawInfo = inputData.rawInfo;
    controller.sendQuest(agent, rawInfo);
    controller.sendUpdates();
  },
  validate: (agent: Agent, socket: any, inputData: any) => {
    let res;
    const conversation = agent.conversation;
    if (!(res = Validate.validate_agent_logged_in(agent)).status) {
        return res;
    }
    if (!(res = Validate.validate_conversation_exists(agent.room, conversation)).status) {
        return res;
    }
    if (!(res = Validate.validate_conversation_has_agent(conversation, agent)).status) {
        return res;
    }
    if (!(res = Validate.validate_required_rank(agent, 0)).status) {
        return res;
    }
    // TODO: validate that rawInfo is valid
    return Validate.successMsg;
  }
};
