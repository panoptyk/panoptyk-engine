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

    static addInfoToConversationLog(
        conversation: Conversation, 
        info: Info
    ) {
        conversation._log.add(info.id);
    }

    static removeInfoFromConversationLog(
        conversation: Conversation, 
        info: Info
    ) {
        conversation._log.delete(info.id);
    }
}
