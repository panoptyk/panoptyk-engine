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
    const isNew = Agent.getAgentByName(inputData.username) ? false : true;
    const newAgent = Agent.login(inputData.username, inputData.socket);
    const controller = new Controller();
    controller.login(newAgent, isNew);
    logger.log(
      "Event login for agent " + newAgent + " registered.",
      2
    );
    controller.sendUpdates();
  },
  validate: (agent: Agent, socket: any, inputData: any) => {
    inputData.socket = socket;
    let res;
    if (!(res = Validate.validate_login_username(inputData.username)).status) {
      return res;
    }
    if (!(res = Validate.validate_can_login(inputData.username)).status) {
      return res;
    }
    return res;
  }
};
