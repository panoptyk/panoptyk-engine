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

    if (!quest.question.isAnswer(answer)) {
        return {
            success: false,
            errorCode: ValidationError.QuestAnswerIncorrect,
            message: `Answer to the quest question is incorrect`
        };
    }
    return ValidationSuccess;
}