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
            this.updateChanges(occupant, [room]);
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
        if (!agent.conversation.equals(conversation)) {
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
                    room: teller.room,
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
}
