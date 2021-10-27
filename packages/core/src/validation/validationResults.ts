import { ValidationError } from "./validationErrors";

export interface ValidationResult {
    message: string;
    errorCode: ValidationError;
    success: boolean;
}

export const ValidationSuccess: ValidationResult = {
    success: true,
    errorCode: ValidationError.None,
    message: "",
};
