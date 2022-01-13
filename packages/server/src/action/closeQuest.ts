import { Action } from "./action";
import * as Validate from "../validate";
import { Agent, Util, Quest } from "@panoptyk/core";
import { QuestController } from "../controllers";

export const ActionCloseQuest: Action = {
    name: "close-quest",
    formats: [
        {
        questID: "number"
        }
    ],
    enact: (agent: Agent, inputData: any) => {
        const qc: QuestController = new QuestController();
        const quest = Util.AppContext.db.retrieveModel(
            inputData.questID,
            Quest
        );
        
        qc.closeQuest(quest);
        
        Util.logger.log(
            `Event close-quest (${quest}) by quest giver (${quest.giver})`,
            "ACTION"
        );

        qc.sendUpdates();
    },
    validate: (agent: Agent, socket: any, inputData: any) => {
        let res;
        const quest = Util.AppContext.db.retrieveModel(
            inputData.questID, 
            Quest
        );
        
        if (!(res = Validate.loggedIn(agent)).success) {
            return res;
        }

        if (!(res = Validate.isAgentTheTargetAgent(agent, quest.giver)).success) {
            return res;
        }

        return Validate.ValidationSuccess;
    }
};
