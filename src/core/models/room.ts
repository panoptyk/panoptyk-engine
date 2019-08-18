import { logger } from "../utilities/logger";
import { Agent } from "./agent";
import { Item } from "./item";
import { Conversation } from "./conversation";
import { IDObject } from "./idObject";

export class Room extends IDObject {
  private _roomName: string;
  public get roomName(): string {
    return this._roomName;
  }
  private adjacent: number[];
  private occupants: number[];
  private itemIDs: number[];
  private conversationIDs: number[];
  private maxOccupants: number;

  /**
   * Room model.
   * @param {string} roomName - name of room
   * @param {int} id - Room id, if null one will be assigned.
   */
  constructor(roomName, maxOccupants, id?) {
    super("Room", id);
    this._roomName = roomName;
    this.adjacent = [];
    this.occupants = [];
    this.itemIDs = [];
    this.conversationIDs = [];
    this.maxOccupants = maxOccupants;

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
      r[key] = json[key];
    }
    return r;
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
    this.occupants.push(agent.id);
    if (oldRoom.removeAgent) {
      oldRoom.removeAgent(agent);
    }
  }

  /**
   * Removes an agent from this room.
   * @param {Agent} agent - agent to remove
   * @param {Room} newRoom - room agent is heading to.
   */
  removeAgent(agent: Agent, newRoom?: Room) {
    const index = this.occupants.indexOf(agent.id);

    if (index === -1) {
      logger.log("Agent " + agent + " not in room " + this + ".", 0);
      return false;
    }
    this.occupants.splice(index, 1);
    if (newRoom.addAgent) {
      newRoom.addAgent(agent);
    }
  }

  /**
   * Add an item to this room.
   * @param {Item} item - item to put in room.
   */
  addItem(item: Item) {
    logger.log("Adding item " + item + " to room " + this, 2);
    this.itemIDs.push(item.id);
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
        this +
        ", index=" +
        this.itemIDs.indexOf(item.id),
      2
    );

    this.itemIDs.splice(this.itemIDs.indexOf(item.id), 1);
  }

  /**
   * Add a conversation to a room.
   * @param {Conversation} conversation - conversation to add to room.
   */
  addConversation(conversation: Conversation) {
    this.conversationIDs.push(conversation.id);
  }

  /**
   * Remove a conversation from this room.
   * @param {Conversation} conversation - conversation object.
   */
  removeConversation(conversation: Conversation) {
    const index = this.conversationIDs.indexOf(conversation.id);

    if (index === -1) {
      logger.log(
        "Could not remove conversation id#" + conversation.id,
        0
      );
      return;
    }

    this.conversationIDs.splice(index, 1);
  }

  /**
   * Get the data for agents in this room.
   * @returns {Agent}
   */
  getAgents(curAgent?: Agent) {
    const agents = [];
    for (const agentID of this.occupants) {
      if (agentID !== curAgent.id) {
        agents.push(Agent.getByID(agentID));
      }
    }
    return agents;
  }

  /**
   * Get the data for items in this room.
   * @returns {Item[]}
   */
  getItems(): Item[] {
    const items = [];
    for (const itemID of this.itemIDs) {
      items.push(Item.getByID(itemID));
    }
    return items;
  }
}
