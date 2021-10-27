import {
    Agent,
    Item,
    ValidationResult,
    ValidationSuccess,
    ValidationError,
} from "@panoptyk/core";

/**
 * Validate agent owns list of items.
 */
export function ownsItems(agent: Agent, items: Item[]): ValidationResult {
    if (items === undefined || agent === undefined) {
        return {
            success: false,
            errorCode: ValidationError.UndefinedInputs,
            message:
                "Undefined inputs:" +
                (agent === undefined ? " agent" : "") +
                (items === undefined ? " items" : ""),
        };
    }

    for (const item of items) {
        if (item === undefined) {
            return {
                success: false,
                errorCode: ValidationError.UndefinedInputs,
                message: "Item list contains undefined elements",
            };
        }
        if (item.agent !== agent) {
            return {
                success: false,
                errorCode: ValidationError.AgentOwnership,
                message:
                    "Agent (" + agent + ") does not have item (" + item + ")",
            };
        }
    }

    return ValidationSuccess;
}

/**
 * Check if two agents are in the same conversation.
 */
export function shareConversation(agents: Agent[]): ValidationResult {
    if (agents === undefined) {
        return {
            success: false,
            errorCode: ValidationError.UndefinedInputs,
            message: "Undefined Inputs: agents",
        };
    }

    if (agents.length > 0) {
        const conversation = agents[0].conversation;
        for (const agent of agents) {
            if (agent === undefined) {
                return {
                    success: false,
                    errorCode: ValidationError.UndefinedInputs,
                    message: "Agent list contains undefined elements",
                };
            }

            if (agent.conversation !== conversation) {
                return {
                    success: false,
                    errorCode: ValidationError.AgentConversationNotShared,
                    message: "Agents are not all in the same conversation",
                };
            }
        }
    }

    return ValidationSuccess;
}

/**
 * Checks if agents are in the same room
 */
export function sameRoom(agents: Agent[]): ValidationResult {
    if (agents === undefined) {
        return {
            success: false,
            errorCode: ValidationError.UndefinedInputs,
            message: "UndefinedInputs: agents",
        };
    }

    if (agents.length > 0) {
        const room = agents[0].room;
        for (const agent of agents) {
            if (agent === undefined) {
                return {
                    success: false,
                    errorCode: ValidationError.UndefinedInputs,
                    message: "Agent list contains undefined elements",
                };
            }

            if (agent.room !== room) {
                return {
                    success: false,
                    errorCode: ValidationError.AgentRoomNotShared,
                    message: "Agents are not all in the same room",
                };
            }
        }
    }

    return ValidationSuccess;
}

/**
 * Checks if agents are already in conversations
 * @param {[Agent]} agents
 */
export function notInConversation(agents: Agent[]): ValidationResult {
    if (agents === undefined) {
        return {
            success: false,
            errorCode: ValidationError.UndefinedInputs,
            message: "Undefined Inputs: agents",
        };
    }

    for (const agent of agents) {
        if (agent === undefined) {
            return {
                success: false,
                errorCode: ValidationError.UndefinedInputs,
                message: "Agent list contains undefined elements",
            };
        }

        if (agent.conversation !== undefined) {
            return {
                success: false,
                errorCode: ValidationError.AgentAlreadyInCovnersation,
                message: "Agent (" + agent + ") is already in a conversation",
            };
        }
    }
    return ValidationSuccess;
}

/**
 * Prevents stupid requests
 * @param agent1
 * @param agent2
 */
export function differentAgents(
    agent1: Agent,
    agent2: Agent
): ValidationResult {
    if (agent1 === undefined || agent2 === undefined) {
        return {
            success: false,
            errorCode: ValidationError.UndefinedInputs,
            message:
                "Undefined Inputs:" +
                (agent1 === undefined ? " agent1" : "") +
                (agent2 === undefined ? " agent2" : ""),
        };
    }

    if (agent1.equals(agent2)) {
        return {
            success: false,
            errorCode: ValidationError.AgentIdentical,
            message: "Agents are identical",
        };
    }

    return ValidationSuccess;
}

/**
 * Makes sure agent has enough gold
 * @param agent
 * @param gold
 */
export function hasEnoughGold(agent: Agent, gold: number): ValidationResult {
    if (agent === undefined) {
        return {
            success: false,
            errorCode: ValidationError.UndefinedInputs,
            message: "Undefined Inputs: agent",
        };
    }

    if (gold > 0 && agent.gold < gold) {
        return {
            success: false,
            errorCode: ValidationError.AgentLackingGold,
            message: "You do not have enough gold!",
        };
    }
    return ValidationSuccess;
}
