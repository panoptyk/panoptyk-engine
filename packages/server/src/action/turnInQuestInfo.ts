import { Action } from "./action";
import * as Validate from "../validate";
import { Agent, Util, Quest, Information } from "@panoptyk/core/lib";
import { QuestController } from "../controllers";

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

        const result = qc.turnInQuestInfo(agent.conversation, quest, answer, agent);

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

        const conversation = agent.conversation;

        if (!(res = Validate.conversationInAgentsRoom(conversation, agent.room)).success) {
            return res;
        }

        if (!(res = Validate.conversationContainsAgent(conversation, agent)).success) {
            return res;
        }

        if (!(res = Validate.invalidConversation(conversation)).success) {
            return res;
        }

        return Validate.ValidationSuccess;
    }
}
