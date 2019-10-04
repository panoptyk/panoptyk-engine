import { logger } from "../utilities/logger";
import { IDObject } from "./idObject";
import { Room } from "./room";
import { Agent } from "./agent";

export class Conversation extends IDObject {

  private roomID: number;
  private _maxAgents: number;
  public get maxAgents(): number {
    return this._maxAgents;
  }
  private agentIDs: number[];


  /**
   * Conversation constructor.
   * @param {Room} room - room object conversation is in
   * @param {int} maxAgents - number of agents that can use this conversation at once.
   * @param {int} id - conversation id, if undefined one will be assigned.
   */
  constructor(room: Room, maxAgents = 4, id?) {
    super(Conversation.name, id);

    this._maxAgents = maxAgents;
    this.agentIDs = [];
    this.roomID = room.id;
    room.addConversation(this);

    logger.log("Conversation intialized in room " + room.id, 2);
  }

  /**
   * Create a conversation instance from JSON.
   * @param {Conversation} json - serialized conversation json.
   */
  static load(json: Conversation) {
    let c: Conversation = Conversation.objects[json.id];
    c = c ? c : new Conversation(Room.getByID(json.roomID), json._maxAgents, json.id);
    for (const key in json) {
      c[key] = json[key];
    }
  }

  /**
   * Sanatizes data to be serialized
   * @param removePrivateData {boolean} Determines if private is removed information that a client/agent
   *  may not be privy to.
   */
  public serialize(removePrivateData = false): Conversation {
    const safeAgent = Object.assign({}, this);
    return safeAgent;
  }

  /**
   * Add an agent to this conversation.
   * @param {Object} agent - agent object
   */
  add_agent(agent: Agent) {
    this.agentIDs.push(agent.id);
  }


  /**
   * Remove an agent from this conversation.
   * @param {Object} agent - agent object.
   */
  remove_agent(agent: Agent) {
    const index = this.agentIDs.indexOf(agent.id);

    if (index === -1) {
      logger.log("Tried to remove agent not in conversation " + this.id, 0);
      return;
    }

    this.agentIDs.splice(index);
  }

  /**
   * Get a list of agent ids for this conversation.
   * @param {Agent} ignoreAgent - do not include this agent object in list. (Optional).
   * @return {[int]}
   */
  get_agent_ids(ignoreAgent?: Agent) {
    const ids = [];
    for (const agent of this.agentIDs) {
      if (agent !== ignoreAgent.id) {
        ids.push(agent);
      }
    }
    return ids;
  }

  get room(): Room {
    return Room.getByID(this.roomID);
  }

  contains_agent(agent: Agent): boolean {
    return this.agentIDs.indexOf(agent.id) !== -1;
  }

}
