import { BaseController } from "./baseController";
import { Agent, Item, Room } from "../models";
import { RoomManipulator } from "../manipulators/roomManipulator";
import { AgentManipulator } from "../manipulators/agentManipulator";
import { ItemManipulator } from "../manipulators/itemManipulator";

export class InventoryController extends BaseController {

    pickupItem(agent: Agent, item: Item, room: Room) {

        RoomManipulator.removeItem(room, item);
        ItemManipulator.removeFromRoom(item);
        AgentManipulator.addItemInventory(agent, item);

        room.occupants.forEach(occupant => {
            this.updateChanges(occupant, [ agent, item, room ]);
        });
    }

    dropItem(agent: Agent, item: Item, room: Room) {

        AgentManipulator.removeItemInventory(agent, item);
        ItemManipulator.putInRoom(item, room);
        RoomManipulator.addItem(room, item);

        room.occupants.forEach(occupant => {
            this.updateChanges(occupant, [ agent, item, room ]);
        });
    }

}