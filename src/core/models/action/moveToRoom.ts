import { Action } from "./action";
import { logger } from "../../utilities/logger";
import { Validate } from "../validate";
import { Controller } from "../../controllers/controller";
import { Room } from "../room";
import { Agent } from "../agent";

export const ActionMoveToRoom: Action = {
  name: "move-to-room",
  formats: [
    {
      roomID: "number"
    }
  ],
  enact: (agent: Agent, inputData: any) => {
    const controller = new Controller();
    const oldRoom = agent.room;
    const newRoom = Room.getByID(inputData.room_id);

    controller.moveAgentToRoom(agent, newRoom);

    // (Validate.objects = Validate.objects || []).push(this);
    logger.log("Event move-to-room (" + oldRoom.roomName + "->"
      + newRoom.name  + ") for agent " + agent.agentName + " registered.", 2);
    controller.sendUpdates();
  },
  validate: (agent: Agent, socket: any, inputData: any) => {
    let res;
    if (!(res = Validate.validate_room_adjacent(agent.room, Room.getByID(inputData.roomID))).status) {
      return res;
    }
    if (!(res = Validate.validate_room_has_space(Room.getByID(inputData.roomID))).status) {
      return res;
    }

    return Validate.successMsg;
  }
};
