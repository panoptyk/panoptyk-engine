import { PEvent } from "./pEvent";
import { logger } from "../../utilities/logger";
import { Validate } from "../validate";
import { control } from "../../../server/controllers/controller";

export class Event_withdrawItemsTrade extends PEvent {
  private static _eventName = "withdraw-items-trade";
  public static get eventName() {
    return Event_withdrawItemsTrade._eventName;
  }
  private static _formats =  [{
    "trade_id": "number",
    "item_ids": "object"
  }];
  public static get formats() {
    return Event_withdrawItemsTrade._formats;
  }

  public items;
  public trade;

  /**
   * Event model.
   * @param {Object} socket - socket.io client socket object.
   * @param {Object} inputData - raw input recieved.
   */
  constructor(socket, inputData) {
    super(socket, inputData);
    let res;

    if (!(res = Event_withdrawItemsTrade.validate(inputData, this.fromAgent)).status) {
      logger.log("Bad event withdrawItemsTrade data (" + JSON.stringify(inputData) + ").", 1);
      // TODO server.send.event_failed(socket, Event_withdrawItemsTrade._eventName, res.message);
      return;
    }

    this.items = res.items;
    this.trade = res.trade;

    control.remove_items_from_trade(this.trade, this.items, this.fromAgent);

    (Validate.objects = Validate.objects || []).push(this);
    logger.log("Event withdraw-items-trade " + this.trade.trade_id + " registered.", 2);
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
    if (!(res = Validate.validate_key_format(Event_withdrawItemsTrade._formats, structure)).status) {
      return res;
    }
    if (!(res = Validate.validate_array_types(structure.item_ids, "number")).status) {
      return res;
    }
    if (!(res = Validate.validate_agent_owns_items(agent, structure.item_ids)).status) {
      return res;
    }
    const items = res.items;
    if (!(res = Validate.validate_trade_exists(structure.trade_id)).status) {
      return res;
    }
    if (!(res = Validate.validate_trade_status(res.trade, [2])).status) {
      return res;
    }
    if (!(res = Validate.validate_items_in_trade(items, res.trade, agent)).status) {
      return res;
    }
    const res2 = res;
    if (!(res = Validate.validate_agent_logged_in(res.trade.agent_ini)).status) {
      return res;
    }

    return {status: true, message: "", trade: res2.trade, items};
  }
}
