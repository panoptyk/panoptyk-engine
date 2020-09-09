import { BaseController } from "./baseController";
import { Conversation, Agent, Room } from "../models";
import { ConversationManipulator, AgentManipulator, RoomManipulator } from "../manipulators";

export class ConversationController extends BaseController {

    addAgentToConversation(conversation: Conversation, agent: Agent): void {
        if (agent.conversation !== undefined) { // TODO: Replace undefined with conversation
            this.removeAgentFromConversation(agent.conversation, agent);
        }

        ConversationManipulator.addAgentToConversation(conversation, agent);
        AgentManipulator.joinConversation(agent, conversation);

        agent.conversationRequested.forEach(conversation => {
            AgentManipulator.removeRequestedCovnersation(agent, conversation);
        });
        agent.conversationRequesters.forEach(conversation => {
            AgentManipulator.removeRequestedCovnersation(agent, conversation);
        });

        conversation.room.occupants.forEach(occupant => {
            this.updateChanges(occupant, [ agent, conversation ]);
        });
    }

    removeAgentFromConversation(conversation: Conversation, agent: Agent): void {
        ConversationManipulator.removeAgentFromConversation(conversation, agent);
        AgentManipulator.leaveConversation(agent);

        agent.tradeRequested.forEach(trade => {
            AgentManipulator.removeRequestedTrade(agent, trade);
        });
        agent.tradeRequesters.forEach(trade => {
            AgentManipulator.removeRequestedTrade(agent, trade);
        });

        conversation.room.occupants.forEach(occupant => {
            this.updateChanges(occupant, [ agent, conversation ]);
        });
    }

    requestConversation(requester: Agent, requestee: Agent): void {
        AgentManipulator.requestConversation(requester, requestee);

        this.updateChanges(requester, [ requester ]);
        this.updateChanges(requestee, [ requestee ]);
    }

    createConversation(room: Room, agent1: Agent, agent2: Agent): Conversation {
        const conversation: Conversation = new Conversation(room);

        RoomManipulator.addConversation(room, conversation);

        this.addAgentToConversation(conversation, agent1);
        this.addAgentToConversation(conversation, agent2);

        // Give info - Conversation info

        room.occupants.forEach(occupant => {
            this.updateChanges(occupant, [ room ]);
        });

        return conversation;
    }

    rejectConversation(requester: Agent, requestee: Agent): void {
        AgentManipulator.removeRequestedCovnersation(requester, requestee);

        this.updateChanges(requester, [ requester ]);
        this.updateChanges(requestee, [ requestee ]);
    }
}