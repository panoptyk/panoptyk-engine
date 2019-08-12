import { PEvent } from "./pEvent";
import { logger } from "../../utilities/logger";
import { Validate } from "../validate";
import { Controller } from "../../controllers/controller";

export class EventCancelTrade extends PEvent {
  private static _eventName = "cancel-trade";
  public static get eventName() {
    return EventCancelTrade._eventName;
  }
  private static _formats =  [{
    "trade_id": "number"
  }];
  public static get formats() {
    return EventCancelTrade._formats;
  }

  public trade;

  /**
   * Event model.
   * @param {Object} socket - socket.io client socket object.
   * @param {Object} inputData - raw input recieved.
   */
  constructor(socket, inputData) {
    super(socket, inputData);
    let res;
    if (!(res = EventCancelTrade.validate(inputData, this.fromAgent)).status) {
      logger.log("Bad event cancelTrade data (" + JSON.stringify(inputData) + ").", 1);
      // TODO server.send.event_failed(socket, Event_cancelTrade_eventName, res.message);
      return;
    }

    this.trade = res.trade;

    Controller.cancelTrade(this.trade);

    // (Validate.objects = Validate.objects || []).push(this);
    logger.log("Event cancel-trade (" + this.trade.trade_id + ") for agent " + this.trade.agent_ini.name + "/" + this.trade.agent_res.name + " registered.", 2);
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
    if (!(res = Validate.validate_key_format(EventCancelTrade._formats, structure)).status) {
      return res;
    }
    if (!(res = Validate.validate_trade_exists(structure.trade_id)).status) {
      return res;
    }
    if (!(res = Validate.validate_trade_status(res.trade, [2, 3])).status) {
      return res;
    }
    const res2 = res;
    if (!(res = Validate.validate_agent_logged_in(res.trade.agent_ini)).status) {
      return res;
    }

    return res2;
  }
}
