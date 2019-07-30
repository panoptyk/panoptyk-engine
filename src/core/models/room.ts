import fs = require('fs');
import { logger } from "../utilities/logger";
import { panoptykSettings } from "../utilities/util"

export default class Room {
  private static nextId = 1;
  private static objects = new Map();

  private id: number;
  private name: string;
  private adjacents: number[];
  private occupants: number[];
  private items: number[];
  private conversations: number[];
  private max_occupants: number;

  /**
   * Room model.
   * @param {string} name - name of room
   * @param {int} id - Room id, if null one will be assigned.
   */
  constructor(name, max_occupants, id=null) {
    this.name = name;
    this.adjacents = [];
    this.occupants = [];
    this.items = [];
    this.conversations = [];
    this.max_occupants = max_occupants;

    this.id = (id == null ? Room.nextId++ : id);
    Room.objects[this.id] = this;
    logger.log('Room ' + this.name + ' Initialized with id ' + this.id + '.', 2);
  }


  /**
   * Load a JSON object into memory.
   * @param {JSON} data - serialized room JSON.
   */
  static load(data) {
    new Room(data.name, data.max_occupants, data.id);
  }


  /**
   * Serialize this room into JSON object.
   * @return {JSON}
   */
  serialize() {
    var data = {
      name: this.name,
      max_occupants: this.max_occupants,
      id: this.id
    }

    return data;
  }


  /**
   * Serialize and write all rooms to file.
   */
  static save_all() {
    var room_to_adjacents = {};

    logger.log("Saving rooms...", 2);
    for (var id in Room.objects) {
      var room = Room.objects[id];
      logger.log("Saving room " + room.name, 2);
      fs.writeFileSync(panoptykSettings.data_dir +
        '/rooms/' + room.id + "_" + room.name + '.json',
        JSON.stringify(room.serialize()), 'utf8');

      room_to_adjacents[room.id] = [];
      for (let adj of room.adjacents) {
        room_to_adjacents[room.id].push(adj.id);
      }
    }

    logger.log("Saving Room Connections", 2);

    fs.writeFileSync(panoptykSettings.data_dir + '/rooms/room_connections.json',
      JSON.stringify(room_to_adjacents), 'utf8');

    logger.log("Rooms saved.", 2);
  }


  /**
   * Load all room from file to memory.
   */
  static load_all() {
    logger.log("Loading rooms...", 2);

    fs.readdirSync(panoptykSettings.data_dir + '/rooms/').forEach(function(file) {
      if (file !== 'room_connections.json') {
        const rawdata = fs.readFileSync(panoptykSettings.data_dir +
          '/rooms/' + file, 'utf8');

        const data = JSON.parse(rawdata);
        logger.log("Loading room " + data.name, 2);
        Room.load(data);
      }
    });

    logger.log("Loading Room Connections", 2);
    try {
      var connections = JSON.parse(fs.readFileSync(panoptykSettings.data_dir +
        '/rooms/room_connections.json').toString());

      for (var id in connections) {
        var room = Room.get_room_by_id(id);
        for (let adj_id of connections[id]) {
          var adj = Room.get_room_by_id(adj_id);
          room.connect_room(adj, false);
        }
      }
    }
    catch(err) {
      logger.log(err, 1);
    }

    logger.log("Rooms loaded.", 2);
  }


  /**
   * Allow movement from this room to another room.
   * @param {Object} other_room - room object to connect
   * @param {boolean} two_way - allow movement from other room to this room, default true
   */
  connect_room(other_room, two_way=true) {
    this.adjacents.push(other_room);
    if (two_way) {
      other_room.connect_room(this, false);
    }

    logger.log('Conected room ' + this.name + ' to room ' + other_room.name + '.', 2);
  }


  /**
   * Check if it's possible to move from this room to target room.
   * @param {Object} room2 - target room
   * @return {boolean}
   */
  is_connected_to(room2) {
    return this.adjacents.indexOf(room2) !== -1;
  }


  /**
   * Add an agent to this room.
   * @param {Object} agent - agent object to put in this room.
   */
  add_agent(agent, old_room=null) {
    this.occupants.push(agent);
  }


  /**
   * Add an item to this room.
   * @param {Object} item - item to put in room.
   */
  add_item(item) {
    logger.log("Adding item " + item.name + " to room " + this.name, 2);
    this.items.push(item);
  }


  /**
   * Remove an item from this room.
   * @param {Object} item - item to remove.
   */
  remove_item(item) {
    logger.log("Removing item " + item.name + " from room object " +
      this.name + ", index=" + this.items.indexOf(item), 2);

    this.items.splice(this.items.indexOf(item), 1);
  }


  /**
   * Removes an agent from this room.
   * @param {Object} agent - agent to remove
   * @param {Object} new_room - room agent is heading to.
   */
  remove_agent(agent, new_room) {
    var index = this.occupants.indexOf(agent);

    if (index == -1) {
      logger.log('Agent ' + agent.name + ' not in room ' + this.name + '.', 0);
      return false;
    }

    this.occupants.splice(index, 1);
  }


  /**
   * Get data to send to client.
   * @returns {Object}
   */
  get_data() {
    var adj_ids = [];
    for (let room of this.adjacents) {
      //TODO adj_ids.push({'id':room.id, 'room_name':room.name});
    }

    var conversation_datas = [];
    for (let conversation of this.conversations) {
      //TODO conversation_datas.push(conversation.get_data());
    }

    var data = {
      'id': this.id,
      'room_name': this.name,
      'adjacent_rooms': adj_ids,
      'layout': {
        'conversations': conversation_datas
      }
    }

    return data;
  }


  /**
   * Add a conversation to a room.
   * @param {Object} conversation - conversation to add to room.
   */
  add_conversation(conversation) {
    this.conversations.push(conversation);
  }


  /**
   * Remove a conversation from this room.
   * @param {Object} conversation - conversation object.
   */
  remove_conversation(conversation) {
    var index = this.conversations.indexOf(conversation);

    if (index == -1) {
      logger.log("Could not remove conversation " + conversation.conversation_id, 0);
      return;
    }

    this.conversations.splice(index, 1);
  }


  /**
   * Get the data for agents in this room.
   * @returns {Object}
   */
  get_agents(cur_agent=null) {
    var agents = [];
    for (let agent of this.occupants) {
      if (agent !== cur_agent) {
        //TODO agents.push(agent.get_public_data());
      }
    }

    return agents;
  }


  /**
   * Get the data for items in this room.
   * @returns {Object}
   */
  get_items() {
    var items_data = [];

    for (let item of this.items) {
      //TODO items_data.push(item.get_data());
    }
    return items_data;
  }


  /**
   * Static function. Get a room by id.
   * @param id {int} - id of room.
   * @returns {Object/null}
   */
  static get_room_by_id(id) {

    if (Room.objects[id] != undefined){
      return Room.objects[id];
    }

    logger.log('Could not find room with id ' + id + '.', 1);
    return null;
  }
}
