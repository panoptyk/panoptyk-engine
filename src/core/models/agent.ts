import { logger, LOG } from "../utilities/logger";
import { panoptykSettings } from "../utilities/util";
import { Item } from "./item";
import { IDObject } from "./idObject";
import { Room } from "./room";
import { Info } from "./information";
import { Conversation } from "./conversation";

export class Agent extends IDObject {
  private _agentName: string;
  public get agentName(): string {
    return this._agentName;
  }
  private roomID: number;
  public get room(): Room {
    return Room.getByID(this.roomID);
  }
  public socket: SocketIO.Socket;
  private inventory: Set<number>;
  private knowledge: Set<number>;
  private conversationID: number;
  private conversationRequests: Set<number>;

  /**
   * Agent model.
   * @param {string} username - username of agent
   * @param {Room} room - room id of agent. Does not put agent in room, simply saves it.
   * @param {int} id - id of agent. If undefined, one will be assigned.
   */
  constructor(
    username: string,
    room?: Room,
    id?: number
  ) {
    super(Agent.name, id);
    this._agentName = username;
    this.roomID = room ? room.id : undefined;
    this.socket = undefined;
    this.inventory = new Set<number>();
    this.knowledge = new Set<number>();
    this.conversationRequests = new Set<number>();

    logger.log("Agent " + this + " initialized.", 2);
  }

  /**
   * Load and initialize agent object from JSON.
   * @param {Agent} json - serialized agent JSON from file.
   */
  static load(json: Agent) {
    const a = new Agent(json._agentName, undefined, json.id);
    for (const key in json) {
      a[key] = json[key];
    }
    a.inventory = new Set<number>(a.inventory);
    a.knowledge = new Set<number>(a.knowledge);
    a.conversationRequests = new Set<number>(a.conversationRequests);
    return a;
  }

  /**
   * Sanatizes data to be serialized
   * @param removePrivateData {boolean} Determines if private is removed information that a client/agent
   *  may not be privy to.
   */
  public serialize(removePrivateData = false) {
    const safeAgent = Object.assign({}, this);
    safeAgent.socket = undefined;
    (safeAgent.inventory as any) = Array.from(safeAgent.inventory);
    (safeAgent.knowledge as any) = Array.from(safeAgent.knowledge);
    (safeAgent.conversationRequests as any) = Array.from(safeAgent.conversationRequests);
    return safeAgent;
  }

  // /**
  //  * Get the data object for this agent that other agent's can see.
  //  * @returns {Object}
  //  */
  // public getPublicData() {
  //   return {
  //     id: this.id,
  //     agentName: this.agentName,
  //     roomID: this.roomID,
  //     inventory: []
  //   };
  // }

  // /**
  //  * Get the data object for this agent that the owner agent can see.
  //  * @returns {Object}
  //  */
  // public getPrivateData() {
  //   const dat = this.getPublicData();
  //   dat.inventory = this.getInventoryData();
  //   return dat;
  // }

  toString() {
    return this.agentName + "(id#" + this.id + ")";
  }

  /**
   * Login an agent. Create new agent or update existing agent with new socket. Send out updates.
   * @param {string} username - username of agent.
   * @param {Object} socket - socket.io client socket object.
   */
  static login(username, socket: SocketIO.Socket) {
    let selAgent: Agent = undefined;

    for (const id in Agent.objects) {
      const agent = Agent.objects[id];
      if (agent.agentName === username) {
        selAgent = agent;
        break;
      }
    }

    if (selAgent === undefined) {
      selAgent = new Agent(username);
      selAgent.roomID = panoptykSettings.default_room_id;
      selAgent.room.addAgent(selAgent);
    }

    selAgent.socket = socket;
    // TODO server.send.login_complete(selAgent);
    // TODO server.control.add_agent_to_room(selAgent, server.models.Room.objects[selAgent.room]);

    return selAgent;
  }

  public static logoutAll() {
    for (const key in Agent.objects) {
      const agent: Agent = Agent.objects[key];
      if (agent.socket) {
        agent.logout();
      }
    }
  }

  /**
   * Static function. Find agent associated with a socket.
   * @param {Object} socket - Socket.io object
   * @returns {Object/undefined}
   */
  static getAgentBySocket(socket: SocketIO.Socket) {
    for (const id in Agent.objects) {
      const agent: Agent = Agent.objects[id];
      if (agent && agent.socket && agent.socket.id === socket.id) {
        return agent;
      }
    }

    return undefined;
  }

  /**
   * Static function. Find agent by name.
   * @param {string} name - Agent name
   * @returns {Agent/undefined}
   */
  static getAgentByName(name: string) {
    for (const id in Agent.objects) {
      const agent: Agent = Agent.objects[id];
      if (agent && agent._agentName === name) {
        return agent;
      }
    }
    return undefined;
  }

  /**
   * Add an item to agent's inventory.
   * @param {Item} item - item object
   */
  addItemInventory(item: Item) {
    this.inventory.add(item.id);
  }

  /**
   * Remove an item from agent inventory.
   * @param {Item} item - item object
   */
  removeItemInventory(item: Item) {
    const hasItem = this.inventory.has(item.id);

    if (hasItem) {
      logger.log(
        "Tried to remove invalid item " +
          item +
          " from agent " +
          this +
          ".",
        0
      );
      return false;
    }

    this.inventory.delete(item.id);
    return true;
  }

  /**
   * Add an info to agent's knowledge.
   * @param {Info} info - information on event
   */
  addInfoKnowledge(info) {
    this.knowledge.add(info.id);
  }

  /**
   * Remove an item from agent memory.
   * @param {Info} info - item object
   */
  removeInfoKnowledge(info: Info) {
    const index = this.knowledge.has(info.id);

    if (index) {
      logger.log(
        "Tried to remove invalid information " +
          info +
          " from agent " +
          this +
          ".",
        0
      );
      return false;
    }

    this.knowledge.delete(info.id);
    return true;
  }

  /**
   * Put agent in room.
   * @param {Room} newRoom - room to move to
   */
  putInRoom(newRoom: Room) {
    this.roomID = newRoom.id;
  }

  /**
   * Remove agent from room.
   */
  public removeFromRoom() {
    this.roomID = undefined;
    this.conversationRequests.clear();
  }

  /**
   * Get the data object for this agent's inventory.
   * @returns {Object}
   */
  public getInventoryData() {
    const dat = [];
    for (const item of this.inventory) {
      dat.push(Item[item]);
    }
    return dat;
  }

  /**
   * Called on agent logout.
   */
  logout() {
    logger.log("Agent " + this + " logged out.", 2);
    this.socket = undefined;

    // TODO server.control.remove_agent_from_room(this, undefined, false);
  }

  /**
   * Add agent to conversation.
   * @param {Object} conversation - conversation object.
   */
  joinConversation(conversation: Conversation) {
    // remove requests of people current in conversation
    for (const ID of conversation.get_agent_ids()) {
      this.conversationRequests.delete(ID);
    }
    this.conversationID = conversation.id;
  }

  conversationRequest(agentID: number) {
    this.conversationRequests.add(agentID);
  }

  /**
   * Remove an agent from its' conversation.
   */
  leaveConversation() {
    this.conversationID = undefined;
  }

  get conversation(): Conversation {
    return Conversation.getByID(this.conversationID);
  }
}
