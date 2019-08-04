import { PEvent } from "./pEvent";
import { logger } from "../../utilities/logger";
import { Validate } from "../validate";
import { control } from "../../../server/controllers/controller";

export class Event_takeItems extends PEvent {
  private static _eventName = "take-items";
  public static get eventName() {
    return Event_takeItems._eventName;
  }
  private static _formats = [{
    "item_ids": "object"
  }];
  public static get formats() {
    return Event_takeItems._formats;
  }

  public items;
  public room;

  /**
   * Event model.
   * @param {Object} socket - socket.io client socket object.
   * @param {Object} inputData - raw input recieved.
   */
  constructor(socket, inputData) {
    super(socket, inputData);
    let res;
    if (!(res = Event_takeItems.validate(inputData, this.fromAgent)).status) {
      logger.log("Bad event takeItems data (" + JSON.stringify(inputData) + ").", 1);
      // TODO server.send.event_failed(socket, Event_takeItems._eventName, res.message);
      return;
    }

    this.items = res.items;
    this.room = this.fromAgent.room;

    control.remove_agent_from_conversation_if_in(this.fromAgent);
    control.remove_items_from_room(this.items, this.fromAgent);
    control.add_items_toAgent_inventory(this.fromAgent, this.items);

    const item_names = [];
    for (const item of this.items) {
      item_names.push(item.name);
    }
    control.give_info_toAgents(this.room.occupants, (this.fromAgent.agentName + " picked up " +
      item_names.join(", ") + " in room " + this.room.name));

    (Validate.objects = Validate.objects || []).push(this);
    logger.log("Event take-items (" + JSON.stringify(inputData.item_ids) + ") for agent "
        + this.fromAgent.agentName + " registered.", 2);

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

    if (!(res = Validate.validate_key_format(Event_takeItems._formats, structure)).status) {
      return res;
    }

    // check if item in room
    if (!(res = Validate.validate_items_in_room(agent.room, structure.item_ids)).status) {
      return res;
    }

    // return items as well
    return res;
  }
}
