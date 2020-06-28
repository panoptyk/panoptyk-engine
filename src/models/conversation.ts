import { BaseModel, IModel } from ".";
import { IDatabase } from "../database/IDatabase";


export interface QuestionInfo {
  passers: number[];
  desiredInfo: string[];
}

export class Conversation extends BaseModel {
  toJSON(forClient: boolean, context: any): object {
    throw new Error("Method not implemented.");
  }
  displayName(): string {
    throw new Error("Method not implemented.");
  }
  toString(): string {
    throw new Error("Method not implemented.");
  }
}

  private roomID: number;
  private _maxAgents: number;
  public get maxAgents(): number {
    return this._maxAgents;
  }
  private _agentIDs: Set<number>;
  private _infoID: number;
  private _askedQuestions: Map<number, QuestionInfo>;
  public get askedQuestions(): Info[] {
    return Info.getByIDs(Array.from(this._askedQuestions.keys()));
  }

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
    this._askedQuestions = new Map();
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
    c._askedQuestions = new Map<number, QuestionInfo>(c._askedQuestions);
    return c;
  }

  /**
   * Sanatizes data to be serialized
   * @param removePrivateData {boolean} Determines if private is removed information that a client/agent
   *  may not be privy to.
   */
  public serialize(agent?: Agent, removePrivateData = false): Conversation {
    const safeConversation = Object.assign({}, this);
    (safeConversation._agentIDs as any) = Array.from(safeConversation._agentIDs);
    (safeConversation._askedQuestions as any) = Array.from(safeConversation._askedQuestions);
    if (removePrivateData && !this.contains_agent(agent)) {
      safeConversation._askedQuestions = undefined;
    }
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

  /**
   * Keeps track of question in this Conversation
   * @param question question asked in conversation
   */
  public logQuestion(question: Info, desiredInfo: string[]) {
    this._askedQuestions.set(question.id, {passers: [], desiredInfo});
  }

  /**
   * Checks if given agent has decided to pass on question
   * @param question question asked in conversation
   * @param agent agent to check
   */
  public agentPassedQuestion(question: Info, agent: Agent): boolean {
    return this._askedQuestions.get(question.id).passers.includes(agent.id);
  }

  /**
   * Checks what part of the question is being prioritized by asker
   * @param question question asked in conversation
   */
  public requestedInformation(question: Info): string[] {
    return this._askedQuestions.get(question.id).desiredInfo;
  }

  /**
   * Logs that agent has decided to pass on specified question
   * @param question question asked in conversation
   * @param agent current agent
   */
  public passOnQuestion(question: Info, agent: Agent) {
    this._askedQuestions.get(question.id).passers.push(agent.id);
  }

  /**
   * Checks if specified question has been asked on conversation
   * @param question question asked in conversation
   */
  public hasQuestion(question: Info) {
    return this._askedQuestions.has(question.id);
  }
}
