import { PEvent } from "./pEvent";
import { logger } from "../../utilities/logger";
import { Validate } from "../validate";
import { control } from "../../../server/controllers/controller";
import { Agent } from "../agent";

export class EventAcceptTrade extends PEvent {
  private static _eventName = "accept-trade";
  public static get eventName() {
    return EventAcceptTrade._eventName;
  }
  private static _formats = [{
    "trade_id": "number"
  }];
  public static get formats() {
    return EventAcceptTrade._formats;
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
    if (!(res = EventAcceptTrade.validate(inputData, this.fromAgent)).status) {
      logger.log("Bad event acceptTrade data (" + JSON.stringify(inputData) + ").", 1);
      // TODO server.send.event_failed(socket, Event_acceptTrade_eventName, res.message);
      return;
    }

    this.conversation = res.conversation;
    this.toAgent = res.trade.agent_ini;
    this.trade = res.trade;

    control.accept_trade(this.trade);

    (Validate.objects = Validate.objects || []).push(this);
    logger.log("Event accept-trade (" + this.trade.trade_id + ") for agent " + this.fromAgent.agentName + "/" + this.toAgent.agentName + " registered.", 2);
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
    if (!(res = Validate.validate_key_format(EventAcceptTrade._formats, structure)).status) {
      return res;
    }
    if (!(res = Validate.validate_trade_exists(structure.trade_id)).status) {
      return res;
    }
    if (!(res = Validate.validate_trade_status(res.trade, [3])).status) {
      return res;
    }
    const res2 = res;
    if (!(res = Validate.validate_agent_logged_in(res.trade.agent_ini)).status) {
      return res;
    }

    return res2;
  }
}
