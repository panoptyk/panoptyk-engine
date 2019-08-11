import { PEvent } from "./pEvent";
import { logger } from "../../utilities/logger";
import { Validate } from "../validate";
import { Controller } from "../../../server/controllers/controller";

export class EventTakeItems extends PEvent {
  private static _eventName = "take-items";
  public static get eventName() {
    return EventTakeItems._eventName;
  }
  private static _formats = [{
    "item_ids": "object"
  }];
  public static get formats() {
    return EventTakeItems._formats;
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
    if (!(res = EventTakeItems.validate(inputData, this.fromAgent)).status) {
      logger.log("Bad event takeItems data (" + JSON.stringify(inputData) + ").", 1);
      // TODO server.send.event_failed(socket, EventTakeItems._eventName, res.message);
      return;
    }

    this.items = res.items;
    this.room = this.fromAgent.room;

    Controller.removeAgentFromConversationIfIn(this.fromAgent);
    Controller.removeItemsFromRoom(this.items, this.fromAgent);
    Controller.addItemsToAgentInventory(this.fromAgent, this.items);

    const itemNames = [];
    for (const item of this.items) {
      itemNames.push(item.name);
    }
    Controller.giveInfoToAgents(this.room.occupants, (this.fromAgent.agentName + " picked up " +
      itemNames.join(", ") + " in room " + this.room.name));

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

    if (!(res = Validate.validate_key_format(EventTakeItems._formats, structure)).status) {
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
