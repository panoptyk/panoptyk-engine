import { Agent } from "../models/agent";
import { Validate, ValidationResult } from "./validate";

export type enactFunction = (agent: Agent, inputData: any) => void;
export type validateFunction = (agent: Agent, socket, inputData: any) => ValidationResult;

export interface Action {
  name: string;
  requiredFactionType?: Set<string>;
  formats: object[];
  enact: enactFunction;
  validate: validateFunction;
}

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
