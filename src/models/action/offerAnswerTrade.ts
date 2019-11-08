import { Action } from "./action";
import { logger } from "../../utilities/logger";
import { Validate } from "../validate";
import { Controller } from "../../controllers/controller";
import { Agent, Info, Trade } from "../index";

export const ActionOfferAnswerTrade: Action = {
  name: "offer-answer-trade",
  formats: [
    {
      "tradeID": "number",
      "answerID": "number",
      "questionID": "number",
      "mask": "string[]"
    }
  ],
  enact: (agent: Agent, inputData: any) => {
    const controller = new Controller();
    const trade: Trade = Trade.getByID(inputData.tradeID);
    const answer: Info = Info.getByID(inputData.answerID);
    const question: Info = Info.getByID(inputData.questionID);
    const mask: string[] = inputData.mask;

    controller.addAnswerToTrade(trade, answer, question, agent, mask);
    controller.sendUpdates();
  },
  validate: (agent: Agent, socket: any, inputData: any) => {
    let res;
    if (!(res = Validate.validate_trade_exists(inputData.tradeID)).status) {
      return res;
    }
    const trade: Trade = Trade.getByID(inputData.tradeID);
    if (!(res = Validate.validate_trade_status(trade, [2])).status) {
      return res;
    }
    if (!(res = Validate.validate_agent_logged_in(trade.agentIni)).status) {
      return res;
    }
    const answer: Info = Info.getByID(inputData.answerID);
    const question: Info = Info.getByID(inputData.questionID);
    const mask: string[] = inputData.mask;
    if (!(res = Validate.validate_info_mask(answer, mask)).status) {
      return res;
    }
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
