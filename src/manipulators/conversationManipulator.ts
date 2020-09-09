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

}