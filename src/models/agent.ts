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
  private _inventory: Set<number>;
  public get inventory(): Item[] {
    return Item.getByIDs(Array.from(this._inventory));
  }
  private _knowledge: Set<number>;
  public get knowledge(): Info[] {
    return Info.getByIDs(Array.from(this._knowledge));
  }
  private _conversationID = 0;
  private _conversationRequests: Set<number>;

  // Client-side filter tools
  private _infoToSort: Info[] = [];
  private _sortedInfo = {
    byAction: new Map<string, Set<number>>(),
    byAgent: new Map<number, Set<number>>(),
    byLoc: new Map<number, Set<number>>()
  };

  /**
   * Agent model.
   * @param {string} username - username of agent
   * @param {Room} room - room id of agent. Does not put agent in room, simply saves it.
   * @param {int} id - id of agent. If undefined, one will be assigned.
   */
  constructor(username: string, room?: Room, id?: number) {
    super(Agent.name, id);
    this._agentName = username;
    this.roomID = room ? room.id : undefined;
    this.socket = undefined;
    this._inventory = new Set<number>();
    this._knowledge = new Set<number>();
    this._conversationRequests = new Set<number>();

    logger.log("Agent " + this + " initialized.", 2);
  }

  /**
   * Load and initialize agent object from JSON.
   * @param {Agent} json - serialized agent JSON from file.
   */
  static load(json: Agent) {
    let a: Agent = Agent.objects[json.id];
    a = a ? a : new Agent(json._agentName, undefined, json.id);
    for (const key in json) {
      a[key] = json[key];
    }
    a._inventory = new Set<number>(a._inventory);
    a._knowledge = new Set<number>(a._knowledge);
    a._conversationRequests = new Set<number>(a._conversationRequests);
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
    safeAgent._infoToSort = undefined;
    safeAgent._sortedInfo = undefined;
    (safeAgent._inventory as any) = Array.from(safeAgent._inventory);
    (safeAgent._knowledge as any) = Array.from(safeAgent._knowledge);
    (safeAgent._conversationRequests as any) = Array.from(
      safeAgent._conversationRequests
    );
    if (removePrivateData) {
      safeAgent._inventory = undefined;
      safeAgent._knowledge = undefined;
    }
    return safeAgent;
  }

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

  /**
   * Called on agent logout.
   */
  logout() {
    logger.log("Agent " + this + " logged out.", 2);
    this.socket = undefined;
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
    this._inventory.add(item.id);
  }

  /**
   * Remove an item from agent inventory.
   * @param {Item} item - item object
   */
  removeItemInventory(item: Item) {
    const hasItem = this._inventory.has(item.id);

    if (!hasItem) {
      logger.log(
        "Tried to remove invalid item " + item + " from agent " + this + ".",
        0
      );
      return false;
    }

    this._inventory.delete(item.id);
    return true;
  }

  /**
   * Add an info to agent's knowledge.
   * @param {Info} info - information on event
   */
  addInfoKnowledge(info) {
    this._knowledge.add(info.id);
  }

  /**
   * Remove an item from agent memory.
   * @param {Info} info - item object
   */
  public removeInfoKnowledge(info: Info) {
    const has = this._knowledge.has(info.id);

    if (has) {
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

    this._knowledge.delete(info.id);
    return true;
  }

  // Client-side filtering of information ===========================================

  public addInfoToBeSorted(info: Info) {
    if (info && !info.isMaster() && info.owner.id === this.id) {
      this._infoToSort.push(info);
    }
  }
  public infoNeedsSorting(): boolean {
    return this._infoToSort.length > 0;
  }

  public getInfoByAction(action: string): Info[] {
    const key = action ? action : "none";
    if (this._sortedInfo.byAction.has(key)) {
      return Info.getByIDs(Array.from(this._sortedInfo.byAction.get(key)));
    }
    return undefined;
  }

  public getInfoByLoc(room: Room): Info[] {
    const key = room ? room.id : 0;
    if (this._sortedInfo.byLoc.has(key)) {
      return Info.getByIDs(Array.from(this._sortedInfo.byLoc.get(key)));
    }
    return undefined;
  }

  public getInfoByAgent(agent: Agent): Info[] {
    const key = agent ? agent.id : 0;
    if (this._sortedInfo.byAgent.has(key)) {
      return Info.getByIDs(Array.from(this._sortedInfo.byAgent.get(key)));
    }
    return undefined;
  }

  public sortInfo() {
    while (this._infoToSort.length > 0) {
      const info = this._infoToSort.pop();
      const action = info.action ? info.action : "none";
      let agent = info.agents[0];
      agent = agent ? agent : 0;
      let loc = info.locations[0];
      loc = loc ? loc : 0;

      if (!this._sortedInfo.byAction.has(action)) {
        this._sortedInfo.byAction.set(action, new Set());
      }
      if (!this._sortedInfo.byAgent.has(agent)) {
        this._sortedInfo.byAgent.set(agent, new Set());
      }
      if (!this._sortedInfo.byLoc.has(loc)) {
        this._sortedInfo.byLoc.set(loc, new Set());
      }

      this._sortedInfo.byAction.get(action).add(info.id);
      this._sortedInfo.byAgent.get(agent).add(info.id);
      this._sortedInfo.byLoc.get(loc).add(info.id);
    }
  }
  // =============================================================================

  /**
   * Put agent in room.
   * @param {Room} newRoom - room to move to
   */
  public putInRoom(newRoom: Room) {
    this.roomID = newRoom.id;
  }

  /**
   * Remove agent from room.
   */
  public removeFromRoom() {
    this.roomID = undefined;
    this._conversationRequests.clear();
  }

  /**
   * adds agent requesting a conversation with this agent
   * @param agent Requesting agent
   */
  public conversationRequest(agent: number) {
    this._conversationRequests.add(agent);
  }

  /**
   * All agent's requesting conversations with this agent
   */
  public get conversationRequesters(): Agent[] {
    return Agent.getByIDs(Array.from(this._conversationRequests));
  }

  /**
   * Returns true if agent is in a conversation
   */
  public inConversation() {
    return this._conversationID;
  }

  public get conversation(): Conversation {
    return this._conversationID
      ? Conversation.getByID(this._conversationID)
      : undefined;
  }

  /**
   * Add agent to conversation.
   * @param {Object} conversation - conversation object.
   */
  public joinConversation(conversation: Conversation) {
    // remove requests of people current in conversation
    for (const agent of conversation.getAgents()) {
      this._conversationRequests.delete(agent.id);
    }
    this._conversationID = conversation.id;
  }

  /**
   * Remove an agent from the conversation.
   */
  public leaveConversation() {
    this._conversationID = 0;
  }

  /**
   * Checks if player knows specific info.
   */
  public hasKnowledge(info: Info) {
    return this._knowledge.has(info.id);
  }

  /**
   * Checks if player has specific item.
   */
  public hasItem(item: Item) {
    return this._inventory.has(item.id);
  }
}
