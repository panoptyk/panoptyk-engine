import { logger } from "../utilities/logger";
import { IDObject } from "./idObject";
import { Room } from "./room";
import { Agent } from "./agent";

export class Conversation extends IDObject {

  private roomID: number;
  private maxAgents: number;
  private agents: number[];
  /**
   * Conversation constructor.
   * @param {Room} room - room object conversation is in
   * @param {int} maxAgents - number of agents that can use this conversation at once.
   * @param {int} id - conversation id, if undefined one will be assigned.
   */
  constructor(room: Room, maxAgents = 4, id?) {
    super(Conversation.name, id);

    this.maxAgents = maxAgents;
    this.agents = [];
    this.roomID = room.id;
    room.addConversation(this);

    logger.log("Conversation intialized in room " + room.id, 2);
  }


  /**
   * Create a conversation instance from JSON.
   * @param {JSON} data - serialized conversation json.
   */
  static load(data) {
    new Conversation(data.room, data.maxAgents, data.id);
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
    const index = this.agents.indexOf(agent);

    if (index === -1) {
      logger.log("Tried to remove agent not in conversation " + this.id, 0);
      return;
    }

    this.agents.splice(index);
  }


  /**
   * Get a list of agent ids for this conversation.
   * @param {Agent} ignoreAgent - do not include this agent object in list. (Optional).
   * @return {[int]}
   */
  get_agent_ids(ignoreAgent?: Agent) {
    const ids = [];
    for (const agent of this.agents) {
      if (agent !== ignoreAgent.id) {
        ids.push(agent);
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
      maxAgents: this.maxAgents,
      agent_ids: this.get_agent_ids()
    };
  }

  get room(): Room {
    return Room.getByID(this.roomID);
  }

}
