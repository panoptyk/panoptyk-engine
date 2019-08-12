import { PEvent } from "./pEvent";
import { logger } from "../../utilities/logger";
import { Validate } from "../validate";
import { Controller } from "../../controllers/controller";
import { Conversation } from "../conversation";

export class EventLeaveConversation extends PEvent {
  private static _eventName = "leave-conversation";
  public static get eventName() {
    return EventLeaveConversation._eventName;
  }
  private static _formats =  [{
    "conversation_id": "number"
  }];
  public static get formats() {
    return EventLeaveConversation._formats;
  }

  public conversation;

  /**
   * Event model.
   * @param {Object} socket - socket.io client socket object.
   * @param {Object} inputData - raw input recieved.
   */
  constructor(socket, inputData) {
    super(socket, inputData);
    let res;

    if (!(res = EventLeaveConversation.validate(inputData, this.fromAgent)).status) {
      logger.log("Bad event leaveConversation data (" + JSON.stringify(inputData) + ").", 1);
      // TODO server.send.event_failed(socket, EventLeaveConversation._eventName, res.message);
      return;
    }

    this.conversation = res.conversation;

    Controller.removeAgentFromConversation(this.conversation, this.fromAgent);

    // (Validate.objects = Validate.objects || []).push(this);
    logger.log("Event leave-conversation (" + this.conversation.conversation_id + ") for agent " + this.fromAgent.agentName + " registered.", 2);
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
    if (!(res = Validate.validate_key_format(EventLeaveConversation._formats, structure)).status) {
      return res;
    }
    if (!(res = Validate.validate_conversation_exists(agent.room, Conversation.getByID(structure.conversation_id))).status) {
      return res;
    }
    if (!(res = Validate.validate_conversation_has_agent(res.conversation, agent)).status) {
      return res;
    }
    return res;
  }
}
