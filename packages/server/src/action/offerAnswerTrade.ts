// import { Action } from "./action";
// import { logger } from "../utilities/logger";
// import { Validate } from "./validate";
// import { Controller } from "../../controllers/controller";
// import { Models.Agent, Info, Trade } from "../models/index";

// export const ActionOfferAnswerTrade: Action = {
//   name: "offer-answer-trade",
//   formats: [
//     {
//       "answerID": "number",
//       "questionID": "number",
//       "mask": "object"
//     }
//   ],
//   enact: (agent: Models.Agent, inputData: any) => {
//     const controller = new Controller();
//     const trade: Trade = agent.trade;
//     const answer: Info = Info.getByID(inputData.answerID);
//     const question: Info = Info.getByID(inputData.questionID);
//     const mask: string[] = inputData.mask;

//     controller.addAnswerToTrade(trade, answer, question, agent, mask);
//     logger.log("Event offer-answer-trade from " + agent + " on " + trade + " registered.", 2);
//     controller.sendUpdates();
//   },
//   validate: (agent: Models.Agent, socket: any, inputData: any) => {
//     let res;
//     if (!(res = Validate.validate_agent_logged_in(agent)).status) {
//       return res;
//     }
//     const trade: Trade = agent.trade;
//     if (!(res = Validate.validate_trade_status(trade, [2])).status) {
//       return res;
//     }
//     const answer: Info = Info.getByID(inputData.answerID);
//     const question: Info = Info.getByID(inputData.questionID);
//     const mask: string[] = inputData.mask;
//     if (!(res = Validate.validate_info_mask(answer, mask)).status) {
//       return res;
//     }
//     if (!(res = Validate.validate_agent_owns_info(agent, answer)).status) {
//         return res;
//     }
//     if (!(res = Validate.validate_info_is_answer(question, answer)).status) {
//         return res;
//     }
//     if (!(res = Validate.validate_answer_not_used(trade, answer)).status) {
//       return res;
//     }
//     return Validate.successMsg;
//   }
// };
