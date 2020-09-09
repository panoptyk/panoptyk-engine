import { BaseController } from "./baseController";
import { Agent, Item, Room } from "../models";
import { ItemManipulator, RoomManipulator, AgentManipulator } from "../manipulators";

export class SpawnController extends BaseController {

    spawnItem(item: Item, room: Room): void {
        ItemManipulator.putInRoom(item, room);
        RoomManipulator.addItem(room, item);

        room.occupants.forEach(occupant => {
            this.updateChanges(occupant, [ item, room ]);
        });
    }

    despawnItem(item: Item, room: Room): void {
        ItemManipulator.removeFromRoom(item);
        RoomManipulator.removeItem(room, item);

        room.occupants.forEach(occupant => {
            this.updateChanges(occupant, [ item, room ]);
        });
    }

    spawnAgent(agent: Agent, room: Room): void {
        AgentManipulator.putInRoom(agent, room);
        RoomManipulator.addAgent(room, agent);

        this.updateChanges(agent, [ agent, room, room.adjacentRooms, room.occupants, room.items ]);
        room.occupants.forEach(occupant => {
            this.updateChanges(occupant, [ agent, room ]);
        });
    }

    despawnAgent(agent: Agent, room: Room): void {
        AgentManipulator.removeFromRoom(agent);
        RoomManipulator.removeAgent(room, agent);

        this.updateChanges(agent, [ agent, room ]);
        room.occupants.forEach(occupant => {
            this.updateChanges(occupant, [ room ]);
        });
    }

}