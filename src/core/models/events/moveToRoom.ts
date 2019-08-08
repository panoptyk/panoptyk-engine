import { PEvent } from "./pEvent";
import { logger } from "../../utilities/logger";
import { Validate } from "../validate";
import { control } from "../../../server/controllers/controller";
import { Room } from "../room";

export class EventMoveToRoom extends PEvent {
  private static _eventName = "move-to-room";
  public static get eventName() {
    return EventMoveToRoom._eventName;
  }
  private static _formats =  [{
    "room_id": "number"
  }];
  public static get formats() {
    return EventMoveToRoom._formats;
  }

  public old_room;
  public new_room;

  /**
   * Event model.
   * @param {Object} socket - socket.io client socket object.
   * @param {Object} inputData - raw input recieved.
   */
  constructor(socket, inputData) {
    super(socket, inputData);
    let res;

    if (!(res = EventMoveToRoom.validate(inputData, this.fromAgent)).status) {
      logger.log("Bad event moveToRoom data ("+ JSON.stringify(inputData) + ").", 1);
      // TODO server.send.event_failed(socket, EventMoveToRoom._eventName, res.message);
      return;
    }

    this.old_room = this.fromAgent.room;
    this.new_room = Room.getByID(inputData.room_id);

    control.move_agent_to_room(this.fromAgent, this.new_room);

    (Validate.objects = Validate.objects || []).push(this);
    logger.log("Event move-to-room (" + this.old_room.name + "->"
        + this.new_room.name  + ") for agent " + this.fromAgent.agentName + " registered.", 2);
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
    if (!(res = Validate.validate_key_format(EventMoveToRoom._formats, structure)).status) {
      return res;
    }
    if (!(res = Validate.validate_room_adjacent(Room.objects[agent.room], Room.getByID(structure.room_id))).status) {
      return res;
    }
    if (!(res = Validate.validate_room_has_space(Room.getByID(structure.room_id))).status) {
      return res;
    }

    return res;
  }
}
