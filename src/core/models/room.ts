import { logger } from "../utilities/logger";
import { Agent } from "./agent";
import { Item } from "./item";
import { Conversation } from "./conversation";
import { IDObject } from "./idObject";

export class Room extends IDObject {
  readonly roomName: string;
  private adjacent: number[];
  private _occupants: Set<number>;
  public get occupants(): Set<number> {
    return this._occupants;
  }
  private itemIDs: Set<number>;
  private conversationIDs: Set<number>;
  private _maxOccupants: number;
  public get maxOccupants(): number {
    return this._maxOccupants;
  }

  /**
   * Room model.
   * @param {string} roomName - name of room
   * @param {int} id - Room id, if null one will be assigned.
   */
  constructor(roomName, maxOccupants, id?) {
    super(Room.name, id);
    this.roomName = roomName;
    this.adjacent = [];
    this._occupants = new Set<number>();
    this.itemIDs = new Set<number>();
    this.conversationIDs = new Set<number>();
    this._maxOccupants = maxOccupants;

    logger.log(
      "Room " + this + " Initialized.",
      2
    );
  }

  /**
   * Load a JSON object into memory.
   * @param {JSON} json - serialized room JSON.
   */
  static load(json: Room) {
    const r = new Room(json.roomName, json.maxOccupants, json.id);
    for (const key in json) {
      try {
        r[key] = json[key];
      } catch (err) {

      }
    }
    r._occupants = new Set<number>(r._occupants);
    r.itemIDs = new Set<number>(r.itemIDs);
    r.conversationIDs = new Set<number>(r.conversationIDs);
    return r;
  }

  /**
   * Sanatizes data to be serialized
   * @param removePrivateData {boolean} Determines if private is removed information that a client/agent
   *  may not be privy to.
   */
  public serialize(removePrivateData = false) {
    const safeRoom = Object.assign({}, this);
    (safeRoom._occupants as any) = Array.from(safeRoom._occupants);
    (safeRoom.itemIDs as any) = Array.from(safeRoom.itemIDs);
    (safeRoom.conversationIDs as any) = Array.from(safeRoom.conversationIDs);
    return safeRoom;
  }

  toString() {
    return this.roomName + " (id#" + this.id + ")";
  }

  /**
   * Allow movement from this room to another room.
   * @param {Room} otherRoom - room object to connect
   * @param {boolean} twoWay - allow movement from other room to this room, default true
   */
  connectRoom(otherRoom: Room, twoWay = true) {
    this.adjacent.push(otherRoom.id);
    if (twoWay) {
      otherRoom.connectRoom(this, false);
    }

    logger.log("Conected room " + this + " to room " + otherRoom + ".", 2);
  }

  /**
   * Check if it's possible to move from this room to target room.
   * @param {Room} room - target room
   * @return {boolean}
   */
  isConnectedTo(room: Room) {
    return this.adjacent.indexOf(room.id) !== -1;
  }

  /**
   * Add an agent to this room.
   * @param {Agent} agent - agent object to put in this room.
   */
  addAgent(agent: Agent, oldRoom?: Room) {
    this._occupants.add(agent.id);
    if (oldRoom) {
      oldRoom.removeAgent(agent);
    }
  }

  /**
   * Removes an agent from this room.
   * @param {Agent} agent - agent to remove
   * @param {Room} newRoom - room agent is heading to.
   */
  removeAgent(agent: Agent, newRoom?: Room) {
    const index = this._occupants.has(agent.id);

    if (index) {
      logger.log("Agent " + agent + " not in room " + this + ".", 0);
      return false;
    }
    this._occupants.delete(agent.id);
    if (newRoom) {
      newRoom.addAgent(agent);
    }
  }

  /**
   * Add an item to this room.
   * @param {Item} item - item to put in room.
   */
  addItem(item: Item) {
    logger.log("Adding item " + item + " to room " + this, 2);
    this.itemIDs.add(item.id);
  }

  /**
   * Remove an item from this room.
   * @param {Item} item - item to remove.
   */
  removeItem(item: Item) {
    logger.log(
      "Removing item " +
        item +
        " from room " +
        this,
      2
    );

    this.itemIDs.delete(item.id);
  }

  /**
   * Add a conversation to a room.
   * @param {Conversation} conversation - conversation to add to room.
   */
  addConversation(conversation: Conversation) {
    this.conversationIDs.add(conversation.id);
  }

  /**
   * Remove a conversation from this room.
   * @param {Conversation} conversation - conversation object.
   */
  removeConversation(conversation: Conversation) {
    const index = this.conversationIDs.has(conversation.id);

    if (index) {
      logger.log(
        "Could not remove conversation id#" + conversation.id,
        0
      );
      return;
    }

    this.conversationIDs.delete(conversation.id);
  }

  /**
   * Get the data for agents in this room.
   * @returns {Agent}
   */
  public getAgents(curAgent?: Agent) {
    const agents = [];
    for (const agentID of this._occupants) {
      if (!curAgent || agentID !== curAgent.id) {
        agents.push(Agent.getByID(agentID));
      }
    }
    return agents;
  }

  /**
   * Get array of adjacent rooms
   * @return {Room[]}
   */
  public getAdjacentRooms(): Room[] {
    return Room.getByIDs(this.adjacent);
  }

  /**
   * Get the data for items in this room.
   * @returns {Item[]}
   */
  public getItems(): Item[] {
    const items = [];
    for (const itemID of this.itemIDs) {
      items.push(Item.getByID(itemID));
    }
    return items;
  }
}
