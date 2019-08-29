import { logger, LOG } from "../utilities/logger";
import { Room } from "./room";
import { Agent } from "./agent";
import { IDObject } from "./idObject";
import { stringify } from "querystring";

export class Item extends IDObject {

  private type: number;
  private _itemName: string;
  public get itemName(): string {
    return this._itemName;
  }
  private roomID: number;
  private agentID: number;
  public inTransaction: boolean;

  /**
   * Item model.
   * @param {string} itemName - item name
   * @param {string} type - item type
   * @param {Room} room - room object item is in. (Optional).
   * @param {Agent} agent - agent that owns item. (Optional).
   * @param {number} id - id of item. If null, one will be assigned.
   */
  constructor(itemName, type, room?: Room, agent?: Agent, id?) {
    super(Item.name, id);

    this._itemName = itemName;
    this.type = type;
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
    const i = new Item(json.itemName, json.type, undefined, undefined, json.id);
    for (const key in json) {
      i[key] = json[key];
    }
    return i;
  }

  toString() {
    return this.itemName + ":" + this.type + " (id#" + this.id + ")";
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
    this.roomID = undefined;
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
    this.agentID = undefined;
  }

  get room(): Room {
    return Room.getByID(this.roomID);
  }

  get agent(): Agent {
    return Agent.getByID(this.agentID);
  }

  // /**
  //  * Get 'ready-to-send' data to send to client.
  //  * @returns {Object}
  //  */
  // getData() {
  //   return {
  //     id: this.id,
  //     item_type: this.type,
  //     item_name: this.itemName
  //   };
  // }

//   /**
//    * Turn list of ids into list of items.
//    * @param {[int]} ids - list of item ids
//    * @returns {[Object]/null}
//    */
//   static get_items_by_ids(ids) {
//     var items = [];
//     for (let id of ids) {
//       items.push(Item.get_item_by_id(id));
//       if (items[-1] === null) {
//         logger.log("Could not find item for id " + id + ".", 0);
//         return null;
//       }
//     }

//     return items;
//   }
}
