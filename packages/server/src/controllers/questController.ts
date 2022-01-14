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
import { ConversationController } from "./conversationController";
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

        AgentManipulator.addGivenQuest(questGiver, quest);
        AgentManipulator.addAssignedQuest(questReceiver, quest);

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
    ): void{
        const conversationParticipants: Agent[] = conversation.participants;
        const questGiver = quest.giver;
        const questReceiver = quest.receiver;
        const room = conversation.room;
        const cc: ConversationController = new ConversationController();
        const questResultInfo = Actions.questCompleted({
            time: Date.now(),
            agent: questGiver,
            agentB: questReceiver,
            room: room,
            quest: quest
        });
        
        quest._status = QuestStatus.COMPLETED;

        // tell the answer back to the quest receiver
        cc.tellInfoInConversation(conversation, questGiver, answer);

        AgentManipulator.removeAssignedQuest(questReceiver, quest);

        this.updateChanges(questGiver, [quest, questGiver]);
        this.updateChanges(questReceiver, [quest, questReceiver]);
    
        for (let agent of conversationParticipants) {
            this.giveInfoToAgent(questResultInfo, agent);

            ConversationManipulator.addInfoToConversationLog(
                conversation,
                questResultInfo,
            );

            this.updateChanges(agent, [conversation]);
        }
    }
}
