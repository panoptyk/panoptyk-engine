import { Agent } from "./agent";
import { IDObject } from "./idObject";
import { Room } from "./room";
import { Item } from "./item";
import * as _ from "lodash";
import { Faction } from "./faction";

export interface Ipredicate {
  name: string;
  create: (payload: object, type: string) => Info;
  getTerms: (info: Info) => any;
}

export interface Iaction {
  name: string;
  predicate: string;
  create: (payload: object, type: string) => Info;
  question: (payload: object) => object;
  getTerms: (info: Info) => any;
}

export interface TAL {
  time: number;
  agent: Agent;
  loc: Room;
}

export interface TALL {
  time: number;
  agent: Agent;
  loc1: Room;
  loc2: Room;
}

export interface TAF {
  time: number;
  agent: Agent;
  faction: Faction;
}

export interface TAA {
  time: number;
  agent1: Agent;
  agent2: Agent;
}

export interface TAK {
  time: number;
  agent: Agent;
  info: Info;
}

export interface TAAL {
  time: number;
  agent1: Agent;
  agent2: Agent;
  loc: Room;
}

export interface TAALK {
  time: number;
  agent1: Agent;
  agent2: Agent;
  loc: Room;
  info: Info;
}

export interface TAILQ {
  time: number;
  agent: Agent;
  item: Item;
  loc: Room;
  quantity: number;
}

export interface TAAILQ {
  time: number;
  agent1: Agent;
  agent2: Agent;
  item: Item;
  loc: Room;
  quantity: number;
}

export interface TILQ {
  time: number;
  item: Item;
  loc: Room;
  quantity: number;
}

export class Info extends IDObject {
  private _time: number;
  public get time(): number {
    if (this._reference) {
      return Info.getByID(this._infoID)._time;
    }
    return this._time;
  }
  private _query = false;
  private _command = false;
  private _reference = false;
  private _action?: string;
  public get action(): string {
    if (this._reference) {
      return Info.getByID(this._infoID)._action;
    }
    return this._action;
  }
  public set action(value: string) {
    this._action = value;
  }
  private _predicate?: string;
  public get predicate(): string {
    if (this._reference) {
      return Info.getByID(this._infoID)._predicate;
    }
    return this._predicate;
  }
  public set predicate(value: string) {
    this._predicate = value;
  }
  private _owner?: number;
  public get owner(): Agent {
    return Agent.getByID(this._owner);
  }
  public set owner(value: Agent) {
    this._owner = value.id;
  }
  private _location: number[] = [];
  public get locations(): number[] {
    if (this._reference) {
      return Info.getByID(this._infoID)._location;
    }
    return this._location;
  }
  private _agent: number[] = [];
  public get agents(): number[] {
    if (this._reference) {
      return Info.getByID(this._infoID)._agent;
    }
    return this._agent;
  }
  private _item: number[] = [];
  public get items(): number[] {
    if (this._reference) {
      return Info.getByID(this._infoID)._item;
    }
    return this._item;
  }
  private _quantity: number[] = [];
  public get quantities(): number[] {
    if (this._reference) {
      return Info.getByID(this._infoID)._quantity;
    }
    return this._quantity;
  }
  private _faction: number[] = [];
  public get factions(): number[] {
    if (this._reference) {
      return Info.getByID(this._infoID)._faction;
    }
    return this._faction;
  }
  private _infoID?: number;
  public get infoID(): number {
    return this._infoID;
  }
  public get infoRef(): number {
    if (this._replacementInfoID) {
      return this._replacementInfoID;
    } else if (this._reference) {
      return Info.getByID(this._infoID)._infoID;
    }
    return this._infoID;
  }
  private _replacementInfoID?: number;
  private _mask: object = {};
  public get mask(): object {
    return this._mask;
  }

  private _agentCopies: Map<number, number>;
  /**
   * Server: Gets an agent's personal copy of given information
   * @param agent
   */
  public getAgentsCopy(agent: Agent): Info {
    if (agent && this._agentCopies.has(agent.id)) {
      return Info.getByID(this._agentCopies.get(agent.id));
    }
    return undefined;
  }

  /**
   * Info model.
   * @param {Agent} owner - Agent who owns this info
   * @param {number} time - Time information/event happened (possible predicate term)
   * @param {number} infoID - possible predicate pointing to other info needed
   * @param {number} id - id of item. If undefined, one will be assigned
   */
  constructor(time: number, infoID?: number, id?: number) {
    super(Info.name, id);
    this._time = time;
    this._infoID = infoID;
    this._agentCopies = new Map<number, number>();
  }

  /**
   * Is this a piece of query information as part of an ASK or other action
   * @returns {boolean} True if information is a query
   */
  public isQuery(): boolean {
    return this._query;
  }

  /**
   * Is this a piece of command information as part of an COMMAND or other action
   * @returns {boolean} True if information is a command
   */
  public isCommand(): boolean {
    return this._command;
  }

  toString() {
    return "(id#" + this.id + ")";
  }

  /**
   * Returns true if other is the same piece of info or a reference of it
   * @param other
   */
  public equals(other: Info): boolean {
    const otherID = other._reference ? other.infoID : other.id;
    const thisID = this._reference ? this.infoID : this.id;
    return thisID === otherID;
  }

  /**
   * creates formatted question data from a query info object
   */
  public toQuestion() {
    if (!this._query) {
      return undefined;
    }
    const a: Iaction = Info.ACTIONS[this.action];
    return a.question(a.getTerms(this));
  }

  /**
   * Is this a reference to a master copy of information
   * @returns {boolean} is a reference owned by an agent of a master-copy information
   */
  public isReference(): boolean {
    return this._reference;
  }

  /** This is the master copy of a piece of info.
   *  It is referenced by other Information objects for each agent who owns this info.
   */
  public isMaster(): boolean {
    return !this._reference;
  }

  /**
   * Is the information object's info masked to the owner
   */
  public isMasked(): boolean {
    for (const key in this._mask) {
      if (this._mask[key] === "mask") {
        return true;
      }
    }
    return false;
  }

  /**
   * Creates a new copy that references old info for recieving Agent to own
   * @param {Agent} owner - Agent who owns this info
   * @param {number} time - Time information was copied
   */
  public makeCopy(owner: Agent, time: number): Info {
    const masterCpy: Info = this._reference ? Info.getByID(this._infoID) : this;
    const i = new Info(time, masterCpy.id);
    i._query = this._query;
    i._command = this._command;
    i._owner = owner.id;
    i._mask = this.mask;
    i._reference = true;
    masterCpy._agentCopies.set(owner.id, i.id);
    i._agentCopies = masterCpy._agentCopies;
    return i;
  }

  /**
   * Server: Sets the info that would be used in place of its parent's infoID
   * @param info
   */
  public setReplacementInfo(info: Info) {
    this._replacementInfoID = info.id;
  }

  /**
   * Server: Removes mask so that referenced item is accessed instead.
   * WARNING: The original copy must still be sent to the client.
   */
  public removeMask() {
    this._mask = {};
  }

  /**
   * Server: Set a mask on any specific term of the action.
   * Use Info.prototype.getTerms() for terms
   * @param mask Object containing terms set to "mask" to be masked
   */
  public setMask(mask: object) {
    this._mask = mask;
  }

  /**
   * Server: Sets a new mask that only contains values that are
   * masked in both the current mask and the incoming mask. This is
   * used to reduce the mask when dealing with two pieces of partial
   * info.
   * @param mask
   */
  public simplifyMask(mask: object) {
    const newMask = {};
    for (const key in this._mask) {
      if (key in mask) {
        newMask[key] = mask[key];
      }
    }
    this._mask = newMask;
  }

  public static applyMask(info: Info, mask) {
    for (const key in mask) {
      if (mask[key] === "mask") {
        if (key === "time") {
          info._time = undefined;
        } else if (key === "agent" || key === "agent1") {
          info._agent[0] = undefined;
        } else if (key === "agent2") {
          info._agent[1] = undefined;
        } else if (key === "loc" || key === "loc1") {
          info._location[0] = undefined;
        } else if (key === "loc2") {
          info._location[1] = undefined;
        } else if (key === "faction") {
          info._faction = undefined;
        } else if (key === "quantity") {
          info._quantity = undefined;
        } else if (key === "info") {
          info._infoID = undefined;
        } else if (key === "item") {
          info._item[0] = undefined;
        }
      }
    }
  }

  /**
   * Retrieve relevant terms from this information object
   */
  public getTerms() {
    return Info.ACTIONS[this.action].getTerms(this);
  }

  /**
   * Pass JSON parsed object to be loaded in as info
   * @param {Object} json
   */
  static load(json: Info) {
    let i = Info.objects[json.id];
    i = i ? i : new Info(json.time, json._infoID, json.id);
    for (const key in json) {
      i[key] = json[key];
    }
    i._agentCopies = new Map<number, number>(i._agentCopies);
    return i;
  }

  /**
   * Sanatizes data to be serialized
   * @param removePrivateData {boolean} Determines if public is removed information that a client/agent
   *  may not be privy to.
   */
  public serialize(agent?: Agent, removePrivateData = false): Info {
    const safeObj: Info = _.cloneDeep(this);
    (safeObj._agentCopies as any) = Array.from(safeObj._agentCopies);

    if (removePrivateData) {
      const mask = this.getAgentsCopy(agent)
        ? this.getAgentsCopy(agent).mask
        : {};

      safeObj.setMask(mask);
      Info.applyMask(safeObj, mask);
      safeObj._agentCopies = undefined;
    }
    return safeObj;
  }

  /**
   * Check if info answers question's specified wantedTerms
   * @param question
   * @param wantedTerms
   */
  public isAnswer(question: Info, wantedTerms = {}): boolean {
    if (question.action && this.action !== question.action) {
      return false;
    }
    const questionTerms = question.getTerms();
    const answerTerms = this.getTerms();
    // make sure answer has same known info as question
    for (const key in questionTerms) {
      if (
        (questionTerms[key] !== undefined &&
          questionTerms[key] !== answerTerms[key]) ||
        (key in wantedTerms &&
          (answerTerms[key] === undefined || this._mask[key] === "mask"))
      ) {
        return false;
      }
    }
    return true;
  }

  // public static addPredicate(Ipredicate) TODO

  // Predicate types
  static PREDICATE = {
    TAL: {
      name: "TAL", // predicate(Time, Agent, Location)
      /**
       * Creates an action that uses this predicate format
       *   predicate(Time, Agent, Location)
       */
      create({ time, agent, loc }: TAL, type: string): Info {
        const i = new Info(time);
        i._predicate = Info.PREDICATE.TAL.name;
        i._agent[0] = agent ? agent.id : undefined;
        i._location[0] = loc ? loc.id : undefined;
        switch (type) {
          case "question": {
            i._query = true;
            break;
          }
          case "command": {
            i._command = true;
            break;
          }
        }
        return i;
      },
      /**
       * returns labeled object of all the important terms for this predicate type
       * @param i information in question
       */
      getTerms(info: Info): { predicate: string } & TAL {
        return {
          predicate: Info.PREDICATE.TAL.name,
          time: info.time,
          agent: Agent.getByID(info.agents[0]),
          loc: Room.getByID(info.locations[0])
        };
      }
    },
    TALL: {
      name: "TALL", // predicate(Time, Agent, Location, Location)
      /**
       * Creates an action that uses this predicate format
       *   predicate(Time, Agent, Location, Location)
       */
      create({ time, agent, loc1, loc2 }: TALL, type: string): Info {
        const i = new Info(time);
        i._predicate = Info.PREDICATE.TALL.name;
        i._agent[0] = agent ? agent.id : undefined;
        i._location[0] = loc1 ? loc1.id : undefined;
        i._location[1] = loc2 ? loc2.id : undefined;
        switch (type) {
          case "question": {
            i._query = true;
            break;
          }
          case "command": {
            i._command = true;
            break;
          }
        }
        return i;
      },
      /**
       * returns labeled object of all the important terms for this predicate type
       * @param i information in question
       */
      getTerms(info: Info): { predicate: string } & TALL {
        return {
          predicate: Info.PREDICATE.TALL.name,
          time: info.time,
          agent: Agent.getByID(info.agents[0]),
          loc1: Room.getByID(info.locations[0]),
          loc2: Room.getByID(info.locations[1])
        };
      }
    },
    TAF: {
      name: "TAF", // predicate(Time, Agent, Faction)
      /**
       * Creates an action that uses this predicate format
       *   predicate(Time, Agent, Faction)
       */
      create({ time, agent, faction }: TAF, type: string): Info {
        const i = new Info(time);
        i._predicate = Info.PREDICATE.TAF.name;
        i._agent[0] = agent ? agent.id : undefined;
        i._faction[0] = faction ? faction.id : undefined;
        switch (type) {
          case "question": {
            i._query = true;
            break;
          }
          case "command": {
            i._command = true;
            break;
          }
        }
        return i;
      },
      /**
       * returns labeled object of all the important terms for this predicate type
       * @param {info} i information in question
       */
      getTerms(info: Info): { predicate: string } & TAF {
        return {
          predicate: Info.PREDICATE.TAF.name,
          time: info.time,
          agent: Agent.getByID(info.agents[0]),
          faction: Faction.getByID(info.factions[0])
        };
      }
    },
    TAA: {
      name: "TAA", // predicate(Time, Agent, Agent)
      /**
       * Creates an action that uses this predicate format
       *   predicate(Time, Agent, Agent)
       */
      create({ time, agent1, agent2 }: TAA, type: string): Info {
        const i = new Info(time);
        i._predicate = Info.PREDICATE.TAA.name;
        i._agent[0] = agent1 ? agent1.id : undefined;
        i._agent[1] = agent2 ? agent2.id : undefined;
        switch (type) {
          case "question": {
            i._query = true;
            break;
          }
          case "command": {
            i._command = true;
            break;
          }
        }
        return i;
      },
      /**
       * returns labeled object of all the important terms for this predicate type
       * @param i information in question
       */
      getTerms(info: Info): { predicate: string } & TAA {
        return {
          predicate: Info.PREDICATE.TAA.name,
          time: info.time,
          agent1: Agent.getByID(info.agents[0]),
          agent2: Agent.getByID(info.agents[1])
        };
      }
    },
    TAK: {
      name: "TAK", // predicate(Time, Agent, Info)
      /**
       * Creates an action that uses this predicate format
       *   predicate(Time, Agent, Info)
       */
      create({ time, agent, info }: TAK, type: string): Info {
        const i = new Info(time);
        i._predicate = Info.PREDICATE.TAK.name;
        i._agent[0] = agent ? agent.id : undefined;
        i._infoID = info ? (info._reference ? info._infoID : info.id) : undefined;
        switch (type) {
          case "question": {
            i._query = true;
            break;
          }
          case "command": {
            i._command = true;
            break;
          }
        }
        return i;
      },
      /**
       * returns labeled object of all the important terms for this predicate type
       * @param i information in question
       */
      getTerms(info: Info): { predicate: string } & TAK {
        return {
          predicate: Info.PREDICATE.TAK.name,
          time: info.time,
          agent: Agent.getByID(info.agents[0]),
          info: Info.getByID(info.infoRef)
        };
      }
    },
    TAAL: {
      name: "TAAL", // predicate(Time, Agent, Agent, Location)
      /**
       * Creates an action that uses this predicate format
       *   predicate(Time, Agent, Agent, Location)
       */
      create({ time, agent1, agent2, loc }: TAAL, type: string): Info {
        const i = new Info(time);
        i._predicate = Info.PREDICATE.TAAL.name;
        i._agent[0] = agent1 ? agent1.id : undefined;
        i._agent[1] = agent2 ? agent2.id : undefined;
        i._location[0] = loc ? loc.id : undefined;
        switch (type) {
          case "question": {
            i._query = true;
            break;
          }
          case "command": {
            i._command = true;
            break;
          }
        }
        return i;
      },
      /**
       * returns labeled object of all the important terms for this predicate type
       * @param i information in question
       */
      getTerms(info: Info): { predicate: string } & TAAL {
        return {
          predicate: Info.PREDICATE.TAAL.name,
          time: info.time,
          agent1: Agent.getByID(info.agents[0]),
          agent2: Agent.getByID(info.agents[1]),
          loc: Room.getByID(info.locations[0])
        };
      }
    },
    TAALK: {
      name: "TAALK", // predicate(Time, Agent, Agent, Location, Info)
      /**
       * Creates an action that uses this predicate format
       *   predicate(Time, Agent, Agent, Location, Info)
       */
      create({ time, agent1, agent2, loc, info }: TAALK, type: string): Info {
        const i = new Info(time);
        i._predicate = Info.PREDICATE.TAALK.name;
        i._agent[0] = agent1 ? agent1.id : undefined;
        i._agent[1] = agent2 ? agent2.id : undefined;
        i._location[0] = loc ? loc.id : undefined;
        i._infoID = info ? (info._reference ? info._infoID : info.id) : undefined;
        switch (type) {
          case "question": {
            i._query = true;
            break;
          }
          case "command": {
            i._command = true;
            break;
          }
        }
        return i;
      },
      /**
       * returns labeled object of all the important terms for this predicate type
       * @param i information in question
       */
      getTerms(info: Info): { predicate: string } & TAALK {
        return {
          predicate: Info.PREDICATE.TAALK.name,
          time: info.time,
          agent1: Agent.getByID(info.agents[0]),
          agent2: Agent.getByID(info.agents[1]),
          loc: Room.getByID(info.locations[0]),
          info: Info.getByID(info.infoRef)
        };
      }
    },
    TAILQ: {
      name: "TAILQ", // predicate(Time, Agent, Tangible-Item, Location, Quantity)
      /**
       * Creates an action that uses this predicate format
       *   predicate(Time, Agent, Tangible-Item, Location, Quantity)
       */
      create({ time, agent, item, loc, quantity }: TAILQ, type: string): Info {
        const i = new Info(time);
        i._predicate = Info.PREDICATE.TAILQ.name;
        i._agent[0] = agent ? agent.id : undefined;
        i._item[0] = item ? item.id : undefined;
        i._location[0] = loc ? loc.id : undefined;
        i._quantity[0] = quantity;
        switch (type) {
          case "question": {
            i._query = true;
            break;
          }
          case "command": {
            i._command = true;
            break;
          }
        }
        return i;
      },
      /**
       * returns labeled object of all the important terms for this predicate type
       * @param i information in question
       */
      getTerms(info: Info): { predicate: string } & TAILQ {
        return {
          predicate: Info.PREDICATE.TAILQ.name,
          time: info.time,
          agent: Agent.getByID(info.agents[0]),
          item: Item.getByID(info.items[0]),
          loc: Room.getByID(info.locations[0]),
          quantity: info.quantities[0]
        };
      }
    },
    TAAILQ: {
      name: "TAAILQ", // predicate(Time, Agent, Agent, Tangible-Item, Location, Quantity)
      /**
       * Creates an action that uses this predicate format
       *   predicate(Time, Agent, Agent, Tangible-Item, Location, Quantity)
       */
      create(
        { time, agent1, agent2, item, loc, quantity }: TAAILQ,
        type: string
      ): Info {
        const i = new Info(time);
        i._predicate = Info.PREDICATE.TAAILQ.name;
        i._agent[0] = agent1 ? agent1.id : undefined;
        i._agent[1] = agent2 ? agent2.id : undefined;
        i._item[0] = item ? item.id : undefined;
        i._location[0] = loc ? loc.id : undefined;
        i._quantity[0] = quantity;
        switch (type) {
          case "question": {
            i._query = true;
            break;
          }
          case "command": {
            i._command = true;
            break;
          }
        }
        return i;
      },
      /**
       * returns labeled object of all the important terms for this predicate type
       * @param i information in question
       */
      getTerms(info: Info): { predicate: string } & TAAILQ {
        return {
          predicate: Info.PREDICATE.TAAILQ.name,
          time: info.time,
          agent1: Agent.getByID(info.agents[0]),
          agent2: Agent.getByID(info.agents[1]),
          item: Item.getByID(info.items[0]),
          loc: Room.getByID(info.locations[0]),
          quantity: info.quantities[0]
        };
      }
    },
    TILQ: {
      name: "TILQ", // predicate(Time, Tangible-Item, Location, Quantity)
      /**
       * Creates an action that uses this predicate format
       *   predicate(Time, Tangible-Item, Location, Quantity)
       */
      create({ time, item, loc, quantity }: TILQ, type: string): Info {
        const i = new Info(time);
        i._predicate = Info.PREDICATE.TILQ.name;
        i._item[0] = item ? item.id : undefined;
        i._location[0] = loc ? loc.id : undefined;
        i._quantity[0] = quantity;
        switch (type) {
          case "question": {
            i._query = true;
            break;
          }
          case "command": {
            i._command = true;
            break;
          }
        }
        return i;
      },
      /**
       * returns labeled object of all the important terms for this predicate type
       * @param i information in question
       */
      getTerms(info: Info): { predicate: string } & TILQ {
        return {
          predicate: Info.PREDICATE.TILQ.name,
          time: info.time,
          item: Item.getByID(info.items[0]),
          loc: Room.getByID(info.locations[0]),
          quantity: info.quantities[0]
        };
      }
    }
  };

  // All possible actions
  static ACTIONS = {
    MOVE: {
      name: "MOVE",
      predicate: Info.PREDICATE.TALL.name,
      /**
       * Creates an action that uses this predicate format
       *   MOVE(Time, Agent, Location, Location)
       */
      create(args: TALL, type = "normal"): Info {
        const i = Info.PREDICATE.TALL.create(args, type);
        i._action = Info.ACTIONS.MOVE.name;
        return i;
      },
      /**
       * create a question object for sending. Untracked/unsaved
       */
      question({ agent, time, loc1, loc2 }: TALL): { action: string } & TALL {
        return {
          action: Info.ACTIONS.MOVE.name,
          agent,
          time,
          loc1,
          loc2
        };
      },
      getTerms(info: Info): { action: string, predicate: string } & TALL {
        const terms: any = Info.PREDICATE.TALL.getTerms(info);
        terms.action = Info.ACTIONS.MOVE.name;
        return terms;
      }
    },
    PICKUP: {
      name: "PICKUP",
      predicate: Info.PREDICATE.TAILQ.name,
      /**
       * Creates an action that uses this predicate format
       *   PICKUP(Time, Agent, Tangible-Item, Location, Quantity)
       */
      create(args: TAILQ, type = "normal"): Info {
        const i = Info.PREDICATE.TAILQ.create(args, type);
        i._action = Info.ACTIONS.PICKUP.name;
        return i;
      },
      /**
       * create a question object for sending. Untracked/unsaved
       */
      question({
        time,
        agent,
        item,
        loc,
        quantity
      }: TAILQ): { action: string } & TAILQ {
        return {
          action: Info.ACTIONS.PICKUP.name,
          time,
          agent,
          item,
          loc,
          quantity
        };
      },
      getTerms(info: Info): { action: string, predicate: string } & TAILQ {
        const terms: any = Info.PREDICATE.TAILQ.getTerms(info);
        terms.action = Info.ACTIONS.PICKUP.name;
        return terms;
      }
    },
    DROP: {
      name: "DROP",
      predicate: Info.PREDICATE.TAILQ.name,
      /**
       * Creates an action that uses this predicate format
       *   DROP(Time, Agent, Tangible-Item, Location, Quantity)
       */
      create(args: TAILQ, type = "normal"): Info {
        const i = Info.PREDICATE.TAILQ.create(args, type);
        i._action = Info.ACTIONS.DROP.name;
        return i;
      },
      /**
       * create a question object for sending. Untracked/unsaved
       */
      question({
        time,
        agent,
        item,
        loc,
        quantity
      }: TAILQ): { action: string } & TAILQ {
        return {
          action: Info.ACTIONS.DROP.name,
          time,
          agent,
          item,
          loc,
          quantity
        };
      },
      getTerms(info: Info): { action: string, predicate: string } & TAILQ {
        const terms: any = Info.PREDICATE.TAILQ.getTerms(info);
        terms.action = Info.ACTIONS.DROP.name;
        return terms;
      }
    },
    KNOW: {
      name: "KNOW",
      predicate: Info.PREDICATE.TAK.name,
      /**
       * Creates an action that uses this predicate format
       *   KNOW(Time, Agent, Info)
       */
      create(args: TAK, type = "normal"): Info {
        const i = Info.PREDICATE.TAK.create(args, type);
        i._action = Info.ACTIONS.KNOW.name;
        return i;
      },
      /**
       * create a question object for sending. Untracked/unsaved
       */
      question({ agent, time, info }: TAK): { action: string } & TAK {
        return {
          action: Info.ACTIONS.KNOW.name,
          agent,
          time,
          info
        };
      },
      getTerms(info: Info): { action: string, predicate: string } & TAK {
        const terms: any = Info.PREDICATE.TAK.getTerms(info);
        terms.action = Info.ACTIONS.KNOW.name;
        return terms;
      }
    },
    CONVERSE: {
      name: "CONVERSE",
      predicate: Info.PREDICATE.TAAL.name,
      /**
       * Creates an action that uses this predicate format
       *   CONVERSE(Time, Agent, Agent, Location)
       */
      create(args: TAAL, type = "normal"): Info {
        const i = Info.PREDICATE.TAAL.create(args, type);
        i._action = Info.ACTIONS.CONVERSE.name;
        return i;
      },
      /**
       * create a question object for sending. Untracked/unsaved
       */
      question({ agent1, agent2, time, loc }: TAAL): { action: string } & TAAL {
        return {
          action: Info.ACTIONS.CONVERSE.name,
          agent1,
          agent2,
          time,
          loc
        };
      },
      getTerms(info: Info): { action: string, predicate: string } & TAAL {
        const terms: any = Info.PREDICATE.TAAL.getTerms(info);
        terms.action = Info.ACTIONS.CONVERSE.name;
        return terms;
      }
    },
    GREET: {
      name: "GREET",
      predicate: Info.PREDICATE.TAAL.name,
      /**
       * Creates an action that uses this predicate format
       *   GREET(Time, Agent, Agent, Location)
       */
      create(args: TAAL, type = "normal"): Info {
        const i = Info.PREDICATE.TAAL.create(args, type);
        i._action = Info.ACTIONS.GREET.name;
        return i;
      },
      /**
       * create a question object for sending. Untracked/unsaved
       */
      question({ agent1, agent2, time, loc }: TAAL): { action: string } & TAAL {
        return {
          action: Info.ACTIONS.GREET.name,
          agent1,
          agent2,
          time,
          loc
        };
      },
      getTerms(info: Info): { action: string, predicate: string } & TAAL {
        const terms: any = Info.PREDICATE.TAAL.getTerms(info);
        terms.action = Info.ACTIONS.GREET.name;
        return terms;
      }
    },
    ASK: {
      name: "ASK",
      predicate: Info.PREDICATE.TAALK.name,
      /**
       * Creates an action that uses this predicate format
       *   ASK(Time, Agent, Agent, Location, Info)
       */
      create(args: TAALK, type = "normal"): Info {
        const i = Info.PREDICATE.TAALK.create(args, type);
        i._action = Info.ACTIONS.ASK.name;
        return i;
      },
      /**
       * create a question object for sending. Untracked/unsaved
       */
      question({
        agent1,
        agent2,
        time,
        loc,
        info
      }: TAALK): { action: string } & TAALK {
        return {
          action: Info.ACTIONS.ASK.name,
          agent1,
          agent2,
          time,
          loc,
          info
        };
      },
      getTerms(info: Info): { action: string, predicate: string } & TAALK {
        const terms: any = Info.PREDICATE.TAALK.getTerms(info);
        terms.action = Info.ACTIONS.ASK.name;
        return terms;
      }
    },
    TOLD: {
      name: "TOLD",
      predicate: Info.PREDICATE.TAALK.name,
      /**
       * Creates an action that uses this predicate format
       *   TOLD(Time, Agent, Agent, Location, Info)
       */
      create(args: TAALK, type = "normal"): Info {
        const i = Info.PREDICATE.TAALK.create(args, type);
        i._action = Info.ACTIONS.TOLD.name;
        return i;
      },
      /**
       * create a question object for sending. Untracked/unsaved
       */
      question({
        agent1,
        agent2,
        time,
        loc,
        info
      }: TAALK): { action: string } & TAALK {
        return {
          action: Info.ACTIONS.TOLD.name,
          agent1,
          agent2,
          time,
          loc,
          info
        };
      },
      getTerms(info: Info): { action: string, predicate: string } & TAALK {
        const terms: any = Info.PREDICATE.TAALK.getTerms(info);
        terms.action = Info.ACTIONS.TOLD.name;
        return terms;
      }
    },
    GAVE: {
      name: "GAVE",
      predicate: Info.PREDICATE.TAAILQ.name,
      /**
       * Creates an action that uses this predicate format
       *   GAVE(Time, Agent, Agent, Location, Item-ID, quantity)
       */
      create(args: TAAILQ, type = "normal"): Info {
        const i = Info.PREDICATE.TAAILQ.create(args, type);
        i._action = Info.ACTIONS.GAVE.name;
        return i;
      },
      /**
       * create a question object for sending. Untracked/unsaved
       */
      question({
        agent1,
        agent2,
        time,
        loc,
        item,
        quantity
      }: TAAILQ): { action: string } & TAAILQ {
        return {
          action: Info.ACTIONS.GAVE.name,
          agent1,
          agent2,
          time,
          loc,
          item,
          quantity
        };
      },
      getTerms(info: Info): { action: string, predicate: string } & TAAILQ {
        const terms: any = Info.PREDICATE.TAAILQ.getTerms(info);
        terms.action = Info.ACTIONS.GAVE.name;
        return terms;
      }
    },
    QUEST: {
      name: "QUEST",
      predicate: Info.PREDICATE.TAALK,
      /**
       * Creates an action that uses this predicate format
       *   GAVE(Time, Time, Agent, Agent, Location, Info)
       */
      create(args: TAALK, type = "normal"): Info {
        const i = Info.PREDICATE.TAALK.create(args, type);
        i._action = Info.ACTIONS.QUEST.name;
        return i;
      },
      /**
       * create a question object for sending. Untracked/unsaved
       */
      question({
        agent1,
        agent2,
        time,
        loc,
        info
      }: TAALK): { action: string } & TAALK {
        return {
          action: Info.ACTIONS.QUEST.name,
          agent1,
          agent2,
          time,
          loc,
          info
        };
      },
      getTerms(info: Info): { action: string, predicate: string } & TAALK {
        const terms: any = Info.PREDICATE.TAALK.getTerms(info);
        terms.action = Info.ACTIONS.QUEST.name;
        return terms;
      }
    },
    QUEST_COMPLETE: {
      name: "QUEST_COMPLETE",
      predicate: Info.PREDICATE.TAALK,
      /**
       * Creates an action that uses this predicate format
       *   GAVE(Time, Time, Agent, Agent, Location, Info)
       */
      create(args: TAALK, type = "normal"): Info {
        const i = Info.PREDICATE.TAALK.create(args, type);
        i._action = Info.ACTIONS.QUEST_COMPLETE.name;
        return i;
      },
      /**
       * create a question object for sending. Untracked/unsaved
       */
      question({
        agent1,
        agent2,
        time,
        loc,
        info
      }: TAALK): { action: string } & TAALK {
        return {
          action: Info.ACTIONS.QUEST_COMPLETE.name,
          agent1,
          agent2,
          time,
          loc,
          info
        };
      },
      getTerms(info: Info): { action: string, predicate: string } & TAALK {
        const terms: any = Info.PREDICATE.TAALK.getTerms(info);
        terms.action = Info.ACTIONS.QUEST_COMPLETE.name;
        return terms;
      }
    },
    QUEST_FAILED: {
      name: "QUEST_FAILED",
      predicate: Info.PREDICATE.TAALK,
      /**
       * Creates an action that uses this predicate format
       *   GAVE(Time, Time, Agent, Agent, Location, Info)
       */
      create(args: TAALK, type = "normal"): Info {
        const i = Info.PREDICATE.TAALK.create(args, type);
        i._action = Info.ACTIONS.QUEST_FAILED.name;
        return i;
      },
      /**
       * create a question object for sending. Untracked/unsaved
       */
      question({
        agent1,
        agent2,
        time,
        loc,
        info
      }: TAALK): { action: string } & TAALK {
        return {
          action: Info.ACTIONS.QUEST_FAILED.name,
          agent1,
          agent2,
          time,
          loc,
          info
        };
      },
      getTerms(info: Info): { action: string, predicate: string } & TAALK {
        const terms: any = Info.PREDICATE.TAALK.getTerms(info);
        terms.action = Info.ACTIONS.QUEST_FAILED.name;
        return terms;
      }
    },
    STOLE: {
      name: "STOLE",
      predicate: Info.PREDICATE.TAAILQ.name,
      /**
       * Creates an action that uses this predicate format
       *   STOLE(Time, Agent, Agent, Location, Item-ID, quantity)
       */
      create(args: TAAILQ, type = "normal"): Info {
        const i = Info.PREDICATE.TAAILQ.create(args, type);
        i._action = Info.ACTIONS.STOLE.name;
        return i;
      },
      /**
       * create a question object for sending. Untracked/unsaved
       */
      question({
        agent1,
        agent2,
        time,
        loc,
        item,
        quantity
      }: TAAILQ): { action: string } & TAAILQ {
        return {
          action: Info.ACTIONS.STOLE.name,
          agent1,
          agent2,
          time,
          loc,
          item,
          quantity
        };
      },
      getTerms(info: Info): { action: string, predicate: string } & TAAILQ {
        const terms: any = Info.PREDICATE.TAAILQ.getTerms(info);
        terms.action = Info.ACTIONS.STOLE.name;
        return terms;
      }
    },
    CONFISCATED: {
      name: "CONFISCATED",
      predicate: Info.PREDICATE.TAAILQ.name,
      /**
       * Creates an action that uses this predicate format
       *   CONFISCATED(Time, Agent, Agent, Location, Item-ID, quantity)
       */
      create(args: TAAILQ, type = "normal"): Info {
        const i = Info.PREDICATE.TAAILQ.create(args, type);
        i._action = Info.ACTIONS.CONFISCATED.name;
        return i;
      },
      /**
       * create a question object for sending. Untracked/unsaved
       */
      question({
        agent1,
        agent2,
        time,
        loc,
        item,
        quantity
      }: TAAILQ): { action: string } & TAAILQ {
        return {
          action: Info.ACTIONS.CONFISCATED.name,
          agent1,
          agent2,
          time,
          loc,
          item,
          quantity
        };
      },
      getTerms(info: Info): { action: string, predicate: string } & TAAILQ {
        const terms: any = Info.PREDICATE.TAAILQ.getTerms(info);
        terms.action = Info.ACTIONS.CONFISCATED.name;
        return terms;
      }
    },
    POSSESS: {
      name: "POSSESS",
      predicate: Info.PREDICATE.TAILQ.name,
      /**
       * Creates an action that uses this predicate format
       *   POSSESS(Time, Agent, Tangible-Item, Location, Quantity)
       */
      create(args: TAILQ, type = "normal"): Info {
        const i = Info.PREDICATE.TAILQ.create(args, type);
        i._action = Info.ACTIONS.POSSESS.name;
        return i;
      },
      /**
       * create a question object for sending. Untracked/unsaved
       */
      question({
        time,
        agent,
        item,
        loc,
        quantity
      }: TAILQ): { action: string } & TAILQ {
        return {
          action: Info.ACTIONS.POSSESS.name,
          time,
          agent,
          item,
          loc,
          quantity
        };
      },
      getTerms(info: Info): { action: string, predicate: string } & TAILQ {
        const terms: any = Info.PREDICATE.TAILQ.getTerms(info);
        terms.action = Info.ACTIONS.POSSESS.name;
        return terms;
      }
    },
    LOCATED_IN: {
      name: "LOCATED_IN",
      predicate: Info.PREDICATE.TILQ.name,
      /**
       * Creates an action that uses this predicate format
       *   LOCATED_IN(Time, Tangible-Item, Location, Quantity)
       */
      create(args: TILQ, type = "normal"): Info {
        const i = Info.PREDICATE.TILQ.create(args, type);
        i._action = Info.ACTIONS.LOCATED_IN.name;
        return i;
      },
      /**
       * create a question object for sending. Untracked/unsaved
       */
      question({ time, item, loc, quantity }: TILQ): { action: string } & TILQ {
        return {
          action: Info.ACTIONS.LOCATED_IN.name,
          time,
          item,
          loc,
          quantity
        };
      },
      getTerms(info: Info): { action: string, predicate: string } & TILQ {
        const terms: any = Info.PREDICATE.TILQ.getTerms(info);
        terms.action = Info.ACTIONS.LOCATED_IN.name;
        return terms;
      }
    },
    ARRESTED: {
      name: "ARRESTED",
      predicate: Info.PREDICATE.TAAL.name,
      /**
       * Creates an action that uses this predicate format
       *   ARRESTED(Time, Agent, Agent, Location)
       */
      create(args: TAAL, type = "normal"): Info {
        const i = Info.PREDICATE.TAAL.create(args, type);
        i._action = Info.ACTIONS.ARRESTED.name;
        return i;
      },
      /**
       * create a question object for sending. Untracked/unsaved
       */
      question({ agent1, agent2, time, loc }: TAAL): { action: string } & TAAL {
        return {
          action: Info.ACTIONS.ARRESTED.name,
          agent1,
          agent2,
          time,
          loc
        };
      },
      getTerms(info: Info): { action: string } & TAAL {
        const terms: any = Info.PREDICATE.TAAL.getTerms(info);
        terms.action = Info.ACTIONS.ARRESTED.name;
        return terms;
      }
    }
  };
}
