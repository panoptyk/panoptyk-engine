import { 
    Quest,
    Info,
    ValidationResult,
    ValidationSuccess,
    ValidationError,
} from "@panoptyk/core";

export function isAnswerToTheQuestQuestion(
    quest: Quest, answer: Info
): ValidationResult {
    if (quest === undefined || answer === undefined) {
        return {
            success: false,
            errorCode: ValidationError.UndefinedInputs,
            message: `Undefined inputs: 
            ${quest === undefined ? " quest" : ""}
            ${answer === undefined ? " answer" : ""}`
        };
    }

    if (quest.task.isQuery() && !quest.task.isAnswer(answer)) {
        return {
            success: false,
            errorCode: ValidationError.QuestAnswerIncorrect,
            message: `Answer to the quest question is incorrect`
        };
    }

    if (quest.task.isCommand() && !quest.task.isExecuted(answer)) {
        return {
            success: false,
            errorCode: ValidationError.QuestAnswerIncorrect,
            message: `Result to the quest command is undesirable`
        }
    }

    return ValidationSuccess;
}