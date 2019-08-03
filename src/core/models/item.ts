import fs = require("fs");
import { logger } from "../utilities/logger";
import { panoptykSettings } from "../utilities/util";
import { Room } from "./room";
import { Agent } from "./agent";
import { IDObject } from "./idObject";

export class Item extends IDObject {

  private type: number;
  private name: string;
  private room: number;
  private agent: number;
  private inTransaction: boolean;

  /**
   * Item model.
   * @param {string} name - item name
   * @param {string} type - item type
   * @param {number} room - room object item is in. (Optional).
   * @param {number} agent - agent that owns item. (Optional).
   * @param {number} id - id of item. If null, one will be assigned.
   */
  constructor(name, type, room?, agent?, id?) {
    super("Item", id);

    this.type = type;
    this.name = name;
    this.room = room;
    this.agent = agent;

    this.inTransaction = false;

    if (this.room !== null) {
      Room[this.room].items.push(this);
    }

    if (this.agent !== null) {
      Agent[this.agent].inventory.push(this);
    }

    logger.log("Item " + this.type + ":" + this.name + " Initialized.", 2);
  }

  /**
   * Load an item JSON into memory.
   * @param {JSON} data - serialized item object.
   */
  static load(data) {
    new Item(data.name, data.type, data.room_id, data.agent_id, data.id);
  }

  /**
   * Put item in room.
   * @param {Object} room - room object to put item in.
   */
  put_in_room(room) {
    this.room = room;
  }

  /**
   * Remove item from its room and send updates.
   */
  remove_from_room() {
    this.room = undefined;
  }

  /**
   * Give this item to an agent.
   * @param {Object} agent - agent object to give item to.
   */
  give_to_agent(agent) {
    this.agent = agent;
  }

  /**
   * Take this item from an agent.
   */
  take_from_agent() {
    this.agent = undefined;
  }

  /**
   * Get 'ready-to-send' data to send to client.
   * @returns {Object}
   */
  get_data() {
    return {
      id: this.id,
      item_type: this.type,
      item_name: this.name
    };
  }

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
