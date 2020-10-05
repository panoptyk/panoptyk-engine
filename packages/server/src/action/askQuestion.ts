// import { Action } from "./action";
// import { logger } from "../utilities/logger";
// import { Validate } from "./validate";
// import { Controller } from "../../controllers/controller";
// import { Models.Agent, Trade, Conversation, Info } from "../models/index";

// export const ActionAskQuestion: Action = {
//   name: "ask-question",
//   formats: [
//     {
//       question: "object",
//       desiredInfo: "object"
//     }
//   ],
//   enact: (agent: Models.Agent, inputData: any) => {
//     const controller = new Controller();
//     const desiredInfo: string[] = inputData.desiredInfo;

//     controller.askQuestion(agent, inputData.question, desiredInfo);
//     logger.log("Event ask-question from " + agent + " registered.", 2);
//     controller.sendUpdates();
//   },
//   validate: (agent: Models.Agent, socket: any, inputData: any) => {
//     let res;
//     if (!(res = Validate.validate_agent_logged_in(agent)).status) {
//       return res;
//     }
//     const conversation = agent.conversation;
//     if (!(res = Validate.validate_conversation_exists(agent.room, conversation)).status) {
//         return res;
//     }
//     if (!(res = Validate.validate_conversation_has_agent(conversation, agent)).status) {
//         return res;
//     }
//     const desiredInfo: string[] = inputData.desiredInfo;
//     if (!(res = Validate.validate_valid_question(inputData.question, desiredInfo)).status) {
//         return res;
//     }
//     return Validate.successMsg;
//   }
// };
