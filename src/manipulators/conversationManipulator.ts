import { Conversation, Agent } from "../models";

export class ConversationManipulator {

    static addAgentToConversation(conversation: Conversation, agent: Agent) {
        conversation._participants.add(agent.id);
        agent.conversation = conversation;
    }

    static removeAgentFromConversation(conversation: Conversation, agent: Agent) {
        conversation._participants.delete(agent.id);
        agent.conversation = undefined;
    }

    static requestConversation(requester: Agent, requestee: Agent) {
        requester._conversationRequested.add(requestee.id);
        requestee._conversationRequests.add(requester.id);
    }

    static rejectConversation(requester: Agent, requestee: Agent) {
        requester._conversationRequested.delete(requestee.id);
        requestee._conversationRequests.delete(requester.id);
    }

}