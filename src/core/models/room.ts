import fs = require("fs");
import { logger } from "../utilities/logger";
import { panoptykSettings } from "../utilities/util";
import { Agent } from "./agent";
import { Item } from "./item";
import { Conversation } from "./conversation";
import { IDObject } from "./idObject";

export class Room extends IDObject {
  private name: string;
  private adjacents: number[];
  private occupants: number[];
  private items: number[];
  private conversations: number[];
  private maxOccupants: number;

  /**
   * Room model.
   * @param {string} name - name of room
   * @param {int} id - Room id, if null one will be assigned.
   */
  constructor(name, maxOccupants, id?) {
    super("Room", id);
    this.name = name;
    this.adjacents = [];
    this.occupants = [];
    this.items = [];
    this.conversations = [];
    this.maxOccupants = maxOccupants;

    logger.log(
      "Room " + this.name + " Initialized with id " + this.id + ".",
      2
    );
  }

  /**
   * Load a JSON object into memory.
   * @param {JSON} data - serialized room JSON.
   */
  static load(data) {
    const r = new Room(data.name, data.maxOccupants, data.id);
    for (const key in data) {
      r[key] = data[key];
    }
    return r;
  }

  /**
   * Allow movement from this room to another room.
   * @param {Object} otherRoom - room object to connect
   * @param {boolean} twoWay - allow movement from other room to this room, default true
   */
  connectRoom(otherRoom, twoWay = true) {
    this.adjacents.push(otherRoom);
    if (twoWay) {
      otherRoom.connectRoom(this, false);
    }

    logger.log(
      "Conected room " + this.name + " to room " + otherRoom.name + ".",
      2
    );
  }

  /**
   * Check if it's possible to move from this room to target room.
   * @param {Object} room2 - target room
   * @return {boolean}
   */
  isConnectedTo(room2) {
    return this.adjacents.indexOf(room2) !== -1;
  }

  /**
   * Add an agent to this room.
   * @param {Agent} agent - agent object to put in this room.
   */
  addAgent(agent: Agent, oldRoom?) {
    this.occupants.push(agent.id);
  }

  /**
   * Add an item to this room.
   * @param {Object} item - item to put in room.
   */
  addItem(item) {
    logger.log("Adding item " + item.name + " to room " + this.name, 2);
    this.items.push(item);
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
        this.name +
        ", index=" +
        this.items.indexOf(item),
      2
    );

    this.items.splice(this.items.indexOf(item), 1);
  }

  /**
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
      room_name: this.name,
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
