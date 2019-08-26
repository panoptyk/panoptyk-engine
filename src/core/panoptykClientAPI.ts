import * as io from "socket.io-client";
import { ValidationResult } from "./models/validate";

const socket = io.connect();

const emit = function(event: string, payload: any): Promise<ValidationResult> {
  return new Promise((resolve, reject) => {
    socket.emit(event, payload, (result: ValidationResult) => {
      resolve(result);
    });
  });
};

export class ClientAPI {
  public static actionSent = false;

  private static async sendWrapper(event: string, payload: any) {
    if (ClientAPI.actionSent) {
      throw "Please wait for action to complete!";
    }
    ClientAPI.actionSent = true;
    const res = await emit(event, payload);
    ClientAPI.actionSent = false;
    if (res.status) {
        return res;
    }
    else {
        throw res;
    }
  }

  public static async login(name: string, password: string) {
    return await ClientAPI.sendWrapper("login", { username: name, password });
  }
}
