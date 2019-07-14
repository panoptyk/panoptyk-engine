'use strict'
class Item {
  /**
   * Item model.
   * @param {string} name - item name
   * @param {string} type - item type
   * @param {Object} room - room object item is in. (Optional).
   * @param {Object} agent - agent that owns item. (Optional).
   * @param {int} id - id of item. If null, one will be assigned.
   */
  constructor(name, type, room=null, agent=null, id=null) {
    this.type = type;
    this.name = name;
    this.room = room;
    this.agent = agent;

    this.in_transaction = false;

    this.item_id = id == null ? Item.nextId++ : id;
    Item.objects[this.item_id] = this;

    if (this.room !== null) {
      this.room.items.push(this);
    }

    if (this.agent !== null) {
      this.agent.inventory.push(this);
    }

    server.log('Item ' + this.type + ':' + this.name + ' Initialized.', 2);
  }


  /**
   * Load an item JSON into memory.
   * @param {JSON} data - serialized item object.
   */
  static load(data) {
    new Item(
      data.name,
      data.type,
      server.models.Room.get_room_by_id(data.room_id),
      server.models.Agent.get_agent_by_id(data.agent_id),
      data.item_id);
  }


  /**
   * Serialize this item object into a JSON object.
   * @return {JSON}
   */
  serialize() {
    var data = {
      name: this.name,
      type: this.type,
      room_id: this.room == null ? null : this.room.room_id,
      agent_id: this.agent == null ? null : this.agent.agent_id,
      item_id: this.item_id
    }

    return data;
  }


  /**
   * Serialize all items and save them to files.
   */
  static save_all() {
    server.log("Saving items...", 2);

    for (var id in Item.objects) {
      var item = Item.objects[id];
      server.log("Saving item " + item.name, 2);

      server.modules.fs.writeFileSync(server.settings.data_dir +
        '/items/' + item.item_id + '_' + item.name + '.json',
        JSON.stringify(item.serialize()), 'utf8');
    }

    server.log("Items saved.", 2);
  }


  /**
   * Load all items from file into memory.
   */
  static load_all() {
    server.log("Loading items...", 2);

    server.modules.fs.readdirSync(server.settings.data_dir + '/items/').forEach(function(file) {
      server.modules.fs.readFile(server.settings.data_dir +
        '/items/' + file, function read(err, data) {

        if (err) {
          server.log(err);
          return;
        }

        var json = JSON.parse(data);
        server.log("Loading item " + json.name, 2);
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
      'item_id': this.item_id,
      'item_type': this.type,
      'item_name': this.name
    }
  }


  /**
   * Find an item by its id.
   * @param {int} item_id - item id
   * @return {Object/null}
   */
  static get_item_by_id(item_id) {
    if (Item.objects[item_id] != undefined) {
      return Item.objects[item_id];
    }

    server.log('Could not find item with id ' + item_id + '.', 0);
    return null;
  }


  /**
   * Turn list of ids into list of items.
   * @param {[int]} item_ids - list of item ids
   * @returns {[Object]/null}
   */
  static get_items_by_ids(item_ids) {
    var items = [];
    for (let id of item_ids) {
      items.push(Item.get_item_by_id(id));
      if (items[-1] === null) {
        server.log('Could not find item for id ' + id + '.', 0);
        return null;
      }
    }

    return items;
  }
}

Item.objects = {};
Item.nextId = 1;

module.exports = Item;
