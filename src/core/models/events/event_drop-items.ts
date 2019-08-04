import { PEvent } from "./pEvent";
import { logger } from "../../utilities/logger";
import { Validate } from "../validate";
import { control } from "../../../server/controllers/controller";

export class Event_dropItems extends PEvent {
  private static _eventName = "drop-items";
  public static get eventName() {
    return Event_dropItems._eventName;
  }
  private static _formats = [{
    "item_ids": "object",
  }];
  public static get formats() {
    return Event_dropItems._formats;
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
    if (!(res = Event_dropItems.validate(inputData, this.fromAgent)).status) {
      logger.log("Bad event dropItems data.", 1);
      // TODO server.send.event_failed(socket, Event_dropItems_eventName, res.message);
    }

    this.items = res.items;
    this.room = this.fromAgent.room;

    control.remove_items_fromAgent_inventory(this.items);
    control.add_items_to_room(this.room, this.items, this.fromAgent);

    const itemNames = [];
    for (const item of this.items) {
      itemNames.push(item.name);
    }
    control.give_info_toAgents(this.room.occupants, (this.fromAgent.agentName + " dropped " +
      itemNames.join(", ") + " in room " + this.room.name));

    (Validate.objects = Validate.objects || []).push(this);
    logger.log("Event drop-items (" + JSON.stringify(inputData.item_ids) + ") for agent "
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
    if (!(res = Validate.validate_key_format(Event_dropItems._formats, structure)).status) {
      return res;
    }
    if (!(res = Validate.validate_array_types(structure.item_ids, "number")).status) {
      return res;
    }
    if (!(res = Validate.validate_agent_owns_items(agent, structure.item_ids)).status) {
      return res;
    }
    if (!(res = Validate.validate_items_not_in_transaction(res.items)).status) {
      return res;
    }
    return res;
  }
}