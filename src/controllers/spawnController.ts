import { BaseController } from "./baseController";
import { Agent, Item, Room } from "../models";
import { ItemManipulator } from "./itemManipulator";
import { RoomManipulator } from "./roomManipulator";
import { AgentManipulator } from "./agentManipulator";

export class SpawnController extends BaseController {

    spawnItem(item: Item, room: Room) {
        ItemManipulator.putInRoom(item, room);
        RoomManipulator.addItem(room, item);

        room.occupants.forEach(occupant => {
            this.updateChanges(occupant, [ item, room ]);
        });
    }

    despawnItem(item: Item, room: Room) {
        ItemManipulator.removeFromRoom(item);
        RoomManipulator.removeItem(room, item);

        room.occupants.forEach(occupant => {
            this.updateChanges(occupant, [ item, room ]);
        });
    }

    spawnAgent(agent: Agent, room: Room) {
        AgentManipulator.putInRoom(agent, room);
        RoomManipulator.addAgent(room, agent);

        this.updateChanges(agent, [ agent, room, room.adjacentRooms, room.occupants, room.items ]);
        room.occupants.forEach(occupant => {
            this.updateChanges(occupant, [ agent, room ]);
        });
    }

    despawnAgent(agent: Agent, room: Room) {
        AgentManipulator.removeFromRoom(agent, room);
        RoomManipulator.removeAgent(room, agent);

        this.updateChanges(agent, [ agent, room ]);
        room.occupants.forEach(occupant => {
            this.updateChanges(occupant, [ room ]);
        });
    }

}