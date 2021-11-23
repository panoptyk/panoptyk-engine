import {
    Conversation,
    Room,
    Agent,
    ValidationResult,
    ValidationSuccess,
    ValidationError,
    Info,
} from "@panoptyk/core";

/**
 * Check if a conversation is in given room.
 * @param {int} room - room id to see if conversation is in.
 * @param {Object} conversation - conversation object.
 * @returns {Object} {status: boolean, message: string, conversation: Object}
 */
export function conversationInAgentsRoom(
    conversation: Conversation,
    room: Room
): ValidationResult {
    if (room === undefined || conversation === undefined) {
        return {
            success: false,
            errorCode: ValidationError.UndefinedInputs,
            message:
                "Undefined Inputs:" +
                (conversation === undefined ? " conversation" : "") +
                (room === undefined ? " room" : ""),
        };
    }

    if (conversation.room !== room) {
        return {
            success: false,
            errorCode: ValidationError.ConversationInDifferentRoom,
            message:
                "Conversation (" +
                conversation +
                ") not in agent's room (" +
                room +
                ")",
        };
    }

    return ValidationSuccess;
}

/**
 * Check if a conversation has space for another agent.
 * @param {Object} conversation - conversation object.
 * @returns {Object} {status: boolean, message: string, conversation: Object}
 */
export function conversationHasSpace(
    conversation: Conversation
): ValidationResult {
    if (conversation === undefined) {
        return {
            success: false,
            errorCode: ValidationError.UndefinedInputs,
            message: "Undfined Inputs: conversation",
        };
    }

    if (conversation.isFull()) {
        return {
            success: false,
            errorCode: ValidationError.ConversationFull,
            message: "Conversation (" + conversation + ") is full",
        };
    }

    return ValidationSuccess;
}

/**
 * Check if an agent is in a conversation.
 * @param {Object} conversation - conversation object.
 * @param {Object} agent - agent object.
 * @returns {Object} {status: boolean, message: string, conversation: Object}
 */
export function hasAgent(
    conversation: Conversation,
    agent: Agent
): ValidationResult {
    if (conversation === undefined || agent === undefined) {
        return {
            success: false,
            errorCode: ValidationError.UndefinedInputs,
            message:
                "Undefined Inputs:" +
                (conversation === undefined ? " conversation" : "") +
                (agent === undefined ? " agent" : ""),
        };
    }

    if (conversation.containsAgent(agent) === undefined) {
        return {
            success: false,
            errorCode: ValidationError.ConversationMissingAgent,
            message:
                "Conversation (" +
                conversation +
                ") does not include agent(" +
                agent +
                ").",
        };
    }

    return ValidationSuccess;
}

export function invalidConversation(
    conversation: Conversation
): ValidationResult {
    if (conversation === undefined) {
        return {
            success: false,
            errorCode: ValidationError.UndefinedInputs,
            message: "Undefined Inputs: conversation",
        };
    }

    if (conversation.participants.length < 2) {
        return {
            success: false,
            errorCode: ValidationError.InvalidConversation,
            message: "Invalid Conversation",
        };
    }

    return ValidationSuccess;
}

export function invalidQuestion(
    question: Info
): ValidationResult {
    if (!question.isQuery) {
        return {
            success: false,
            errorCode: ValidationError.InvalidQuestion,
            message: "Invalid question",
        };
    }

    return ValidationSuccess;
}