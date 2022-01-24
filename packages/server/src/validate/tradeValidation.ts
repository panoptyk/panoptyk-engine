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

export function validTrade(trade: Trade): ValidationResult {
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
            message: `Invalid trade`
        };
    }

    return ValidationSuccess;
}