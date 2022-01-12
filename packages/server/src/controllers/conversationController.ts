import { BaseController } from "./baseController";
import {
    Conversation,
    Agent,
    Room,
    ConversationManipulator,
    AgentManipulator,
    RoomManipulator,
    Actions,
    Info,
    Quest,
} from "@panoptyk/core";

export class ConversationController extends BaseController {
    requestConversation(requester: Agent, requestee: Agent): void {
        AgentManipulator.requestConversation(requester, requestee);

        this.updateChanges(requester, [requester]);
        this.updateChanges(requestee, [requestee]);
    }

    rejectConversation(requester: Agent, requestee: Agent): void {
        AgentManipulator.removeRequestedConversation(requester, requestee);

        this.updateChanges(requester, [requester]);
        this.updateChanges(requestee, [requestee]);
    }

    createConversation(room: Room, agent1: Agent, agent2: Agent): Conversation {
        const conversation: Conversation = new Conversation(room);

        RoomManipulator.addConversation(room, conversation);

        this.addAgentToConversation(conversation, agent1);
        this.addAgentToConversation(conversation, agent2);

        room.occupants.forEach((occupant) => {
            this.updateChanges(occupant, [room, conversation]);
        });

        // Give info
        const info = Actions.conversed({
            time: Date.now(),
            agent: agent1,
            agentB: agent2,
            room,
        });
        this.giveInfoToAgents(info, [agent1, agent2]);
        this.disperseInfo(info, room);

        return conversation;
    }

    addAgentToConversation(conversation: Conversation, agent: Agent): void {
        if (agent.conversation && !agent.conversation.equals(conversation)) {
            this.removeAgentFromConversation(agent.conversation, agent);
        }

        ConversationManipulator.addAgentToConversation(conversation, agent);
        AgentManipulator.joinConversation(agent, conversation);

        agent.conversationsRequested.forEach((requestee) => {
            AgentManipulator.removeRequestedConversation(agent, requestee);
        });
        agent.conversationRequesters.forEach((requester) => {
            AgentManipulator.removeRequestedConversation(requester, agent);
        });

        if (conversation.participants.length >=2 && conversation.startTime === -1) {
            conversation._startTime = Date.now();
        }

        conversation.room.occupants.forEach((occupant) => {
            this.updateChanges(occupant, [agent, conversation]);
        });
    }

    removeAgentFromConversation(
        conversation: Conversation,
        agent: Agent
    ): void {
        ConversationManipulator.removeAgentFromConversation(
            conversation,
            agent
        );
        AgentManipulator.leaveConversation(agent);

        agent.tradesRequested.forEach((requestee) => {
            AgentManipulator.removeRequestedTrade(agent, requestee);
        });
        agent.tradeRequesters.forEach((requesters) => {
            AgentManipulator.removeRequestedTrade(requesters, agent);
        });

        if (conversation.participants.length < 2 && conversation.endTime === -1) {
            conversation._endTime = Date.now();
            conversation.participants.forEach(agent => {
                AgentManipulator.leaveConversation(agent);
                this.updateChanges(agent, [agent, conversation]);
            });
        }

        conversation.room.occupants.forEach((occupant) => {
            this.updateChanges(occupant, [agent, conversation]);
        });
    }

    tellInfoInConversation(
        conversation: Conversation,
        teller: Agent,
        infoToTell: Info,
        mask: string[] = []
    ): void {
        const agents: Agent[] = conversation.participants;

        for (let other of agents) {
            if (other !== teller) {
                let toldInfo = Actions.told({
                    time: Date.now(),
                    agent: teller,
                    agentB: other,
                    room: conversation.room,
                    info: infoToTell.getMasterCopy()
                });

                this.giveInfoToAgents(infoToTell, [other]);
                this.giveInfoToAgents(toldInfo, [teller, other]);

                ConversationManipulator.addInfoToConversationLog(
                    conversation,
                    toldInfo,
                );
                //    this.disperseInfo(knownInfo, agent.room);
            }

            this.updateChanges(other, [conversation])
        }
    }

    askQuestionInConversation(   
        conversation: Conversation,
        questioner: Agent,
        question: Info,
        mask: string[] = []
    ): void {
        const agents: Agent[] = conversation.participants;
        
        AgentManipulator.addQuestionAsked(questioner, question);
        this.updateChanges(questioner, [questioner]);

        for (let other of agents) {
            if (other !== questioner) {
                let askedQuestion = Actions.asked({
                    time: Date.now(),
                    agent: questioner,
                    agentB: other,
                    room: conversation.room,
                    info: question
                });

                this.giveInfoToAgents(question, [other]);
                this.giveInfoToAgents(askedQuestion, [questioner, other]);

                ConversationManipulator.addInfoToConversationLog(
                    conversation,
                    askedQuestion,
                );
                ConversationManipulator.addQuestionToAskedQuestions(
                    conversation,
                    askedQuestion,
                );
                
            }

            this.updateChanges(other, [conversation]);
        }
    }

    createQuestInConversation (
        conversation: Conversation,
        questGiver: Agent,
        questReceiver: Agent,
        task: Info,
        deadline: number
    ): Quest {
        const quest: Quest = new Quest(questGiver, questReceiver, task, "ACTIVE", deadline);
        const agents: Agent[] = conversation.participants;

        AgentManipulator.giveQuest(questGiver, quest);
        AgentManipulator.addQuest(questReceiver, quest);

        this.updateChanges(questGiver, [quest, questGiver]);
        this.updateChanges(questReceiver, [quest, questReceiver]);

        let questCreated = Actions.quest({
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

    turnInQuest(
        conversation: Conversation,
        quest: Quest,
        answer: Info,
        agent: Agent
    ): boolean {
        const isAnswer = quest.isQuestCompleted(answer);
        const agents: Agent[] = conversation.participants;

        if (isAnswer) {
            quest.turnInQuest("Succeed");
            AgentManipulator.turnInQuest(agent, quest);
        }
        else {
            quest.turnInQuest("Failed");
        }
        
        this.updateChanges(quest.giver, [quest, quest.giver]);
        this.updateChanges(quest.receiver, [quest, quest.receiver]);

        let questCreated = Actions.quest({
            time: Date.now(),
            agent: quest.giver,
            agentB: quest.receiver,
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

        return isAnswer;
    }
}
