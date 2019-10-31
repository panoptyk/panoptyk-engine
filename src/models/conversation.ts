import { logger } from "../utilities/logger";
import { IDObject } from "./idObject";
import { Room } from "./room";
import { Agent } from "./agent";
import { Info } from "./information";

export class Conversation extends IDObject {

  private roomID: number;
  private _maxAgents: number;
  public get maxAgents(): number {
    return this._maxAgents;
  }
  private _agentIDs: Set<number>;
  private _infoID: number;

  /**
   * Conversation constructor.
   * @param {Room} room - room object conversation is in
   * @param {int} maxAgents - number of agents that can use this conversation at once.
   * @param {int} id - conversation id, if undefined one will be assigned.
   */
  constructor(room: Room, maxAgents = 4, id?) {
    super(Conversation.name, id);

    this._maxAgents = maxAgents;
    this._agentIDs = new Set();
    this.roomID = room.id;
    room.addConversation(this);

    logger.log("Conversation intialized in room " + room, 2);
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
    c._agentIDs = new Set<number>(c._agentIDs);
    return c;
  }

  /**
   * Sanatizes data to be serialized
   * @param removePrivateData {boolean} Determines if private is removed information that a client/agent
   *  may not be privy to.
   */
  public serialize(removePrivateData = false): Conversation {
    const safeConversation = Object.assign({}, this);
    (safeConversation._agentIDs as any) = Array.from(safeConversation._agentIDs);
    return safeConversation;
  }

  /**
   * Add an agent to this conversation.
   * @param {Object} agent - agent object
   */
  add_agent(agent: Agent) {
    this._agentIDs.add(agent.id);
  }


  /**
   * Remove an agent from this conversation.
   * @param {Object} agent - agent object.
   */
  remove_agent(agent: Agent) {
    this._agentIDs.delete(agent.id);
  }

  /**
   * Get a list of agents for this conversation.
   * @param {Agent} ignoreAgent - do not include this agent object in list. (Optional).
   * @return {[Agent]}
   */
  public getAgents(ignoreAgent?: Agent): Agent[] {
    const agents = [];
    for (const id of this._agentIDs) {
      const agent = Agent.getByID(id);
      if (agent !== ignoreAgent) {
        agents.push(agent);
      }
    }
    return agents;
  }

  get room(): Room {
    return Room.getByID(this.roomID);
  }

  contains_agent(agent: Agent): boolean {
    return this._agentIDs.has(agent.id);
  }

  set info(info: Info) {
    this._infoID = info.id;
  }

  get info(): Info {
    return Info.getByID(this._infoID);
  }
}
