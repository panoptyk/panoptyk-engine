import fs = require("fs");
import { logger } from "../utilities/logger";
import { Agent } from "./agent";
import { Item } from "./item";
import { Conversation } from "./conversation";
import { IDObject } from "./idObject";

export class Room extends IDObject {
  private roomName: string;
  private adjacents: number[];
  private occupants: number[];
  private items: number[];
  private conversations: number[];
  private maxOccupants: number;

  /**
   * Room model.
   * @param {string} roomName - name of room
   * @param {int} id - Room id, if null one will be assigned.
   */
  constructor(roomName, maxOccupants, id?) {
    super("Room", id);
    this.roomName = roomName;
    this.adjacents = [];
    this.occupants = [];
    this.items = [];
    this.conversations = [];
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
    this.adjacents.push(otherRoom.id);
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
    return this.adjacents.indexOf(room.id) !== -1;
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
    this.items.push(item.id);
  }

  /**
   * Remove an item from this room.
   * @param {Object} item - item to remove.
   */
  removeItem(item) {
    logger.log(
      "Removing item " +
        item.name +
        " from room object " +
        this +
        ", index=" +
        this.items.indexOf(item),
      2
    );

    this.items.splice(this.items.indexOf(item), 1);
  }

  /**
<<<<<<< HEAD
=======
   * Removes an agent from this room.
   * @param {Object} agent - agent to remove
   * @param {Object} newRoom - room agent is heading to.
   */
  removeAgent(agent, newRoom) {
    const index = this.occupants.indexOf(agent);

    if (index === -1) {
      logger.log("Agent " + agent.agentName + " not in room " + this.name + ".", 0);
      return false;
    }

    this.occupants.splice(index, 1);
  }

  /**
>>>>>>> b51678ed6da2fec7f41d04a106ebec281f096e94
   * Get data to send to client.
   * @returns {Object}
   */
  getData() {
    const adjIds = [];
    for (const room of this.adjacents) {
      adjIds.push({ id: room, room_name: Room[room].name });
    }

    const conversationDatas = [];
    for (const conversation of this.conversations) {
      conversationDatas.push(Conversation[conversation].getData());
    }

    const data = {
      id: this.id,
      room_name: this.roomName,
      adjacent_rooms: adjIds,
      layout: {
        conversations: conversationDatas
      }
    };

    return data;
  }

  /**
   * Add a conversation to a room.
   * @param {Object} conversation - conversation to add to room.
   */
  addConversation(conversation) {
    this.conversations.push(conversation);
  }

  /**
   * Remove a conversation from this room.
   * @param {Object} conversation - conversation object.
   */
  removeConversation(conversation) {
    const index = this.conversations.indexOf(conversation);

    if (index === -1) {
      logger.log(
        "Could not remove conversation " + conversation.conversationId,
        0
      );
      return;
    }

    this.conversations.splice(index, 1);
  }

  /**
   * Get the data for agents in this room.
   * @returns {Agent}
   */
  getAgents(curAgent?: Agent) {
    const agents = [];
    for (const agent of this.occupants) {
      if (agent !== curAgent.id) {
        agents.push(Agent.getByID(agent));
      }
    }
    return agents;
  }

  /**
   * Get the data for items in this room.
   * @returns {Object}
   */
  getItems() {
    const itemsData = [];
    for (const item of this.items) {
      itemsData.push(Item[item].getData());
    }
    return itemsData;
  }
}
