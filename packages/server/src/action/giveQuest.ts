import { Action } from "./action";
import * as Validate from "../validate";
import { Agent, Util, Information } from "@panoptyk/core/lib";
import { QuestController } from "../controllers";

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
        const qc: QuestController = new QuestController();
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
        
        const quest = qc.createQuest(agent.conversation, giver, receiver, task, deadline);

        Util.logger.log(
            `Event give-quest ${quest} from giver ${giver}
                to receiver ${receiver} with deadline ${deadline}`,
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
