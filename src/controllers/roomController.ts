import { BaseController } from "./baseController";
import { Room, Item, Agent, Conversation } from "../models";

export class RoomController extends BaseController {

    connectRooms(from: Room, to: Room, twoWay = true): void {
        from._adjacentRooms.add(to.id);
        if (twoWay) {
            to._adjacentRooms.add(from.id);
        }
    }

    seperateRooms(from: Room, to: Room, twoWay = true): void {
        from._adjacentRooms.delete(to.id);
        if (twoWay) {
            to._adjacentRooms.delete(from.id);
        }
    }

    addAgent(room: Room, agent: Agent): void {
        if (room.occupants.length < room.maxOccupants) {
            room._occupants.add(agent.id);
        }
    }

    removeAgent(room: Room, agent: Agent): void {
        room._occupants.delete(agent.id);
    }

    addItem(room: Room, item: Item): void {
        room._items.add(item.id);
    }

    removeItem(room: Room, item: Item): void {
        room._items.delete(item.id);
    }

    addConversation(room: Room, conversation: Conversation): void {
        room._conversations.add(conversation.id);
    }

    removeConversation(room: Room, conversation: Conversation): void {
        room._conversations.delete(conversation.id);
    }

}