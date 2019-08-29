import { Action } from "./action";
import { logger } from "../../utilities/logger";
import { Validate } from "../validate";
import { Agent } from "../agent";
import { Controller } from "../../controllers/controller";

export const ActionLogin: Action = {
  name: "login",
  formats: [
    {
      username: "string",
      password: "string"
    },
    {
      username: "string",
      token: "string"
    }
  ],
  enact: (agent: Agent, inputData: any) => {
    const newAgent = Agent.login(inputData.username, inputData.socket);
    const controller = new Controller();
    controller.buildUpdate(newAgent);
    logger.log(
      "Event login for agent " + newAgent + " registered.",
      2
    );
    controller.sendUpdates();
  },
  validate: (agent: Agent, socket: any, inputData: any) => {
    inputData.socket = socket;
    return Validate.successMsg;
  }
};
