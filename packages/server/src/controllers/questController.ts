import { BaseController } from "./baseController";
import { Quest, Agent, Info, AgentManipulator } from "@panoptyk/core";

export class QuestController extends BaseController {
    createQuest(
        questGiver: Agent, 
        questReceiver: Agent,
        task: Info,
        deadline: number
    ): Quest {
        const quest: Quest = new Quest(questGiver, questReceiver, task, "ACTIVE", deadline);

        AgentManipulator.giveQuest(questGiver, quest);
        AgentManipulator.addQuest(questReceiver, quest);

        this.updateChanges(questGiver, [quest]);
        this.updateChanges(questReceiver, [quest]);

        return quest;
    }

    turnInQuest(
        quest: Quest,
        answer: Info
    ): boolean {
        const isAnswer = quest.task.isAnswer(answer);

        if (isAnswer) {
            quest.turnInQuest("Succeed");
        }
        else {
            quest.turnInQuest("Failed");
        }

        return isAnswer;
    }
}
