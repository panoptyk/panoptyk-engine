import fs = require('fs');
import { logger } from "../utilities/logger";
import { panoptykSettings } from "../utilities/util"

export default class Agent {
  private static nextId = 1;
  private static objects = new Map();

  private name: string;
  private id: number;
  private room: number[];
  private socket;
  private inventory: number[];
  private knowledge: number[];
  private conversation: number[];
  private conversation_requests = new Map();

  /**
   * Agent model.
   * @param {string} username - username of agent
   * @param {int} room - room id of agent. Does not put agent in room, simply saves it.
   * @param {[int]} inventory - list of items that agent owns.
   * @param {[int]} knowledge - list of items that agent owns.
   * @param {int} id - id of agent. If null, one will be assigned.
   */
  constructor(username, room=null, inventory=[], knowledge=[], id=null) {
    this.name = username;
    this.room = room;
    this.socket = null;
    this.inventory = inventory;
    this.knowledge = knowledge;
    this.conversation = null;

    this.id = (id == null ? Agent.nextId++ : id);
    Agent.objects[this.id] = this;
    logger.log('Agent ' + this.name + ' initialized.', 2);
  }


  /**
   * Load and initialize agent object from JSON.
   * @param {dict} data - serialized agent JSON.
   */
  static load(data) {
    var inventory = [];
    var knowledge = [];
    // load items (handled by items)

    new Agent(data.name, data.room_id, inventory, knowledge, data.id);
  }


  /**
   * Login an agent. Create new agent or update existing agent with new socket. Send out updates.
   * @param {string} username - username of agent.
   * @param {Object} socket - socket.io client socket object.
   */
  static login(username, socket) {

    var sel_agent = null;

    for (var id in Agent.objects) {
      var agent = Agent.objects[id];
      if (agent.name == username) {
        sel_agent = agent;
        break;
      }
    }

    if (sel_agent === null) {
      sel_agent = new Agent(username,
        panoptykSettings.default_room_id);
    }

    sel_agent.socket = socket;
    //TODO server.send.login_complete(sel_agent);
    //TODO server.control.add_agent_to_room(sel_agent, server.models.Room.objects[sel_agent.room]);

    return sel_agent;
  }


  /**
   * Get JSON dictionary representing this agent.
   * @returns {JSON}
   */
  serialize() {
    var data = {
      name: this.name,
      room_id: this.room,
      inventory: [],
      id: this.id
    }
    for (let item of this.inventory) {
      //TODO data.inventory.push(item.item_id);
    }

    return data;
  }


  /**
   * Serialize and write all agents to files.
   */
  static save_all() {
    logger.log("Saving agents...", 2);
    for (var id in Agent.objects) {
      var agent = Agent.objects[id];
      logger.log("Saving agent: " + agent.name, 2);

      fs.writeFileSync(panoptykSettings.data_dir + '/agents/' +
          agent.id + '_' + agent.name + '.json',
        JSON.stringify(agent.serialize()), 'utf8');

    }
    logger.log("Agents saved.", 2);
  }


  /**
   * Load all agents from file into memory.
   */
  static load_all() {
    logger.log("Loading agents...", 2);

    fs.readdirSync(panoptykSettings.data_dir + '/agents/').forEach(function(file) {
      fs.readFile(panoptykSettings.data_dir +
        '/agents/' + file, function read(err, data) {

        if (err) {
          logger.log(err);
          return;
        }

        var json = JSON.parse(data.toString());
        logger.log("Loading agent " + json.name, 2);
        Agent.load(json);
      });
    });

    logger.log("Agents loaded", 2);
  }


  /**
   * Static function. Find agent with given id.
   * @param {int} id - agent id
   * @returns {Object/null}
   */
  static get_agent_by_id(id) {
    if (Agent.objects[id]){
      return Agent.objects[id];
    }
    logger.log('Could not find agent with id ' + id + '.', 1);
    return null;
  }


  /**
   * TODO: Look at this function
   * Static function. Find agent associated with a socket.
   * @param {Object} socket - Socket.io object
   * @returns {Object/null}
   */
  static get_agent_by_socket(socket) {
    for (var id in Agent.objects) {
      var agent = Agent.objects[id];
      if (agent.socket === socket) {
        return agent;
      }
    }

    logger.log('Could not find agent with socket ' + socket.id + '.', 1);
    return null;
  }


  /**
   * Add an item to agent's inventory.
   * @param {Object} item - item object
   */
  add_item_inventory(item) {
    this.inventory.push(item.id);
  }


  /**
   * Remove an item from agent inventory.
   * @param {Object} item - item object
   */
  remove_item_inventory(item) {
    var index = this.inventory.indexOf(item.id);

    if (index == -1) {
      logger.log('Tried to remove invalid item '+item.name+' from agent '+this.name+'.', 0);
      return false;
    }

    this.inventory.splice(index, 1);
    return true;
  }

   /**
   * Add an info to agent's knowledge.
   * @param {Info} info - information on event
   */
  add_info_knowledge(info) {
    this.inventory.push(info.id);
  }


  /**
   * Remove an item from agent inventory.
   * @param {Info} info - item object
   */
  remove_info_knowledge(info) {
    var index = this.inventory.indexOf(info.id);

    if (index == -1) {
      logger.log('Tried to remove invalid information '+info.id+' from agent '+this.name+'.', 0);
      return false;
    }

    this.inventory.splice(index, 1);
    return true;
  }


  /**
   * Put agent in room.
   * @param {Object} new_room - room to move to
   */
  put_in_room(new_room) {
    this.room = new_room.room_id;
  }


  /**
   * Remove agent from room.
   */
  remove_from_room() {
    this.room = null;
    this.conversation_requests = new Map();
  }


  /**
   * Get the data object for this agent's inventory.
   * @returns {Object}
   */
  get_inventory_data() {
    var dat = [];
    for (let item of this.inventory) {
      //TODO dat.push(item.get_data());
    }
    return dat;
  }


  /**
   * Get the data object for this agent that other agent's can see.
   * @returns {Object}
   */
  get_public_data() {
    return {
      'id': this.id,
      'agent_name': this.name,
      'room_id': this.room
    }
  }


  /**
   * Get the data object for this agent that the owner agent can see.
   * @returns {Object}
   */
  get_private_data() {
    var dat = this.get_public_data();
    //TODO dat.inventory = this.get_inventory_data();
    return dat;
  }


  /**
   * Called on agent logout.
   */
  logout() {
    logger.log("Agent " + this.name + " logged out.", 2);

    //TODO server.control.remove_agent_from_room(this, null, false);
  }


  /**
   * Add agent to conversation.
   * @param {Object} conversation - conversation object.
   */
  join_conversation(conversation) {
    this.conversation_requests = new Map();
    this.conversation = conversation;
  }


  /**
   * Remove an agent from its' conversation.
   */
  leave_conversation() {
    this.conversation = undefined;
  }
}