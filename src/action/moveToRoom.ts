import { Action } from "./action";
import { logger } from "../utilities/logger";
import { Validate } from "./validate";
import { MovementController } from "../controllers";
import { Room } from "../models/room";
import { Agent } from "../models/agent";
import { inject } from "../utilities";

export const ActionMoveToRoom: Action = {
  name: "move-to-room",
  formats: [
    {
      roomID: "number"
    }
  ],
  enact: (agent: Agent, inputData: any) => {
    const mc: MovementController = new MovementController();
    const oldRoom = agent.room;
    const newRoom: Room = inject.db.retrieveModel(inputData.roomID, Room) as Room;

    mc.moveAgent(agent, oldRoom, newRoom);

    logger.log("Event move-to-room (" + oldRoom + "->"
      + newRoom  + ") for agent " + agent + " registered.", 2);
    mc.sendUpdates();
  },
  validate: (agent: Agent, socket: any, inputData: any) => {
    let res;
    if (!(res = Validate.validate_agent_logged_in(agent)).status) {
      return res;
    }
    const newRoom: Room = inject.db.retrieveModel(inputData.roomID, Room) as Room;
    if (!(res = Validate.validate_room_adjacent(agent.room, newRoom).status)) {
      return res;
    }
    if (!(res = Validate.validate_room_has_space(newRoom).status)) {
      return res;
    }

    return Validate.successMsg;
  }
};
