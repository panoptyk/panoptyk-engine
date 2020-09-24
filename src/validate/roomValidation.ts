import { ValidationResult, ValidationSuccess } from "./validationResults";
import { ValidationError } from "./validationErrors";
import { Room } from "../models";

/**
 * Validate one room is adjacent to another.
 * @param {Object} oldRoom - starting room.
 * @param {Object} newRoom - target room.
 */
export function roomAdjacent(oldRoom: Room, newRoom: Room): ValidationResult {
  if (oldRoom === undefined || newRoom === undefined) {
    return {
      success: false,
      errorCode: ValidationError.UndefinedInputs,
      message: "Undefined Inputs:" + (oldRoom === undefined ? " oldRoom" : "") + (newRoom === undefined ? " newRoom" : "")
    };
  }

  if (!oldRoom.isConnectedTo(newRoom)) {
    return {
      success: false,
      errorCode: ValidationError.RoomMovement,
      message: "Invalid room movement"
    };
  }

  return ValidationSuccess;
}

export function roomHasSpace(room: Room): ValidationResult {
  if (room === undefined) {
    return {
      success: false,
      errorCode: ValidationError.UndefinedInputs,
      message: "Undefined Inputs: room"
    };
  }

  if (room.isFull()) {
    return {
      success: false,
      errorCode: ValidationError.RoomFull,
      message: "Room (" + room + ") is full"
    };
  }

  return ValidationSuccess;
}
