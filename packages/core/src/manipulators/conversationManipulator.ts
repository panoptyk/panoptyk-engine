import { Conversation, Agent } from "../models";

export class ConversationManipulator {

    static addAgentToConversation(conversation: Conversation, agent: Agent) {
        conversation._participants.add(agent.id);
    }

    static removeAgentFromConversation(conversation: Conversation, agent: Agent) {
        conversation._participants.delete(agent.id);
    }

}