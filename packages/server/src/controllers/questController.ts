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
        const quest: Quest = new Quest(questGiver, questReceiver, task, QuestStatus.ACTIVE, deadline);
        const converstaionParticipants: Agent[] = conversation.participants;

        AgentManipulator.giveQuest(questGiver, quest);
        AgentManipulator.addQuest(questReceiver, quest);

        this.updateChanges(questGiver, [quest, questGiver]);
        this.updateChanges(questReceiver, [quest, questReceiver]);

        let questGiven = Actions.questGiven({
            time: Date.now(),
            agent: questGiver,
            agentB: questReceiver,
            room: conversation.room,
            quest: quest
        });

        for (let agent of converstaionParticipants) {
            this.giveInfoToAgent(questGiven, agent);

            ConversationManipulator.addInfoToConversationLog(
                conversation,
                questGiven,
            );

            this.updateChanges(agent, [conversation]);
        }

        return quest;
    }

    turnInQuestInfo(
        conversation: Conversation,
        quest: Quest,
        answer: Info
    ): boolean {
        const isQuestCompleted = quest.question.isAnswer(answer);
        const conversationParticipants: Agent[] = conversation.participants;
        const questGiver = quest.giver;
        const questReceiver = quest.receiver;
        const room = conversation.room;

        let questResultInfo;
        
        if (isQuestCompleted) {
            quest.status = QuestStatus.COMPLETED;
            
            questResultInfo = Actions.questCompleted({
                time: Date.now(),
                agent: questGiver,
                agentB: questReceiver,
                room: room,
                quest: quest
            });

            // tell the answer back to the quest receiver
            const toldAnswerInfo = Actions.told({
                time: Date.now(),
                agent: questGiver,
                agentB: questReceiver,
                room: room,
                info: answer.getMasterCopy()
            });

            this.giveInfoToAgent(answer, questReceiver);
            this.giveInfoToAgents(toldAnswerInfo, [questGiver, questReceiver]);

            this.updateChanges(questGiver, [quest, questGiver]);
            this.updateChanges(questReceiver, [quest, questReceiver]);
        }
        
        for (let agent of conversationParticipants) {
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
