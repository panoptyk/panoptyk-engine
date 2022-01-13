import {
    Conversation,
    Agent,
    ConversationManipulator,
    AgentManipulator,
    Actions,
    Info,
    Quest,
    QuestStatus
} from "@panoptyk/core";
import { BaseController } from "./baseController";

export class QuestController extends BaseController {
    createQuest (
        conversation: Conversation,
        questGiver: Agent,
        questReceiver: Agent,
        task: Info,
        deadline: number
    ): Quest {
        const quest: Quest = new Quest(questGiver, questReceiver, task, QuestStatus.Given, deadline);
        const agents: Agent[] = conversation.participants;

        AgentManipulator.giveQuest(questGiver, quest);
        AgentManipulator.addQuest(questReceiver, quest);

        this.updateChanges(questGiver, [quest, questGiver]);
        this.updateChanges(questReceiver, [quest, questReceiver]);

        let questCreated = Actions.questGiven({
            time: Date.now(),
            agent: questGiver,
            agentB: questReceiver,
            room: conversation.room,
            quest: quest
        });

        for (let agent of agents) {
            this.giveInfoToAgent(questCreated, agent);

            ConversationManipulator.addInfoToConversationLog(
                conversation,
                questCreated,
            );

            this.updateChanges(agent, [conversation]);
        }

        return quest;
    }

    turnInQuestInfo(
        conversation: Conversation,
        quest: Quest,
        answer: Info,
        agent: Agent
    ): boolean {
        const isQuestCompleted = quest.verifyQuestInfoTurnedIn(answer);
        const agents: Agent[] = conversation.participants;
        const questGiver = quest.giver;
        const questReceiver = quest.receiver;

        let questResultInfo;
        
        if (isQuestCompleted) {
            questResultInfo = Actions.questCompleted({
                time: Date.now(),
                agent: questGiver,
                agentB: questReceiver,
                room: conversation.room,
                quest: quest
            });
            quest.status = QuestStatus.Completed;
        }
        else {
            questResultInfo = Actions.questFailed({
                time: Date.now(),
                agent: questGiver,
                agentB: questReceiver,
                room: agent.conversation.room,
                quest: quest
            });
            quest.status = QuestStatus.Failed;
        }
        
        this.updateChanges(questGiver, [quest, questGiver]);
        this.updateChanges(questReceiver, [quest, questReceiver]);

        for (let agent of agents) {
            this.giveInfoToAgent(questResultInfo, agent);

            ConversationManipulator.addInfoToConversationLog(
                conversation,
                questResultInfo,
            );

            this.updateChanges(agent, [conversation]);
        }

        return isQuestCompleted;
    }
}
