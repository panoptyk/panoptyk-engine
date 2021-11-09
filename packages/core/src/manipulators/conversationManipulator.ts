import { Conversation, Agent, Info } from "../models";

export class ConversationManipulator {
    static addAgentToConversation(conversation: Conversation, agent: Agent) {
        conversation._participants.add(agent.id);
        if (conversation.participants.length >= 2 && !conversation.startTime) {
            conversation._startTime = new Date();
        }
    }

    static removeAgentFromConversation(
        conversation: Conversation,
        agent: Agent
    ) {
        conversation._participants.delete(agent.id);
        if (conversation.participants.length < 2 && !conversation.endTime) {
            conversation._endTime = new Date();
        }
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
