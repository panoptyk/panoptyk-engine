import { ValidationResult, ValidationSuccess } from "./validationResults";
import { ValidationError } from "./validationErrors";
import { Item, Room } from "../models";

/**
 * Make sure an item is not locked.
 * @param {[Object]} items - items to check.
 */
export function notInTransaction(items: Item[]): ValidationResult {
  if (items === undefined) {
    return {
      success: false,
      errorCode: ValidationError.UndefinedInputs,
      message: "Undefined Inputs: items"
    };
  }

  for (const item of items) {
    if (item === undefined) {
      return {
        success: false,
        errorCode: ValidationError.UndefinedInputs,
        message: "Item list contains undefined elements"
      };
    }

    if (item.inTransaction) {
      return {
        success: false,
        errorCode: ValidationError.ItemInTransaction,
        message: "Item (" + item + ") is currently in transaction"
      };
    }
  }

  return ValidationSuccess;
}

export function inRoom(items: Item[], room: Room): ValidationResult {
  if (items === undefined) {
    return {
      success: false,
      errorCode: ValidationError.UndefinedInputs,
      message: "Undefined Inputs: items"
    };
  }

  for (const item of items) {
    if (item === undefined) {
      return {
        success: false,
        errorCode: ValidationError.UndefinedInputs,
        message: "Item list contains undefined elements"
      };
    }

    if (!item.room.equals(room)) {
      return {
        success: false,
        errorCode: ValidationError.ItemNotInRoom,
        message: "Item (" + item + ") is not in Room: (" + room + ")"
      };
    }
  }

  return ValidationSuccess;
}