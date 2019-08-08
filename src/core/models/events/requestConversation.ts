import { PEvent } from "./pEvent";
import { logger } from "../../utilities/logger";
import { Validate } from "../validate";
import { control } from "../../../server/controllers/controller";
import { Agent } from "../agent";

export class EventRequestConversation extends PEvent {
  private static _eventName = "request-conversation";
  public static get eventName() {
    return EventRequestConversation._eventName;
  }
  private static _formats =  [{
    "agent_id": "number"
  }];
  public static get formats() {
    return EventRequestConversation._formats;
  }

  public toAgent: Agent;

  /**
   * Event model.
   * @param {Object} socket - socket.io client socket object.
   * @param {Object} inputData - raw input recieved.
   */
  constructor(socket, inputData) {
    super(socket, inputData);
    let res;
    if (!(res = EventRequestConversation.validate(inputData, this.fromAgent)).status) {
      logger.log("Bad event requestConversation data (" + JSON.stringify(inputData) + ").", 1);
      // TODO server.send.event_failed(socket, EventRequestConversation._eventName, res.message);
      return;
    }

    this.toAgent = Agent.getByID(inputData.agent_id);

    control.request_conversation(this.fromAgent, this.toAgent);

    (Validate.objects = Validate.objects || []).push(this);
    logger.log("Event request-conversation from (" + this.fromAgent.agentName + ") to agent " + this.toAgent.agentName + " registered.", 2);
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
    if (!(res = Validate.validate_key_format(EventRequestConversation._formats, structure)).status) {
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