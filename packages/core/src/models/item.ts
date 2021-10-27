import { IDatabase } from "../database/IDatabase";
import { BaseModel } from "./Imodel";
import { Agent } from "./agent";
import { Room } from "./room";
import { logger } from "../utilities";
/**
 * Item model. Defines the data associated with an item.
 */
export class Item extends BaseModel {
    _type: string;
    get type(): string {
        return this._type;
    }
    _itemName: string;
    get itemName(): string {
        return this._itemName;
    }
    _quantity: number;
    get quantity(): number {
        return this._quantity;
    }
    _room: number;
    get room(): Room {
        return this.db.retrieveModel(this._room, Room) as Room;
    }
    set room(room: Room) {
        this._room = room ? room.id : -1;
    }
    _agent: number;
    get agent(): Agent {
        return this.db.retrieveModel(this._agent, Agent) as Agent;
    }
    set agent(agent: Agent) {
        this._agent = agent ? agent.id : -1;
    }
    inTransaction: boolean;

    /**
     * Create a new Item.
     * @param name Name of the item.
     * @param type Type of the item.
     * @param quantity How many items there are.
     * @param {Room} room What room is associated with the item.
     * @param {Agent} agent What agent is associated with the item.
     * @param id ID for the item.
     * @param db Database the item is stored in.
     */
    constructor(
        name: string,
        type = "unique",
        quantity = 1,
        room?: Room,
        agent?: Agent,
        id?: number,
        db?: IDatabase
    ) {
        super(id, db);
        this._itemName = name;
        this._type = type;
        this._quantity = quantity;
        this.room = room;
        this.agent = agent;

        logger.log("Item " + this + " Initialized.", "ITEM");
    }

    toJSON(forClient: boolean, context: any): object {
        const safeItem = super.toJSON(forClient, context);
        if (forClient) {
            if (context && context.agent instanceof Agent) {
                // TODO: Remove hidden data
            }
        }
        return safeItem;
    }

    displayName(): string {
        return this._itemName;
    }

    toString(): string {
        return this._itemName + ": " + this._type + " (id#" + this.id + ")";
    }

    equals(model: any) {
        return model instanceof Item && this.id === model.id;
    }
}
