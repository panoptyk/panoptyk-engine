import { BaseController } from "./baseController";
import { Agent, Item, Room } from "../models";
import { RoomManipulator, AgentManipulator, ItemManipulator } from "../manipulators";

export class InventoryController extends BaseController {

    pickupItem(agent: Agent, item: Item, room: Room): void {

        RoomManipulator.removeItem(room, item);
        ItemManipulator.removeFromRoom(item);
        AgentManipulator.addItemInventory(agent, item);

        room.occupants.forEach(occupant => {
            this.updateChanges(occupant, [ agent, item, room ]);
        });
    }

    dropItem(agent: Agent, item: Item, room: Room): void {

        AgentManipulator.removeItemInventory(agent, item);
        ItemManipulator.putInRoom(item, room);
        RoomManipulator.addItem(room, item);

        room.occupants.forEach(occupant => {
            this.updateChanges(occupant, [ agent, item, room ]);
        });
    }

}