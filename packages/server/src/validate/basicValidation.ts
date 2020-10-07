import { ValidationResult, ValidationSuccess, ValidationError } from "@panoptyk/core";

/**
 * Validate a given dictionary has same keys as one of the provided ones.
 * @param {[Object]} goodFormats - given formats to match to.
 * @param {Object} inputFormat - dictionary being inspected.
 */
export function keyFormat(goodFormats, inputFormat): ValidationResult {
  if (goodFormats === undefined || inputFormat === undefined) {
    return {
      success: false,
      errorCode: ValidationError.UndefinedInputs,
      message: "Undefined inputs:" + (goodFormats === undefined ? " goodFormats" : "") + (inputFormat === undefined ? " inputFormat" : "")
    };
  }
  formatLoop: for (const format of goodFormats) {
    if (Object.keys(format).length !== Object.keys(inputFormat).length) {
      break formatLoop;
    }

    for (const eventName in inputFormat) {
      if (!(eventName in format)) {
        break formatLoop;
      }
    }

    for (const eventName in format) {
      if (
        !(
          eventName in inputFormat &&
          typeof inputFormat[eventName] === format[eventName]
        )
      ) {
        break formatLoop;
      }
    }

    return ValidationSuccess;
  }

  return {
    success: false,
    errorCode: ValidationError.Keys,
    message: "Invalid or missing key"
  };
}

/**
 * Validate a list contains all of one type.
 * @param {Object} arr - list
 * @param {string} atype - type
 * @return {Object} {status: boolean, message: string}
 */
export function arrayTypes(arr: any[], atype: string): ValidationResult {
  for (const item of arr) {
    if (typeof item !== atype) {
      return {
        success: false,
        errorCode: ValidationError.Types,
        message: "Invalid type in array (" + typeof item + ")"
      };
    }
  }

  return ValidationSuccess;
}

/**
 * Validation for events that require a minimum number of an object
 * @param descriptor
 * @param amount
 * @param threshold
 */
export function amountGreaterThan(descriptor: string, amount: number, threshold: number): ValidationResult {
  if (!(amount > threshold)) {
    return {
      success: false,
      errorCode: ValidationError.NotEnough,
      message: "Minimum of " + threshold + " (have " + amount + ")" + descriptor + " required for action!"
    };
  }
  return ValidationSuccess;
}