import { PEvent } from "./pEvent";
import { logger } from "../../utilities/logger";
import { Validate } from "../validate";
import { Controller } from "../../controllers/controller";
import { Agent } from "../agent";

export class EventRequestTrade extends PEvent {
  private static _eventName = "request-trade";
  public static get eventName() {
    return EventRequestTrade._eventName;
  }
  private static _formats =  [{
    "agent_id": "number"
  }];
  public static get formats() {
    return EventRequestTrade._formats;
  }

  public conversation;
  public toAgent;
  public trade;

  /**
   * Event model.
   * @param {Object} socket - socket.io client socket object.
   * @param {Object} inputData - raw input recieved.
   */
  constructor(socket, inputData) {
    super(socket, inputData);
    let res;

    if (!(res = EventRequestTrade.validate(inputData, this.fromAgent)).status) {
      logger.log("Bad event requestTrade data (" + JSON.stringify(inputData) + ").", 1);
      // TODO server.send.event_failed(socket, EventRequestTrade._eventName, res.message);
      return;
    }

    this.conversation = res.conversation;
    this.toAgent = res.toAgent;

    this.trade = Controller.createTrade(this.conversation, this.fromAgent, this.toAgent);

    (Validate.objects = Validate.objects || []).push(this);
    logger.log("Event request-trade (" + this.conversation.conversation_id + ") for agent " + this.fromAgent.agentName + " registered.", 2);
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
    if (!(res = Validate.validate_key_format(EventRequestTrade._formats, structure)).status) {
      return res;
    }
    const toAgent = Agent.getByID(structure.agent_id);
    if (!(res = Validate.validate_agent_logged_in(toAgent)).status) {
      return res;
    }
    if (!(res = Validate.validate_agents_share_conversation(agent, toAgent)).status) {
      return res;
    }
    return res;
  }
}
