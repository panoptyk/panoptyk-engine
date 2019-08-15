import { Agent } from "../agent";
import { Validate, ValidationResult } from "../validate";

export abstract class PEvent {
  public time: Date;
  public fromAgent: Agent;
  constructor(socket, data) {
    this.time = new Date();
    this.fromAgent = Agent.getAgentBySocket(socket);
  }
}

export type enactFunction = (agent: Agent, inputData: any) => void;
export type validateFunction = (agent: Agent, socket, inputData: any) => ValidationResult;

export interface Action {
  name: string;
  formats: object[];
  enact: enactFunction;
  validate: validateFunction;
}

export const createAction = function(
  name: string,
  formats: object[],
  enactFunction: enactFunction,
  validateFunction: validateFunction
): Action {
  return {
    name,
    formats,
    enact: enactFunction,
    validate: validateFunction
  };
};

const ActionExample: Action = {
  name: "example-action",
  formats: [
    {
      data1: "number"
    }
  ],
  enact: (agent: Agent, inputData: any) => {},
  validate: (agent: Agent, socket: any, inputData: any) => {
    return Validate.successMsg;
  }
};
