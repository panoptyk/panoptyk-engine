import { BaseController } from "./baseController";
import { Agent, Item, Room } from "../models";
import { AgentController, ItemController } from ".";
import { RoomController } from "./roomController";

export class InventoryController extends BaseController {

    pickupItem(agent: Agent, item: Item, room: Room) {
        const ac: AgentController = new AgentController(this);
        const ic: ItemController = new ItemController(this);
        const rc: RoomController = new RoomController(this);

        rc.removeItem(room, item);
        ic.removeFromRoom(item);
        ac.addItemInventory(agent, item);
    }

    dropItem(agent: Agent, item: Item, room: Room) {
        const ac: AgentController = new AgentController(this);
        const ic: ItemController = new ItemController(this);
        const rc: RoomController = new RoomController(this);

        ac.removeItemInventory(agent, item);
        ic.putInRoom(item, room);
        rc.addItem(room, item);
    }

}