import { Room, Item, Agent, Conversation } from "../models";

export class RoomManipulator {
    static connectRooms(from: Room, to: Room, twoWay = true): void {
        from._adjacentRooms.add(to.id);
        if (twoWay) {
            to._adjacentRooms.add(from.id);
        }
    }

    static seperateRooms(from: Room, to: Room, twoWay = true): void {
        from._adjacentRooms.delete(to.id);
        if (twoWay) {
            to._adjacentRooms.delete(from.id);
        }
    }

    static addAgent(room: Room, agent: Agent): void {
        room._occupants.add(agent.id);
    }

    static removeAgent(room: Room, agent: Agent): void {
        room._occupants.delete(agent.id);
    }

    static addItem(room: Room, item: Item): void {
        room._items.add(item.id);
    }

    static removeItem(room: Room, item: Item): void {
        room._items.delete(item.id);
    }

    static addConversation(room: Room, conversation: Conversation): void {
        room._conversations.add(conversation.id);
    }

    static removeConversation(room: Room, conversation: Conversation): void {
        room._conversations.delete(conversation.id);
    }
}
