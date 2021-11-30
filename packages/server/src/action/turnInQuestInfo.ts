import { Action } from "./action";
import { QuestController } from "../controllers";
import * as Validate from "../validate";
import { Agent, Util, Quest, Information } from "@panoptyk/core/lib";

export const ActionTurnInQuestInfo: Action = {
    name: "turn-in-quest-info",
    formats: [
        {
            questID: "number",
            solutionID: "number"
        },
    ],
    enact: (agent: Agent, inputData: any) => {
        const qc: QuestController = new QuestController();
        const quest = Util.AppContext.db.retrieveModel(
            inputData.questID,
            Quest
        );
        const answer = Util.AppContext.db.retrieveModel(
            inputData.solutionID,
            Information
        );

        const result = qc.turnInQuest(quest, answer);

        Util.logger.log(
            `Event turn-in-quest-info ${answer}
                in quest ${quest} with result ${result ? "succeed" : "failed"}`,
            "ACTION"
        );

        qc.sendUpdates();
    },
    validate: (agent: Agent, socket: any, inputData: any) => {
        let res;

        if (!(res = Validate.loggedIn(agent)).success) {
            return res;
        }

        return Validate.ValidationSuccess;
    }
}











// import { Action } from "./action";
// import { logger } from "../utilities/logger";
// import { Validate } from "./validate";
// import { Controller } from "../../controllers/controller";
// import { Models.Agent, Info } from "../models/index";
// import { Quest } from "../models/quest";

// export const ActionTurnInQuestInfo: Action = {
//   name: "turn-in-quest-info",
//   formats: [
//     {
//       solutionID: "number",
//       questID: "number"
//     }
//   ],
//   enact: (agent: Models.Agent, inputData: any) => {
//     const controller = new Controller();
//     const solution = Info.getByID(inputData.solutionID);
//     const quest: Quest = Quest.getByID(inputData.questID);
//     controller.turnInQuestInfo(agent, quest, solution);

//     logger.log(
//       "Event turn-in-quest-info " +
//         solution +
//         " for " +
//         quest +
//         " from agent " +
//         agent,
//       2
//     );
//     controller.sendUpdates();
//   },
//   validate: (agent: Models.Agent, socket: any, inputData: any) => {
//     let res;
//     if (!(res = Validate.validate_agent_logged_in(agent)).status) {
//       return res;
//     }
//     const conversation = agent.conversation;
//     if (
//       !(res = Validate.validate_conversation_exists(agent.room, conversation))
//         .status
//     ) {
//       return res;
//     }
//     if (
//       !(res = Validate.validate_conversation_has_agent(conversation, agent))
//         .status
//     ) {
//       return res;
//     }
//     const quest: Quest = Quest.getByID(inputData.questID);
//     if (
//       !(res = Validate.validate_conversation_has_agent(
//         conversation,
//         quest.giver
//       )).status
//     ) {
//       return res;
//     }
//     const solution = Info.getByID(inputData.solutionID);
//     if (
//       !(res = Validate.validate_info_satisfies_quest(solution, quest)).status
//     ) {
//       return res;
//     }
//     return Validate.successMsg;
//   }
// };
