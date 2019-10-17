import { Agent } from "./agent";
import { IDObject } from "./idObject";

export class Info extends IDObject {

  public action?: number;
  public predicate?: string;
  private _owner?: number;
  public get owner(): Agent {
    return Agent.getByID(this._owner);
  }
  public time: number;
  public query = false;
  public location?: number;
  public agent?: number;
  public agent2?: number;
  public item?: number;
  public quantity?: number;
  public faction?: number;
  public reference = false;
  public infoID?: number;
  public questionID?: number;

  /**
   * Info model.
   * @param {number} id - id of item. If undefined, one will be assigned
   * @param {number} action - action occured as number code
   * @param {String} predicate - predicate contents see Info.PREDICATE Enum
   * @param {Agent} owner - Agent who owns this info
   * @param {number} time - Time information/event happened (possible predicate)
   * @param {bool} query - is this info just a query?
   * @param {number} location - possible predicate of location event occured at
   * @param {number} agent - possible predicate about agent
   * @param {number} agent2 - possible predicate about another agent
   * @param {number} item - possible predicate of a tangible item type
   * @param {number} quantity - possible predicate about quantity of tangible item
   * @param {number} faction - possible predicate about faction group
   * @param {bool} reference - whether this is just a copy of info owned by another agent
   * @param {number} infoID - possible predicate pointing to other info needed
   */
  constructor(owner: Agent, time, infoID?, id?) {
    super(Info.name, id);
    this._owner = owner ? owner.id : undefined;
    this.time = time;
    this.infoID = infoID;
  }

  /**
   * Creates a new copy that references old info for recieving Agent to own
   * @param {Agent} owner - Agent who owns this info
   * @param {number} time - Time information was copied
   */
  makeCopy(owner: Agent, time) {
    const i = new Info(owner, time);
    for (const key in Object.getOwnPropertyNames(this)) {
      i[key] = this[key];
    }
    i.infoID = this.reference ? this.infoID : this.id;
    i.reference = true;
    return i;
  }

  makeTradeCopy(owner: Agent, time, relatedQuestion: Info) {
    const i = new Info(owner, time, this.reference ? this.infoID : this.id);
    i.reference = true;
    i.questionID = relatedQuestion.id;
    return i;
  }

  /**
   * Completes transfer of trade information to new owner
   * @param newOwner agent to transfer information to
   */
  completeTradeCopy(newOwner: Agent) {
    const answer = Info.getByID(this.infoID);
    for (const key in answer) {
      this[key] = answer[key];
    }
    this._owner = newOwner.id;
    this.infoID = answer.reference ? answer.infoID : answer.id;
    this.reference = true;
    this.questionID = 0;
  }

  /**
   * Pass JSON parsed object to be loaded in as info
   * @param {Object} json
   */
  static load(json: Info) {
    let i = Info.objects[json.id];
    i = i ? i : new Info(undefined, json.time, json.infoID, json.id);
    for (const key in json) {
      i[key] = json[key];
    }
    return i;
  }

  /**
   * Sanatizes data to be serialized
   * @param removePrivateData {boolean} Determines if public is removed information that a client/agent
   *  may not be privy to.
   */
  public serialize(removePrivateData = false): Info {
    const safeAgent = Object.assign({}, this);
    return safeAgent;
  }

  // Predicate types
  static PREDICATE = {
    TAL: {
      name: "TAL", // predicate(Time, Agent, Location)
      /**
       * Creates an action that uses this predicate formate
       * @param {*} owner - agent who owns this info
       * @param {*} v - object of predicate variables: {0: Time, 1: Agent, 2: Location}
       */
      create(owner, v) {
        const i = new Info(owner, v[0]);
        i.predicate = Info.PREDICATE.TAL.name;

        i.agent = v[1];
        i.location = v[2];
        return i;
      }
    },
    TAF: {
      name: "TAF", // predicate(Time, Agent, Faction)
      /**
       * Creates an action that uses this predicate formate
       * @param {*} owner - agent who owns this info
       * @param {*} v - object of predicate variables: {0: Time, 1: Agent, 2: Faction}
       */
      create(owner, v) {
        const i = new Info(owner, v[0]);
        i.predicate = Info.PREDICATE.TAF.name;

        i.agent = v[1];
        i.faction = v[2];
        return i;
      }
    },
    TAA: {
      name: "TAA", // predicate(Time, Agent, Agent)
      /**
       * Creates an action that uses this predicate formate
       * @param {*} owner - agent who owns this info
       * @param {*} v - object of predicate variables: {0: Time, 1: Agent, 2: Agent}
       */
      create(owner, v) {
        const i = new Info(owner, v[0]);
        i.predicate = Info.PREDICATE.TAA.name;

        i.agent = v[1];
        i.agent2 = v[2];
        return i;
      }
    },
    TAK: {
      name: "TAK", // predicate(Time, Agent, Info-ID)
      /**
       * Creates an action that uses this predicate formate
       * @param {*} owner - agent who owns this info
       * @param {*} v - object of predicate variables: {0: Time, 1: Agent, 2: Info-ID}
       */
      create(owner, v) {
        const i = new Info(owner, v[0]);
        i.predicate = Info.PREDICATE.TAK.name;

        i.agent = v[1];
        i.infoID = v[2];
        return i;
      }
    },
    TAAL: {
      name: "TAAL", // predicate(Time, Agent, Agent, Location)
      /**
       * Creates an action that uses this predicate formate
       * @param {*} owner - agent who owns this info
       * @param {*} v - object of predicate variables: {0: Time, 1: Agent, 2: Agent, 3: Location}
       */
      create(owner, v) {
        const i = new Info(owner, v[0]);
        i.predicate = Info.PREDICATE.TAAL.name;

        i.agent = v[1];
        i.agent2 = v[2];
        i.location = v[3];
        return i;
      }
    },
    TAALK: {
      name: "TAALK", // predicate(Time, Agent, Agent, Location, Info-ID)
      /**
       * Creates an action that uses this predicate formate
       * @param {*} owner - agent who owns this info
       * @param {*} v - object of predicate variables: {0: Time, 1: Agent, 2: Agent, 3: Location, 4: Info-ID}
       */
      create(owner, v) {
        const i = new Info(owner, v[0]);
        i.predicate = Info.PREDICATE.TAALK.name;

        i.agent = v[1];
        i.agent2 = v[2];
        i.location = v[3];
        i.infoID = v[4];
        return i;
      }
    },
    TAILQ: {
      name: "TAILQ", // predicate(Time, Agent, Tangible-Item, Location, Quantity)
      /**
       * Creates an action that uses this predicate formate
       * @param {*} owner - agent who owns this info
       * @param {*} v - object of predicate variables: {0: Time, 1: Agent, 2: Tangible-Item, 3: Location, 4: Quantity}
       */
      create(owner, v) {
        const i = new Info(owner, v[0]);
        i.predicate = Info.PREDICATE.TAILQ.name;

        i.agent = v[1];
        i.item = v[2];
        i.location = v[3];
        i.quantity = v[4];
        return i;
      }
    },
    TAAILQ: {
      name: "TAAILQ", // predicate(Time, Agent, Agent, Tangible-Item, Location, Quantity)
      /**
       * Creates an action that uses this predicate formate
       * @param {*} owner - agent who owns this info
       * @param {*} v - object of predicate variables: {0: Time, 1: Agent, 2: Agent, 3: Tangible-Item, 4: Location, 5: Quantity}
       */
      create(owner, v) {
        const i = new Info(owner, v[0]);
        i.predicate = Info.PREDICATE.TAA.name;

        i.agent = v[1];
        i.agent2 = v[2];
        i.item = v[3];
        i.location = v[4];
        i.quantity = v[5];
        return i;
      }
    }
  };

  // All possible actions
  static ACTION = {
    WHAT: { code: 0, name: "WHAT", create: undefined },
    ENTER: {
      code: 1,
      name: "ENTER",
      /**
       * Creates an ENTER action that uses this predicate format
       * @param {*} owner - agent who owns this info
       * @param {*} v - object of predicate variables: {0: Time, 1: Agent, 2: Location}
       */
      create(owner, v) {
        const i = Info.PREDICATE.TAL.create(owner, v);
        i.action = Info.ACTION.ENTER.code;
        return i;
      }
    },
    DEPART: {
      code: 2,
      name: "DEPART",
      /**
       * Creates a DEPART action that uses this predicate format
       * @param {*} owner - agent who owns this info
       * @param {*} v - object of predicate variables: {0: Time, 1: Agent, 2: Location}
       */
      create(owner, v) {
        const i = Info.PREDICATE.TAL.create(owner, v);
        i.action = Info.ACTION.DEPART.code;
        return i;
      }
    },
    PICKUP: {
      code: 3,
      name: "PICKUP",
      /**
       * Creates a PICKUP action that uses this predicate format
       * @param {*} owner - agent who owns this info
       * @param {*} v - object of predicate variables: {0: Time, 1: Agent, 2: Tangible-Item, 3: Location, 4: Quantity}
       */
      create(owner, v) {
        const i = Info.PREDICATE.TAILQ.create(owner, v);
        i.action = Info.ACTION.PICKUP.code;
        return i;
      }
    },
    DROP: {
      code: 4,
      name: "DROP",
      /**
       * Creates a DROP action that uses this predicate format
       * @param {*} owner - agent who owns this info
       * @param {*} v - object of predicate variables: {0: Time, 1: Agent, 2: Tangible-Item, 3: Location, 4: Quantity}
       */
      create(owner, v) {
        const i = Info.PREDICATE.TAILQ.create(owner, v);
        i.action = Info.ACTION.DROP.code;
        return i;
      }
    },
    KNOW: {
      code: 5,
      name: "KNOW",
      /**
       * Creates a KNOW action that uses this predicate format
       * @param {*} owner - agent who owns this info
       * @param {*} v - object of predicate variables: {0: Time, 1: Agent, 2: Info-ID}
       */
      create(owner, v) {
        const i = Info.PREDICATE.TAK.create(owner, v);
        i.action = Info.ACTION.KNOW.code;
        return i;
      }
    },
    STEAL: {
      code: 6,
      name: "STEAL",
      /**
       * Creates a STEAL action that uses this predicate format
       * @param {*} owner - agent who owns this info
       * @param {*} v - object of predicate variables: {0: Time, 1: Agent, 2: Agent, 3: Tangible-Item, 4: Location, 5: Quantity}
       */
      create(owner, v) {
        const i = Info.PREDICATE.TAAILQ.create(owner, v);
        i.action = Info.ACTION.STEAL.code;
        return i;
      }
    },
    KILL: {
      code: 7,
      name: "KILL",
      /**
       * Creates a KILL action that uses this predicate format
       * @param {*} owner - agent who owns this info
       * @param {*} v - object of predicate variables: {0: Time, 1: Agent, 2: Agent, 3: Location}
       */
      create(owner, v) {
        const i = Info.PREDICATE.TAAL.create(owner, v);
        i.action = Info.ACTION.KILL.code;
        return i;
      }
    },
    WORKSFOR: {
      code: 8,
      name: "WORKSFOR",
      /**
       * Creates a WORKSFOR action that uses this predicate format
       * @param {*} owner - agent who owns this info
       * @param {*} v - object of predicate variables: {0: Time, 1: Agent, 2: Faction}
       */
      create(owner, v) {
        const i = Info.PREDICATE.TAF.create(owner, v);
        i.action = Info.ACTION.WORKSFOR.code;
        return i;
      }
    },
    BOSSOF: {
      code: 9,
      name: "BOSSOF",
      /**
       * Creates a BOSSOF action that uses this predicate format
       * @param {*} owner - agent who owns this info
       * @param {*} v - object of predicate variables: {0: Time, 1: Agent, 2: Agent}
       */
      create(owner, v) {
        const i = Info.PREDICATE.TAA.create(owner, v);
        i.action = Info.ACTION.BOSSOF.code;
        return i;
      }
    },
    CONVERSE: {
      code: 10,
      name: "CONVERSE",
      /**
       * Creates a CONVERSE action that uses this predicate format
       * @param {*} owner - agent who owns this info
       * @param {*} v - object of predicate variables: {0: Time, 1: Agent, 2: Agent, 3: Location}
       */
      create(owner, v) {
        const i = Info.PREDICATE.TAAL.create(owner, v);
        i.action = Info.ACTION.CONVERSE.code;
        return i;
      }
    },
    GREET: {
      code: 11,
      name: "GREET",
      /**
       * Creates a GREET action that uses this predicate format
       * @param {*} owner - agent who owns this info
       * @param {*} v - object of predicate variables: {0: Time, 1: Agent, 2: Agent, 3: Location}
       */
      create(owner, v) {
        const i = Info.PREDICATE.TAAL.create(owner, v);
        i.action = Info.ACTION.GREET.code;
        return i;
      }
    },
    ASK: {
      code: 12,
      name: "ASK",
      /**
       * Creates a ASK action that uses this predicate format
       * @param {*} owner - agent who owns this info
       * @param {*} v - object of predicate variables: {0: Time, 1: Agent, 2: Agent, 3: Location, 4: Info-ID}
       */
      create(owner, v) {
        const i = Info.PREDICATE.TAALK.create(owner, v);
        i.action = Info.ACTION.ASK.code;
        return i;
      }
    },
    TOLD: {
      code: 13,
      name: "TOLD",
      /**
       * Creates a TOLD action that uses this predicate format
       * @param {*} owner - agent who owns this info
       * @param {*} v - object of predicate variables: {0: Time, 1: Agent, 2: Agent, 3: Location, 4: Info-ID}
       */
      create(owner, v) {
        const i = Info.PREDICATE.TAALK.create(owner, v);
        i.action = Info.ACTION.TOLD.code;
        return i;
      }
    }
  };

  /**
   * Retrieves action object by its code stored in Info.action
   * @param {int} code - action code
   */
  static getACTION(code) {
    return Info.ACTION[Object.keys(Info.ACTION)[code]];
  }

}
