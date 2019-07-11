'use_strict'
class Agent {
  /**
   * Agent model.
   * @param {string} username - username of agent
   * @param {int} room - room id of agent. Does not put agent in room, simply saves it.
   * @param {[Object]} inventory - list of items that agent owns.
   * @param {[Object]} knowledge - list of items that agent owns.
   * @param {int} id - id of agent. If null, one will be assigned.
   */
  constructor(username, room=null, inventory=[], knowledge=[], id=null) {
    this.name = username;
    this.room = room;
    this.socket = null;
    this.inventory = inventory;
    this.knowledge = knowledge;
    this.conversation = null;
    this.conversation_requests = {};

    this.agent_id = (id == null ? Agent.nextId++ : id);
    Agent.objects[this.agent_id] = this;
    server.log('Agent ' + this.name + ' initialized.', 2);
  }


  /**
   * Load and initialize agent object from JSON.
   * @param {dict} data - serialized agent JSON.
   */
  static load(data) {
    var inventory = [];
    var knowledge = [];
    // load items (handled by items)

    new Agent(data.name, server.models.Room.get_room_by_id(data.room_id), inventory, knowledge, data.agent_id);
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
        server.settings.default_room_id);
    }

    sel_agent.socket = socket;
    server.send.login_complete(sel_agent);
    server.control.add_agent_to_room(sel_agent, server.models.Room.objects[sel_agent.room]);

    return sel_agent;
  }


  /**
   * Get JSON dictionary representing this agent.
   * @returns {JSON}
   */
  serialize() {
    var data = {
      name: this.name,
      room_id: this.room.room_id,
      inventory: [],
      agent_id: this.agent_id
    }
    for (let item of this.inventory) {
      data.inventory.push(item.item_id);
    }

    return data;
  }


  /**
   * Serialize and write all agents to files.
   */
  static save_all() {
    server.log("Saving agents...", 2);
    for (var id in Agent.objects) {
      var agent = Agent.objects[id];
      server.log("Saving agent: " + agent.name, 2);

      server.modules.fs.writeFileSync(server.settings.data_dir + '/agents/' +
          agent.agent_id + '_' + agent.name + '.json',
        JSON.stringify(agent.serialize()), 'utf8');

    }
    server.log("Agents saved.", 2);
  }


  /**
   * Load all agents from file into memory.
   */
  static load_all() {
    server.log("Loading agents...", 2);

    server.modules.fs.readdirSync(server.settings.data_dir + '/agents/').forEach(function(file) {
      server.modules.fs.readFile(server.settings.data_dir +
        '/agents/' + file, function read(err, data) {

        if (err) {
          server.log(err);
          return;
        }

        var json = JSON.parse(data);
        server.log("Loading agent " + json.name, 2);
        Agent.load(json);
      });
    });

    server.log("Agents loaded", 2);
  }


  /**
   * Static function. Find agent with given id.
   * @param {int} agent_id - agent id
   * @returns {Object/null}
   */
  static get_agent_by_id(agent_id) {
    if (Agent.objects[agent_id]){
      return Agent.objects[agent_id];
    }
    server.log('Could not find agent with id ' + agent_id + '.', 1);
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

    server.log('Could not find agent with socket ' + socket.id + '.', 1);
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
      server.log('Tried to remove invalid item '+item.name+' from agent '+this.name+'.', 0);
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
      server.log('Tried to remove invalid information '+info.id+' from agent '+this.name+'.', 0);
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
    this.conversation_requests = {};
  }


  /**
   * Get the data object for this agent's inventory.
   * @returns {Object}
   */
  get_inventory_data() {
    var dat = [];
    for (let item of this.inventory) {
      dat.push(item.get_data());
    }
    return dat;
  }


  /**
   * Get the data object for this agent that other agent's can see.
   * @returns {Object}
   */
  get_public_data() {
    return {
      'agent_id': this.agent_id,
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
    dat.inventory = this.get_inventory_data();
    return dat;
  }


  /**
   * Called on agent logout.
   */
  logout() {
    server.log("Agent " + this.name + " logged out.", 2);

    server.control.remove_agent_from_room(this, null, false);
  }


  /**
   * Add agent to conversation.
   * @param {Object} conversation - conversation object.
   */
  join_conversation(conversation) {
    this.conversation_requests = {};
    this.conversation = conversation;
  }


  /**
   * Remove an agent from its' conversation.
   */
  leave_conversation() {
    this.conversation = null;
  }
}

Agent.objects = {};
Agent.nextId = 1;

module.exports = Agent;
