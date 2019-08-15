import { Action } from "./action";
import { Agent } from "../agent";
import { Validate } from "../validate";

export const ActionReadyTrade: Action = {
  name: "ready-trade",
  formats: [
    {
      data1: "number"
    }
  ],
  enact: (agent: Agent, inputData: any) => {
    // TODO: fix event functionality
  },
  validate: (agent: Agent, socket: any, inputData: any) => {
    return Validate.successMsg;
  }
};
