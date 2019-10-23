import { Action } from "./action";
import { logger } from "../../utilities/logger";
import { Validate } from "../validate";
import { Controller } from "../../controllers/controller";
import { Agent, Conversation, Info } from "../index";

export const ActionAnswerQuestion: Action = {
  name: "confirm-knowledge",
  formats: [
    {
      questionID: "number",
      answerID: "number"
    }
  ],
  enact: (agent: Agent, inputData: any) => {
    const controller = new Controller();
    const conversation: Conversation = agent.conversation;
    const question: Info = Info.getByID(inputData.questionID);

    controller.answerQuestion(agent, question, conversation);
    logger.log("Event answer-question (" + question + ") for conversation " + conversation + " registered.", 2);
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
    if (!(res = Validate.validate_can_answer(question, conversation)).status) {
        return res;
    }
    const answer: Info = Info.getByID(inputData.answerID);
    if (!(res = Validate.validate_agent_owns_info(agent, answer)).status) {
        return res;
    }
    if (!(res = Validate.validate_info_is_answer(answer, question)).status) {
        return res;
    }
    if (!(res = Validate.validate_answer_not_used(answer, question)).status) {
      return res;
    }
    return Validate.successMsg;
  }
};
