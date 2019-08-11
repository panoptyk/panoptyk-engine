import { PEvent } from "./pEvent";
import { logger } from "../../utilities/logger";
import { Validate } from "../validate";
import { Controller } from "../../controllers/controller";
import { Agent } from "../agent";

export class EventAcceptConversation extends PEvent {
  private static _eventName = "accept-conversation";
  public static get eventName() {
    return EventAcceptConversation._eventName;
  }
  private static _formats = [{
    "agent_id": "number"
  }];
  public static get formats() {
    return EventAcceptConversation._formats;
  }

  public conversation;
  public toAgent;
  public room;

  /**
   * Event model.
   * @param {Object} socket - socket.io client socket object.
   * @param {Object} inputData - raw input recieved.
   */
  constructor (socket, inputData) {
    super(socket, inputData);
    const res = EventAcceptConversation.validate(inputData, this.fromAgent);

    if (!(res).status) {
      logger.log("Bad event acceptConversation data (" + JSON.stringify(inputData) + ").", 1);
      // TODO server.send.event_failed(socket, EventAcceptConversation._eventName, res.message);
      return;
    }

    this.toAgent = res.conversation.agent_ini;
    this.room = this.fromAgent.room;  // TODO: change this when room validation is added
    this.conversation = Controller.createConversation(this.room, this.fromAgent, this.toAgent);

    (Validate.objects = Validate.objects || []).push(this);
    logger.log("Event accept-conversation (" + this.conversation.conversation_id + ") for agent " + this.fromAgent.agentName + "/" + this.toAgent.agentName + " registered.", 2);
  }

  /**
   * Event validation.
   * @param {Object} structure - raw input recieved.
   * @param {Object} agent - agent associated with this event.
   * @return {Object}
   */
  static validate(structure, agent) {
    let res;
    if (!(res = Validate.validate_agent_logged_in(agent)).status) {
      return res;
    }
    if (!(res = Validate.validate_key_format(EventAcceptConversation._formats, structure)).status) {
      return res;
    }
    const toAgent = Agent.getByID(structure.agent_id);
    if (!(res = Validate.validate_agent_logged_in(toAgent)).status) {
      return res;
    }
    // TODO: validate agents are not already in a conversation
    // TODO: validate agents are in same room
    return res;
  }
}

