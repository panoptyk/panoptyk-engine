import { Action } from "./action";
import { logger } from "../../utilities/logger";
import { Validate } from "../validate";
import { Controller } from "../../controllers/controller";
import { Agent, Trade, Conversation, Info } from "../index";

export const ActionAskQuestion: Action = {
  name: "ask-question",
  formats: [
    {
      question: "object"
    }
  ],
  enact: (agent: Agent, inputData: any) => {
    const controller = new Controller();

    controller.askQuestion(agent, inputData.question);
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
    if (!(res = Validate.validate_valid_question(inputData.question)).status) {
        return res;
    }
    return Validate.successMsg;
  }
};
