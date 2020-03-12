import { logger, LOG } from "../utilities/logger";
import { panoptykSettings } from "../utilities/util";
import { Item } from "./item";
import { IDObject } from "./idObject";
import { Room } from "./room";
import { Info } from "./information";
import { Conversation } from "./conversation";
import { Trade } from "./trade";
import { Quest } from "./quest";
import { Faction } from "./faction";

export class Agent extends IDObject {
  private _agentName: string;
  public get agentName(): string {
    return this._agentName;
  }
  private roomID: number;
  public get room(): Room {
    return this.roomID ? Room.getByID(this.roomID) : undefined;
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
  private _assignedQuests: Set<number>;
  private _closedAssignedQuests: Set<number>;
  private _givenQuests: Set<number>;
  private _closedGivenQuests: Set<number>;
  private _conversationID = 0;
  private _conversationRequests: Set<number>;
  private _conversationRequested: Set<number>;
  public get conversationRequested(): Agent[] {
    return Agent.getByIDs(Array.from(this._conversationRequested));
  }
  private _tradeRequests: Set<number>;
  /**
   * Get agents requesting trade with current this agent
   */
  public get tradeRequesters(): Agent[] {
    return Agent.getByIDs(Array.from(this._tradeRequests));
  }
  private _tradeRequested: Set<number>;
  public get tradeRequested(): Agent[] {
    return Agent.getByIDs(Array.from(this._tradeRequested));
  }
  private _gold: number;
  public get gold(): number {
    return this._gold;
  }
  private _faction: number;
  public get faction(): Faction {
    return this._faction ? Faction.getByID(this._faction) : undefined;
  }
  public set faction(newFaction: Faction) {
    this._faction = newFaction ? newFaction.id : 0;
  }
  /**
   * Returns numeric value of agent's rank or undefined if agent is not in a faction
   */
  public get factionRank(): number {
    if (this._faction) {
      return this.faction.getAgentRank(this);
    }
    return undefined;
  }
  private _agentStatus: Set<string>;
  public get agentStatus(): Set<string> {
    return this._agentStatus;
  }

  // Client-side filter tools
  private _infoToSort: Info[] = [];
  private _sortedInfo = {
    byAction: new Map<string, Set<number>>(),
    byAgent: new Map<number, Set<number>>(),
    byLoc: new Map<number, Set<number>>(),
    byItem: new Map<number, Set<number>>()
  };

  /**
   * Agent model.
   * @param {string} username - username of agent
   * @param {Room} room - room of agent. Does not put agent in room, simply saves it.
   * @param {int} id - id of agent. If undefined, one will be assigned.
   */
  constructor(username: string, room?: Room, id?: number) {
    super(Agent.name, id);
    this._agentName = username;
    this.roomID = room ? room.id : undefined;
    this.socket = undefined;
    this._inventory = new Set<number>();
    this._knowledge = new Set<number>();
    this._gold = 0;
    this._conversationRequests = new Set<number>();
    this._conversationRequested = new Set<number>();
    this._tradeRequests = new Set<number>();
    this._tradeRequested = new Set<number>();
    this._assignedQuests = new Set<number>();
    this._closedAssignedQuests = new Set<number>();
    this._givenQuests = new Set<number>();
    this._closedGivenQuests = new Set<number>();
    this._agentStatus = new Set<string>();

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
    a._conversationRequested = new Set<number>(a._conversationRequested);
    a._tradeRequests = new Set<number>(a._tradeRequests);
    a._tradeRequested = new Set<number>(a._tradeRequested);
    a._assignedQuests = new Set<number>(a._assignedQuests);
    a._closedAssignedQuests = new Set<number>(a._closedAssignedQuests);
    a._givenQuests = new Set<number>(a._givenQuests);
    a._closedGivenQuests = new Set<number>(a._closedGivenQuests);
    a._agentStatus = new Set<string>(a._agentStatus);
    return a;
  }

  /**
   * Sanatizes data to be serialized
   * @param removePrivateData {boolean} Determines if private is removed information that a client/agent
   *  may not be privy to.
   */
  public serialize(agent?: Agent, removePrivateData = false) {
    const safeAgent = Object.assign({}, this);
    safeAgent.socket = undefined;
    safeAgent._infoToSort = undefined;
    safeAgent._sortedInfo = undefined;
    (safeAgent._inventory as any) = Array.from(safeAgent._inventory);
    (safeAgent._knowledge as any) = Array.from(safeAgent._knowledge);
    (safeAgent._conversationRequests as any) = Array.from(
      safeAgent._conversationRequests
    );
    (safeAgent._conversationRequested as any) = Array.from(
      safeAgent._conversationRequested
    );
    (safeAgent._tradeRequests as any) = Array.from(safeAgent._tradeRequests);
    (safeAgent._tradeRequested as any) = Array.from(safeAgent._tradeRequested);
    (safeAgent._assignedQuests as any) = Array.from(safeAgent._assignedQuests);
    (safeAgent._closedAssignedQuests as any) = Array.from(safeAgent._closedAssignedQuests);
    (safeAgent._givenQuests as any) = Array.from(safeAgent._givenQuests);
    (safeAgent._closedGivenQuests as any) = Array.from(safeAgent._closedGivenQuests);
    (safeAgent._agentStatus as any) = Array.from(safeAgent._agentStatus);
    if (removePrivateData && agent !== this) {
      safeAgent._gold = 0;
      // safeAgent._inventory = undefined;
      safeAgent._knowledge = undefined;
      if (this.room !== agent.room) {
        safeAgent.roomID = 0;
      }
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
    let selAgent: Agent = Agent.getAgentByName(username);
    if (selAgent === undefined) {
      selAgent = new Agent(username);
      selAgent.roomID = panoptykSettings.default_room_id;
      selAgent.room.addAgent(selAgent);
    }
    selAgent.socket = socket;

    return selAgent;
  }

  /**
   * Called on agent logout.
   */
  logout() {
    this.removeStatus("online");
    logger.log("Agent " + this + " logged out.", 2);
    this.socket = undefined;
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
  static getAgentByName(name: string): Agent {
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
    return [];
  }

  public getInfoByLoc(room: Room): Info[] {
    const key = room ? room.id : 0;
    if (this._sortedInfo.byLoc.has(key)) {
      return Info.getByIDs(Array.from(this._sortedInfo.byLoc.get(key)));
    }
    return [];
  }

  public getInfoByAgent(agent: Agent): Info[] {
    const key = agent ? agent.id : 0;
    if (this._sortedInfo.byAgent.has(key)) {
      return Info.getByIDs(Array.from(this._sortedInfo.byAgent.get(key)));
    }
    return [];
  }

  public getInfoByItem(item: Item): Info[] {
    const key = item ? item.id : 0;
    if (this._sortedInfo.byItem.has(key)) {
      return Info.getByIDs(Array.from(this._sortedInfo.byItem.get(key)));
    }
    return [];
  }

  public sortInfo() {
    while (this._infoToSort.length > 0) {
      const info = this._infoToSort.pop();
      const action = info.action ? info.action : "none";
      let agent = info.agents[0];
      agent = agent ? agent : 0;
      let loc = info.locations[0];
      loc = loc ? loc : 0;
      let item = info.items[0];
      item = item ? item : 0;

      if (!this._sortedInfo.byAction.has(action)) {
        this._sortedInfo.byAction.set(action, new Set());
      }
      if (!this._sortedInfo.byAgent.has(agent)) {
        this._sortedInfo.byAgent.set(agent, new Set());
      }
      if (!this._sortedInfo.byLoc.has(loc)) {
        this._sortedInfo.byLoc.set(loc, new Set());
      }
      if (!this._sortedInfo.byItem.has(item)) {
        this._sortedInfo.byItem.set(item, new Set());
      }

      this._sortedInfo.byAction.get(action).add(info.id);
      this._sortedInfo.byAgent.get(agent).add(info.id);
      this._sortedInfo.byLoc.get(loc).add(info.id);
      this._sortedInfo.byItem.get(item).add(info.id);
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
    this.roomID = 0;
  }

  /**
   * Client: Check if agent has an active conversation request to other agent
   * @param other
   */
  public activeConversationRequestTo(other: Agent) {
    return this._conversationRequested.has(other.id);
  }

  /**
   * Client: Check if agent has an active trade request to other agent
   * @param other
   */
  public activeTradeRequestTo(other: Agent) {
    return this._tradeRequested.has(other.id);
  }

  /**
   * Server: Adds agent requesting a trade with toAgent
   * @param toAgent
   * @param agent
   */
  public static tradeRequest(toAgent: Agent, agent: Agent) {
    toAgent._tradeRequests.add(agent.id);
    agent._tradeRequested.add(toAgent.id);
  }

  /**
   * Server: Removes agents trade request to toAgent
   * @param toAgent
   * @param agent
   */
  public static removeTradeRequest(toAgent: Agent, agent: Agent) {
    toAgent._tradeRequested.delete(agent.id);
    agent._tradeRequests.delete(toAgent.id);
  }

  /**
   * Server: adds agent requesting a conversation with toAgent
   * @param agent Requesting agent
   */
  public static conversationRequest(toAgent: Agent, agent: Agent) {
    toAgent._conversationRequests.add(agent.id);
    agent._conversationRequested.add(toAgent.id);
  }

  /**
   * Server: Remove agent's request from set of conversation requests
   * @param agent
   */
  public static removeConversationRequest(toAgent: Agent, agent: Agent) {
    toAgent._conversationRequested.delete(agent.id);
    agent._conversationRequests.delete(toAgent.id);
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
    return this._conversationID > 0;
  }

  public get conversation(): Conversation {
    return this._conversationID
      ? Conversation.getByID(this._conversationID)
      : undefined;
  }

  public get trade(): Trade {
    return Trade.getActiveTradesWithAgent(this)[0];
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
   * Server: Removes quest from list of active quests for both
   * agents and adds it to closed list
   * @param quest
   */
  public static removeQuest(quest: Quest) {
    quest.receiver._assignedQuests.delete(quest.id);
    quest.receiver._closedAssignedQuests.add(quest.id);
    quest.giver._givenQuests.delete(quest.id);
    quest.giver._closedGivenQuests.add(quest.id);
  }

  /**
   * Server: Add quest to list of active quests for both agents
   * @param quest
   */
  public static addQuest(quest: Quest) {
    quest.receiver._assignedQuests.add(quest.id);
    quest.giver._givenQuests.add(quest.id);
  }

  /**
   * Remove an agent from the conversation.
   */
  public leaveConversation() {
    this._conversationID = 0;
  }

  /**
   * Server: Returns the agent's reference to targetInfo if it has one
   * @param targetInfo
   */
  public getInfoRef(targetInfo: Info): Info {
    if (this._knowledge.has(targetInfo.id)) return targetInfo;
    for (const agentInfo of this.knowledge) {
      if (agentInfo.equals(targetInfo)) return agentInfo;
    }
    return undefined;
  }

  /**
   * Checks if player has specific item.
   */
  public hasItem(item: Item): boolean {
    return this._inventory.has(item.id);
  }

  /**
   * Active Quests that have been assigned to this agent
   */
  public get activeAssignedQuests(): Quest[] {
    return Quest.getByIDs(Array.from(this._assignedQuests));
  }

  /**
   * Closed Quests that have been assigned to this agent
   */
  public get closedAssignedQuests(): Quest[] {
    return Quest.getByIDs(Array.from(this._closedAssignedQuests));
  }

  /**
   * Active Quests that have been given out by this agent
   */
  public get activeGivenQuests(): Quest[] {
    return Quest.getByIDs(Array.from(this._givenQuests));
  }

  /**
   * Closed Quests that have been given out by this agent
   */
  public get closedGivenQuests(): Quest[] {
    return Quest.getByIDs(Array.from(this._closedGivenQuests));
  }

  /**
   * Server: Modify agent's gold amount
   * @param amount
   */
  public modifyGold(amount: number) {
    this._gold += amount;
  }

  /**
   * Server
   * @param status
   */
  public addStatus(status: string) {
    this._agentStatus.add(status);
  }

  /**
   * Server
   * @param status
   */
  public removeStatus(status: string) {
    this._agentStatus.delete(status);
  }
}
