import {
    Agent,
    Item,
    Info,
    ValidationResult,
    ValidationSuccess,
    ValidationError,
    Trade,
    TradeStatus
} from "@panoptyk/core";
import { TradeController } from "..";

export function validTrade(trade: Trade, agent: Agent, status?: boolean): ValidationResult {
    if (trade === undefined) {
        return {
            success: false,
            errorCode: ValidationError.UndefinedInputs,
            message: `Undefined input trade`
        };
    }

    if (trade.tradeStatus !== TradeStatus.IN_PROGRESS) {
        return {
            success: false,
            errorCode: ValidationError.InvalidTrade,
            message: `Invalid trade: trade not in progress`
        };
    }

    // if all agents are ready and all have nothing to offer
    let nothingToOffer = true;
    let statusMap = trade.status;
    statusMap.set(agent.id, status);

    if (
        status && 
        Array.from(statusMap.values()).reduce((a, b) => a && b)
    ) {
        trade.agents.forEach(agent => {
            if (
                TradeController.getAgentItemsOffered(agent, trade).length > 0 ||
                TradeController.getAgentGoldOffered(agent, trade) !== 0 ||
                TradeController.getAnswers(agent, trade).length > 0
            ) {
                nothingToOffer = false;
            }
        });

        if (nothingToOffer) {
            return {
                success: false,
                errorCode: ValidationError.InvalidTrade,
                message: `Invalid trade: all agents have nothing to offer`
            };
        }
    }

    return ValidationSuccess;
}

export function isAnswerToQuestion(
    answer: Info, 
    question: Info
): ValidationResult {
    if (!question.isAnswer(answer)) {
        return {
            success: false,
            errorCode: ValidationError.TradeAnswerIncorrect,
            message: `Trade answer is incorrect`
        };
    }
    
    return ValidationSuccess;
}