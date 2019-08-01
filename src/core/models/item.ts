import fs = require('fs');
import { logger } from "../utilities/logger";
import { panoptykSettings } from "../utilities/util";
import Room from "./room";
import Agent from "./agent";

export default class Item {
  private static nextId = 1;
  private static _objects = new Map();
  public static get objects() {
    return Item._objects;
  }

  private id: number;
  private type: number;
  private name: string;
  private room: number;
  private agent: number;
  private in_transaction: boolean;

  /**
   * Item model.
   * @param {string} name - item name
   * @param {string} type - item type
   * @param {number} room - room object item is in. (Optional).
   * @param {number} agent - agent that owns item. (Optional).
   * @param {number} id - id of item. If null, one will be assigned.
   */
  constructor(name, type, room=null, agent=null, id=null) {
    this.type = type;
    this.name = name;
    this.room = room;
    this.agent = agent;

    this.in_transaction = false;

    this.id = id == null ? Item.nextId++ : id;
    Item._objects[this.id] = this;

    if (this.room !== null) {
      Room[this.room].items.push(this);
    }

    if (this.agent !== null) {
      Agent[this.agent].inventory.push(this);
    }

    logger.log('Item ' + this.type + ':' + this.name + ' Initialized.', 2);
  }


  /**
   * Load an item JSON into memory.
   * @param {JSON} data - serialized item object.
   */
  static load(data) {
    new Item(
      data.name,
      data.type,
      data.room_id,
      data.agent_id,
      data.id);
  }


  /**
   * Serialize this item object into a JSON object.
   * @return {JSON}
   */
  serialize() {
    var data = {
      name: this.name,
      type: this.type,
      room_id: this.room == null ? null : this.room,
      agent_id: this.agent == null ? null : this.agent,
      id: this.id
    }

    return data;
  }


  /**
   * Serialize all items and save them to files.
   */
  static save_all() {
    logger.log("Saving items...", 2);

    for (var id in Item._objects) {
      var item = Item._objects[id];
      logger.log("Saving item " + item.name, 2);

      fs.writeFileSync(panoptykSettings.data_dir +
        '/items/' + item.id + '_' + item.name + '.json',
        JSON.stringify(item.serialize()), 'utf8');
    }

    logger.log("Items saved.", 2);
  }


  /**
   * Load all items from file into memory.
   */
  static load_all() {
    logger.log("Loading items...", 2);

    fs.readdirSync(panoptykSettings.data_dir + '/items/').forEach(function(file) {
      fs.readFile(panoptykSettings.data_dir +
        '/items/' + file, function read(err, data) {

        if (err) {
          logger.log(err);
          return;
        }

        var json = JSON.parse(data.toString());
        logger.log("Loading item " + json.name, 2);
        Item.load(json);
      });
    });
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
    this.room = null;
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
    this.agent = null;
  }


  /**
   * Get 'ready-to-send' data to send to client.
   * @returns {Object}
   */
  get_data() {
    return {
      'id': this.id,
      'item_type': this.type,
      'item_name': this.name
    }
  }


  /**
   * Find an item by its id.
   * @param {int} id - item id
   * @return {Object/null}
   */
  static get_item_by_id(id) {
    if (Item._objects[id] != undefined) {
      return Item._objects[id];
    }

    logger.log('Could not find item with id ' + id + '.', 0);
    return null;
  }


  /**
   * Turn list of ids into list of items.
   * @param {[int]} ids - list of item ids
   * @returns {[Object]/null}
   */
  static get_items_by_ids(ids) {
    var items = [];
    for (let id of ids) {
      items.push(Item.get_item_by_id(id));
      if (items[-1] === null) {
        logger.log('Could not find item for id ' + id + '.', 0);
        return null;
      }
    }

    return items;
  }
}
