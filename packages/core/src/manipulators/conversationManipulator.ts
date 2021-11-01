import { Conversation, Agent, Info } from "../models";

export class ConversationManipulator {
    static addAgentToConversation(conversation: Conversation, agent: Agent) {
        conversation._participants.add(agent.id);
    }

    static removeAgentFromConversation(
        conversation: Conversation,
        agent: Agent
    ) {
        conversation._participants.delete(agent.id);
    }

    static addInfoToConversation(
        conversation: Conversation, 
        info: Info
    ) {
        conversation._infos.add(info.id);
    }

    static removeInfoFromConversation(
        conversation: Conversation, 
        info: Info
    ) {
        conversation._infos.delete(info.id);
    }
}
