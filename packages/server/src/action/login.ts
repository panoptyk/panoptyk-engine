import { Util, Agent } from "@panoptyk/core";
import { Action } from "./action";
import * as Validate from "../validate";
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
    const res = Validate.loginUsername(inputData.username);
    return res;
  }
};
