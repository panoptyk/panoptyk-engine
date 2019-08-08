import { PEvent } from "./pEvent";
import { logger } from "../../utilities/logger";
import { Validate } from "../validate";
import { Agent } from "../agent";

export class eventLogin extends PEvent {
  private static _eventName = "login";
  public static get eventName() {
    return eventLogin._eventName;
  }
  private static _formats =  [{
    "username": "string",
    "password": "string"
  },
  {
    "username": "string",
    "token": "string"
  }];
  public static get formats() {
    return eventLogin._formats;
  }

  /**
   * Event model.
   * @param {Object} socket - socket.io client socket object.
   * @param {Object} inputData - raw input recieved.
   */
  constructor(socket, inputData) {
    super(socket, inputData);
    let res;

    if (!(res = eventLogin.validate(inputData)).status) {
      logger.log("Bad event login data.", 1);
      // TODO server.send.event_failed(socket, Event_login_.eventName, res.message);
      return;
    }

    this.fromAgent = Agent.login(inputData.username, socket);

    (Validate.objects = Validate.objects || []).push(this);
    logger.log("Event login for agent " + this.fromAgent.agentName + " registered.", 2);
  }

  /**
   * Event validation.
   * @param {Object} structure - raw input recieved.
   * @return {Object}
   */
  static validate(structure) {
    let res;
    if (!(res = Validate.validate_key_format(eventLogin._formats, structure)).status) {
      return res;
    }
    return res;
  }
}
