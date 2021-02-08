import {
  Agent,
  Recipe,
  ValidationResult,
  ValidationSuccess,
  ValidationError,
} from "@panoptyk/core";

export function hasResources(agent: Agent, recipe: Recipe): ValidationResult {
  if (agent === undefined || recipe === undefined) {
    return {
      success: false,
      errorCode: ValidationError.UndefinedInputs,
      message:
        "Undefined inputs:" +
        (agent === undefined ? " agent" : "") +
        (recipe === undefined ? " recipe" : ""),
    };
  }

  for (const resource of recipe.resourcesRequired.keys()) {
    if (!agent.resources.has(resource)) {
      return {
        success: false,
        errorCode: ValidationError.CraftingAgentMissingResource,
        message: "Missing Resource " + resource,
      };
    }
    const have = agent.resources.get(resource);
    const need = recipe.resourcesRequired.get(resource);
    if (have < need) {
      return {
        success: false,
        errorCode: ValidationError.CraftingAgentInsufficientResource,
        message:
          "Insufficient Resource " +
          resource +
          ". Have: " +
          have +
          " Need: " +
          need,
      };
    }
  }

  return ValidationSuccess;
}
