import { Item, Room, Agent } from "../models";

export class ItemManipulator {

    static putInRoom (item: Item, room: Room): void {
        item.room = room;
    }

    static removeFromRoom (item: Item): void {
        item.room = undefined;
    }

    static giveToAgent (item: Item, agent: Agent): void {
        item.agent = agent;
    }

    static takeFromAgent (item: Item): void {
        item.agent = undefined;
    }

}