import { IDatabase } from "../database/IDatabase";
import { BaseModel } from "./Imodel";
import { Agent } from "./agent";
import { Item } from "./item";
import { Conversation } from "./conversation";
import { logger } from "../utilities";

/**
 * Room model. Defines the data associated with a room.
 */
export class Room extends BaseModel {
  _roomName: string;
  get roomName(): string {
    return this._roomName;
  }
  _adjacentRooms: Set<number>;
  get adjacentRooms(): Room[] {
    return this.db.retrieveModels([...this._adjacentRooms], Room) as Room[];
  }
  _occupants: Set<number>;
  get occupants(): Agent[] {
    return this.db.retrieveModels([...this._occupants], Agent) as Agent[];
  }
  _items: Set<number>;
  get items(): Item[] {
    return this.db.retrieveModels([...this._items], Item) as Item[];
  }
  _conversations: Set<number>;
  get conversations(): Conversation[] {
    return this.db.retrieveModels([...this._conversations], Conversation) as Conversation[];
  }
  _maxOccupants: number;
  get maxOccupants(): number {
    return this._maxOccupants;
  }
  constructor(roomName: string, maxOccupants: number, id?: number, db?: IDatabase) {
    super(id, db);
    this._roomName = roomName;
    this._maxOccupants = maxOccupants;
    this._adjacentRooms = new Set<number>();
    this._occupants = new Set<number>();
    this._items = new Set<number>();
    this._conversations = new Set<number>();

    logger.log("Room " + this + " Initialized.", "ROOM");
  }
  toJSON(forClient: boolean, context: any): object {
    const safeRoom = Object.assign({}, this);
    if (forClient) {
      if (context) {
        // TODO: Remove hidden data
      }
    }
    return safeRoom;
  }
  displayName(): string {
    return this._roomName;
  }
  toString(): string {
    return this._roomName + " (id# " + this.id + ")";
  }
  equals(model: any) {
    return model instanceof Room && this.id === model.id;
  }

   /**
    * Check if it's possible to move from this room to target room.
    * @param {Room} room - target room
    * @return {boolean}
    */
  isConnectedTo(room: Room): boolean {
    return this._adjacentRooms.has(room.id);
  }

  /**
   * Check if room contains specified item
   * @param item
   */
  hasItem(item: Item): boolean {
    return this._items.has(item.id);
  }

  /**
   * Checks if room contains specified agent
   * @param agent
   */
  hasAgent(agent: Agent): boolean {
    return this._occupants.has(agent.id);
  }

  isFull(): boolean {
    return this._occupants.keys.length >= this.maxOccupants;
  }
}
