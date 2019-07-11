'use strict'
class Conversation{
  /**
   * Conversation constructor.
   * @param {Object} room - room object conversation is in
   * @param {int} max_agents - number of agents that can use this conversation at once.
   * @param {int} id - conversation id, if null one will be assigned.
   */
  constructor(room, max_agents=4, id=null) {
    this.conversation_id = id === null ? Conversation.objects.length : id;
    Conversation.objects[this.conversation_id] = this;

    this.max_agents = max_agents;
    this.agents = [];
    this.room = room;
    room.add_conversation(this);

    server.log('Conversation intialized in room ' + room.room_id, 2);
  }


  /**
   * Create a conversation instance from JSON.
   * @param {JSON} data - serialized conversation json.
   */
  static load(data) {
    new Conversation(server.models.Room.get_room_by_id(data.room_id), data.max_agents, data.conversation_id);
  }


  /**
   * Represent this conversation as a json dictionary.
   * @return {JSON}
   */
  serialize() {
    return {
      room_id: this.room.room_id,
      max_agents: this.max_agents,
      conversation_id: this.conversation_id
    }
  }


  /**
   * Serialize and write all conversations to file.
   */
  static save_all() {
    server.log("Saving conversations...", 2);
    for (var id in Conversation.objects) {
      var conversation = Conversation.objects[id];
      server.log("Saving conversation " + id, 2);
      server.modules.fs.writeFileSync(server.settings.data_dir +
        '/conversations/' + id + '_conversation.json', JSON.stringify(conversation.serialize()), 'utf8');
    }

    server.log("Conversations saved.", 2);
  }


  /**
   * Load all conversations from file into memory.
   */
  static load_all() {
    server.log("Loading conversations...", 2);

    server.modules.fs.readdirSync(server.settings.data_dir + '/conversations/').forEach(function(file) {
      var data = server.modules.fs.readFileSync(server.settings.data_dir +
        '/conversations/' + file, 'utf8');

      data = JSON.parse(data);
      server.log("Loading conversation " + data.conversation_id, 2);
      Conversation.load(data);
    });

    server.log("Conversations loaded.", 2);
  }


  /**
   * Add an agent to this conversation.
   * @param {Object} agent - agent object
   */
  add_agent(agent) {
    this.agents.push(agent);
  }


  /**
   * Remove an agent from this conversation.
   * @param {Object} agent - agent object.
   */
  remove_agent(agent) {
    var index = this.agents.indexOf(agent);

    if (index == -1) {
      server.log("Tried to remove agent not in conversation " + this.conversation_id, 0);
      return;
    }

    this.agents.splice(index);
  }


  /**
   * Get a list of agent ids for this conversation.
   * @param {Object} ignore_agent - do not include this agent object in list. (Optional).
   * @return {[int]}
   */
  get_agent_ids(ignore_agent=null) {
    var ids = [];
    for (let agent of this.agents) {
      if (agent !== ignore_agent) {
        ids.push(agent.agent_id);
      }
    }

    return ids;
  }


  /**
   * Data to send to client for this conversation.
   * @return {Object}
   */
  get_data() {
    return {
      conversation_id: this.conversation_id,
      max_agents: this.max_agents,
      agent_ids: this.get_agent_ids()
    }
  }


  /**
   * Find a conversation given an id.
   * @param {int} conversation_id - id of conversation to find.
   * @return {Object/null}
   */
  static get_conversation_by_id(conversation_id) {
    if (Conversation.objects[conversation_id]) {
      return Conversation.objects[conversation_id];
    }

    server.log("Could not find conversation with id " + conversation_id, 1);
    return null;
  }
}

Conversation.objects = {};

module.exports = Conversation;
