import { BaseController } from "./baseController";
import { Agent, Room } from "../models";
import { AgentManipulator } from "./agentManipulator";
import { RoomManipulator } from "./roomManipulator";

export class MovementController extends BaseController {

    moveAgent(agent: Agent, from: Room, to: Room): void {

        AgentManipulator.removeFromRoom(agent, from);
        RoomManipulator.removeAgent(from, agent);
        AgentManipulator.putInRoom(agent, to);
        RoomManipulator.addAgent(to, agent);


        this.updateChanges(agent, [ agent, from ]);
        from.occupants.forEach(occupant => {
            this.updateChanges(occupant, [ from ]);
        });

        this.updateChanges(agent, [to, agent, to.adjacentRooms, to.occupants, to.items ]);
        to.occupants.forEach(occupant => {
            this.updateChanges(occupant, [ agent, to ]);
        });
    }

}