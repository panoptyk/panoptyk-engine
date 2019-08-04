import fs = require("fs");
import { logger } from "../utilities/logger";
import { panoptykSettings } from "../utilities/util";
import { Item } from "./item";
import { IDObject } from "./idObject";

export class Agent extends IDObject {
  private _agentName: string;
  public get agentName(): string {
    return this._agentName;
  }
  private _room: number;
  public get room(): number {
    return this._room;
  }
  private socket;
  private inventory: number[];
  private knowledge: number[];
  private conversation: number[];
  private conversationRequests = new Map();

  /**
   * Agent model.
   * @param {string} username - username of agent
   * @param {int} room - room id of agent. Does not put agent in room, simply saves it.
   * @param {[int]} inventory - list of items that agent owns.
   * @param {[int]} knowledge - list of items that agent owns.
   * @param {int} id - id of agent. If undefined, one will be assigned.
   */
  constructor(
    username: string,
    room: number = undefined,
    inventory: number[] = [],
    knowledge: number[] = [],
    id: number = undefined
  ) {
    super("Agent", id);
    this._agentName = username;
    this._room = room;
    this.socket = undefined;
    this.inventory = inventory;
    this.knowledge = knowledge;
    this.conversation = undefined;

    logger.log("Agent " + this._agentName + " initialized.", 2);
  }

  /**
   * Load and initialize agent object from JSON.
   * @param {dict} data - serialized agent JSON.
   */
  static load(data) {
    const inventory = [];
    const knowledge = [];
    // load items (handled by items)

    new Agent(data.name, data.room_id, inventory, knowledge, data.id);
  }

  /**
   * Login an agent. Create new agent or update existing agent with new socket. Send out updates.
   * @param {string} username - username of agent.
   * @param {Object} socket - socket.io client socket object.
   */
  static login(username, socket) {
    let selAgent = undefined;

    for (const id in Agent.objects) {
      const agent = Agent.objects[id];
      if (agent.agentName === username) {
        selAgent = agent;
        break;
      }
    }

    if (selAgent === undefined) {
      selAgent = new Agent(username, panoptykSettings.default_room_id);
    }

    selAgent.socket = socket;
    // TODO server.send.login_complete(selAgent);
    // TODO server.control.add_agent_to_room(selAgent, server.models.Room.objects[selAgent.room]);

    return selAgent;
  }

  /**
   * Get JSON dictionary representing this agent.
   * @returns {JSON}
   */
  serialize() {
    const data = {
      name: this.agentName,
      room_id: this._room,
      inventory: this.inventory,
      id: this.id
    };
    return data;
  }

  /**
   * TODO: Look at this function
   * Static function. Find agent associated with a socket.
   * @param {Object} socket - Socket.io object
   * @returns {Object/undefined}
   */
  static get_agent_by_socket(socket) {
    for (const id in Agent.objects) {
      const agent = Agent.objects[id];
      if (agent.socket === socket) {
        return agent;
      }
    }

    logger.log("Could not find agent with socket " + socket.id + ".", 1);
    return undefined;
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

    if (index === -1) {
      logger.log(
        "Tried to remove invalid item " +
          item.name +
          " from agent " +
          this.agentName +
          ".",
        0
      );
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
      logger.log(
        "Tried to remove invalid information " +
          info.id +
          " from agent " +
          this.agentName +
          ".",
        0
      );
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
    this._room = new_room.room_id;
  }

  /**
   * Remove agent from room.
   */
  remove_from_room() {
    this._room = undefined;
    this.conversationRequests = new Map();
  }

  /**
   * Get the data object for this agent's inventory.
   * @returns {Object}
   */
  get_inventory_data() {
    var dat = [];
    for (let item of this.inventory) {
      dat.push(Item[item]);
    }
    return dat;
  }

  /**
   * Get the data object for this agent that other agent's can see.
   * @returns {Object}
   */
  get_public_data() {
    return {
      id: this.id,
      agent_name: this.agentName,
      room_id: this._room,
      inventory: []
    };
  }

  /**
   * Get the data object for this agent that the owner agent can see.
   * @returns {Object}
   */
  get_private_data() {
    let dat = this.get_public_data();
    dat.inventory = this.get_inventory_data();
    return dat;
  }

  /**
   * Called on agent logout.
   */
  logout() {
    logger.log("Agent " + this.agentName + " logged out.", 2);

    //TODO server.control.remove_agent_from_room(this, undefined, false);
  }

  /**
   * Add agent to conversation.
   * @param {Object} conversation - conversation object.
   */
  join_conversation(conversation) {
    this.conversationRequests = new Map();
    this.conversation = conversation;
  }

  /**
   * Remove an agent from its' conversation.
   */
  leave_conversation() {
    this.conversation = undefined;
  }
}
