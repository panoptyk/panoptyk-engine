import { logger, LOG } from "../utilities/logger";
import { Room } from "./room";
import { Agent } from "./agent";
import { IDObject } from "./idObject";

export class Item extends IDObject {

  private _type: string;
  public get type(): string {
    return this._type;
  }
  private _itemName: string;
  public get itemName(): string {
    return this._itemName;
  }
  private _quantity: number;
  public get quantity(): number {
    return this._quantity;
  }
  private roomID: number;
  private agentID: number;
  public inTransaction: boolean;

  /**
   * Item model.
   * @param {string} itemName - item name
   * @param {string} type - item type. (Default: unique)
   * @param {number} quantity - number of item. (Default: 1)
   * @param {Room} room - room object item is in. (Optional).
   * @param {Agent} agent - agent that owns item. (Optional).
   * @param {number} id - id of item. If null, one will be assigned.
   */
  constructor(itemName: string, type = "unique", quantity = 1, room?: Room, agent?: Agent, id?: number) {
    super(Item.name, id);

    this._itemName = itemName;
    this._type = type;
    this._quantity = quantity;
    this.roomID = room ? room.id : undefined;
    this.agentID = agent ? agent.id : undefined;

    this.inTransaction = false;

    if (room) {
      (Room.getByID(this.roomID) as Room).addItem(this);
    }

    if (agent) {
      (Agent.getByID(this.agentID) as Agent).addItemInventory(this);
    }

    logger.log("Item " + this + " Initialized.", LOG.INFO);
  }

  /**
   * Load an item JSON into memory.
   * @param {JSON} json - serialized item object.
   */
  static load(json: Item) {
    let i = Item.objects[json.id];
    i = i ? i : new Item(json._itemName, json._type, json._quantity, undefined, undefined, json.id);
    for (const key in json) {
      i[key] = json[key];
    }
    return i;
  }

  /**
   * Sanatizes data to be serialized
   * @param removePrivateData {boolean} Determines if private is removed information that a client/agent
   *  may not be privy to.
   */
  public serialize(removePrivateData = false): Item {
    const safeAgent = Object.assign({}, this);
    return safeAgent;
  }

  toString() {
    return this._itemName + ":" + this.type + " (id#" + this.id + ")";
  }

  /**
   * Put item in room.
   * @param {Room} room - room object to put item in.
   */
  putInRoom(room: Room) {
    this.roomID = room.id;
  }

  /**
   * Remove item from its room and send updates.
   */
  remove_from_room() {
    this.roomID = 0;
  }

  /**
   * Give this item to an agent.
   * @param {Agent} agent - agent object to give item to.
   */
  giveToAgent(agent: Agent) {
    this.agentID = agent.id;
  }

  /**
   * Take this item from an agent.
   */
  takeFromAgent() {
    this.agentID = 0;
  }

  get room(): Room {
    return this.roomID ? Room.getByID(this.roomID) : undefined;
  }

  get agent(): Agent {
    return this.agentID ? Agent.getByID(this.agentID) : undefined;
  }

}
