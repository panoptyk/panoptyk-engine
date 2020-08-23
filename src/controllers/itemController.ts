import { BaseController } from "./baseController";
import { Item, Room, Agent } from "../models";

export class ItemController extends BaseController {

    putInRoom (item: Item, room: Room): void {
        item.room = room;
    }

    removeFromRoom (item: Item): void {
        item.room = undefined;
    }

    giveToAgent (item: Item, agent: Agent): void {
        item.agent = agent;
    }

    takeFromAgent (item: Item, agent: Agent): void {
        item.agent = undefined;
    }

}