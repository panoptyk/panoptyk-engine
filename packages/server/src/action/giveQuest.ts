import { Action } from "./action";
import { ConversationController } from "../controllers";
import * as Validate from "../validate";
import { Agent, Util, Information } from "@panoptyk/core/lib";

export const ActionGiveQuest: Action = {
    name: "give-quest",
    formats: [
        {
            giverID: "number",
            receiverID: "number",
            taskID: "number",
            deadline: "number",
        },
    ],
    enact: (agent: Agent, inputData: any) => {
        const cc: ConversationController = new ConversationController();
        const giver = Util.AppContext.db.retrieveModel(
            inputData.giverID,
            Agent
        );
        const receiver = Util.AppContext.db.retrieveModel(
            inputData.receiverID,
            Agent
        );
        const task = Util.AppContext.db.retrieveModel(
            inputData.taskID,
            Information
        );
        const deadline = inputData.deadline;

        const quest = cc.createQuestInConversation(agent.conversation, giver, receiver, task, deadline);

        Util.logger.log(
            `Event give-quest ${quest} from giver ${giver}
                to receiver ${receiver} with deadline ${deadline}`,
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

        return Validate.ValidationSuccess;
    }
}






// import { Action } from "./action";
// import { logger } from "../utilities/logger";
// import { Validate } from "./validate";
// import { Controller } from "../../controllers/controller";
// import { Models.Agent, Trade, Conversation, Info } from "../models/index";

// export const ActionGiveQuest: Action = {
//   name: "give-quest",
//   formats: [
//     {
//       receiverID: "number",
//       rawInfo: "object",
//       isQuestion: "boolean",
//       deadline: "number"
//     }
//   ],
//   enact: (agent: Models.Agent, inputData: any) => {
//     const controller = new Controller();
//     const rawInfo = inputData.rawInfo;
//     const toModels.Agent = Models.Agent.getByID(inputData.receiverID);
//     const quest = controller.sendQuest(agent, toModels.Agent, rawInfo, inputData.isQuestion, inputData.deadline);
//     logger.log("Event give-quest " + quest + " from agent " + agent + " to agent " + toModels.Agent, 2);
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
//   // TODO: validate that rawInfo is valid
//   // TODO: validate deadline is valid
//     return Validate.successMsg;
//   }
// };
