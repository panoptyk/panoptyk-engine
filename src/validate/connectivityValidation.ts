import { ValidationResult, ValidationSuccess } from "./validationResults";
import { ValidationError } from "./validationErrors";
import { Agent } from "../models";

/**
 * Validate that an agent is logged in.
 * TODO
 * @param {Object} agent - agent object.
 */
export function loggedIn(agent: Agent): ValidationResult {
  if (agent === undefined) {
    return {
      success: false,
      errorCode: ValidationError.UndefinedInputs,
      message: "Undefined Inputs: agent"
    };
  }

  return ValidationSuccess;
}

/**
 * Checks if a valid username was provided by the client trying to log in
 * @param username username provided by client trying to log in
 * @return {Object} {status: boolean, message: string}
 */
export function validate_login_username(username: string): ValidationResult {
  if (!username || username.length <= 0) {
    return {
      success: false,
      errorCode: ValidationError.Username,
      message: "Invalid username (" + username + ")"
    };
  }

  return ValidationSuccess;
}