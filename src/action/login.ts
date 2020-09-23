import { Action } from "./action";
import { logger } from "../utilities/logger";
import { Validate } from "./validate";
import { Agent } from "../models/agent";
import { ConnectionController } from "../controllers";

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
    const cc: ConnectionController = new ConnectionController();
    cc.login(inputData.username, inputData.socket);
    cc.sendUpdates();
  },
  validate: (agent: Agent, socket: any, inputData: any) => {
    inputData.socket = socket;
    const res = Validate.validate_login_username(inputData.username);
    return res;
  }
};
