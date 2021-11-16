import { Agent, Util, Information } from "@panoptyk/core/lib";
import { Action } from "./action";
import * as Validate from "../validate";
import { ConversationController } from "../controllers";

export const ActionTellInfo: Action = {
    name: "ask-question",
    formats: [
        {
            predicate: "string",
            question: "object",
        },
    ],
    enact: (agent: Agent, inputData: any) => {
        const cc: ConversationController = new ConversationController();
        const question = Util.AppContext.db.retrieveModel(
            inputData.questionID,
            Information
        );

        cc.askQuestionInConversation(
            agent.conversation,
            agent,
            inputData.predicate,
            question
        );

        Util.logger.log(
            `Event ask-question ${question} from questioner ${agent}
                on conversation ${agent.conversation}`,
            "ACTION"
        );

        cc.sendUpdates();
    },
    validate: (agent: Agent, socket: any, inputData: any) => {
        let res;

        if (!(res = Validate.loggedIn(agent)).success) {
            return res;
        }

        const conversation = agent.conversation;

        if (!(res = Validate.conversationInAgentsRoom(conversation, agent.room)).success) {
            return res;
        }

        if (!(res = Validate.hasAgent(conversation, agent)).success) {
            return res;
        }

        if (!(res = Validate.invalidConversation(conversation)).success) {
            return res;
        }

        if (!(res = Validate.invalidQuestion(inputData.prediate)).success) {
            return res;
        }

        return Validate.ValidationSuccess;
    }
};







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
