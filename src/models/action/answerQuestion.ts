import { Action } from "./action";
import { logger } from "../../utilities/logger";
import { Validate } from "../validate";
import { Controller } from "../../controllers/controller";
import { Agent, Trade, Conversation, Info } from "../index";

export const ActionAnswerQuestion: Action = {
  name: "answer-question",
  formats: [
    {
      questionID: "number"
    }
  ],
  enact: (agent: Agent, inputData: any) => {
    const controller = new Controller();
    const conversation: Conversation = agent.conversation;
    const question: Info = Info.getByID(inputData.questionID);
    question.query = true;

    controller.answerQuestion(agent, question, conversation);
    controller.sendUpdates();
  },
  validate: (agent: Agent, socket: any, inputData: any) => {
    let res;
    const conversation = agent.conversation;
    const question = Info.getByID(inputData.questionID);
    if (!(res = Validate.validate_agent_logged_in(agent)).status) {
        return res;
    }
    if (!(res = Validate.validate_conversation_exists(agent.room, conversation)).status) {
        return res;
    }
    if (!(res = Validate.validate_conversation_has_agent(conversation, agent)).status) {
        return res;
    }
    if (!(res = Validate.validate_can_answer(agent, question, conversation)).status) {
        return res;
    }
    return Validate.successMsg;
  }
};
