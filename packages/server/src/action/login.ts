import { Action } from "./action";
import { logger } from "../utilities/logger";
import * as Validate from "../validate";
import { Models.Agent } from "../models/agent";
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
  enact: (agent: Models.Agent, inputData: any) => {
    const cc: ConnectionController = new ConnectionController();
    cc.login(inputData.username, inputData.socket);
    cc.sendUpdates();
  },
  validate: (agent: Models.Agent, socket: any, inputData: any) => {
    inputData.socket = socket;
    const res = Validate.loginUsername(inputData.username);
    return res;
  }
};
