import fs = require('fs');
import { logger } from "../utilities/logger";
import { panoptykSettings } from "../utilities/util"

export default class Conversation{
  private static objects = new Map();

  private room;
  private max_agents: number;
  private id: number;
  private agents;
  /**
   * Conversation constructor.
   * @param {int} room - room object conversation is in
   * @param {int} max_agents - number of agents that can use this conversation at once.
   * @param {int} id - conversation id, if null one will be assigned.
   */
  constructor(room, max_agents=4, id=null) {
    this.id = id === null ? Conversation.objects.size : id;
    Conversation.objects[this.id] = this;

    this.max_agents = max_agents;
    this.agents = [];
    this.room = room;
    room.add_conversation(this);

    logger.log('Conversation intialized in room ' + room.room_id, 2);
  }


  /**
   * Create a conversation instance from JSON.
   * @param {JSON} data - serialized conversation json.
   */
  static load(data) {
    new Conversation(data.room_id, data.max_agents, data.id);
  }


  /**
   * Represent this conversation as a json dictionary.
   * @return {JSON}
   */
  serialize() {
    return {
      room_id: this.room.room_id,
      max_agents: this.max_agents,
      id: this.id
    }
  }


  /**
   * Serialize and write all conversations to file.
   */
  static save_all() {
    logger.log("Saving conversations...", 2);
    for (var id in Conversation.objects) {
      var conversation = Conversation.objects[id];
      logger.log("Saving conversation " + id, 2);
      fs.writeFileSync(panoptykSettings.data_dir +
        '/conversations/' + id + '_conversation.json', JSON.stringify(conversation.serialize()), 'utf8');
    }

    logger.log("Conversations saved.", 2);
  }


  /**
   * Load all conversations from file into memory.
   */
  static load_all() {
    logger.log("Loading conversations...", 2);

    fs.readdirSync(panoptykSettings.data_dir + '/conversations/').forEach(function(file) {
      const rawdata = fs.readFileSync(panoptykSettings.data_dir +
        '/conversations/' + file, 'utf8');

      const data = JSON.parse(rawdata);
      logger.log("Loading conversation " + data.id, 2);
      Conversation.load(data);
    });

    logger.log("Conversations loaded.", 2);
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
      logger.log("Tried to remove agent not in conversation " + this.id, 0);
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
      id: this.id,
      max_agents: this.max_agents,
      agent_ids: this.get_agent_ids()
    }
  }


  /**
   * Find a conversation given an id.
   * @param {int} id - id of conversation to find.
   * @return {Object/null}
   */
  static get_conversation_by_id(id) {
    if (Conversation.objects[id]) {
      return Conversation.objects[id];
    }

    logger.log("Could not find conversation with id " + id, 1);
    return null;
  }
}
