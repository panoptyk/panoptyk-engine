import { logger } from "../utilities/logger";
import fs = require("fs");
import { panoptykSettings } from "../utilities/util";

export class Info {
  private static nextID = 0;
  private static _objects = new Map();
  public static get objects() {
    return Info._objects;
  }

  private id?: number;
  private action?: number;
  private predicate?: string;
  private owner?: number;
  private time: number;
  private query = false;
  private location?: number;
  private agent?: number;
  private agent2?: number;
  private item?: number;
  private quantity?: number;
  private faction?: number;
  private reference = false;
  private infoID?: number;

  /**
   * Info model.
   * @param {number} id - id of item. If undefined, one will be assigned
   * @param {number} action - action occured as number code
   * @param {String} predicate - predicate contents see Info.PREDICATE Enum
   * @param {number} owner - Agent who owns this info
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
  constructor(id, owner, time, infoID?) {
    this.id = id === undefined ? Info.nextID++ : id;
    this.owner = owner;
    this.time = time;
    this.infoID = infoID;
    Info._objects[this.id] = this;

    // logger.log('Information ' + 'ID#' + this.id + ' Initialized.', 2);
  }

  /**
   * Creates a new copy that references old info for recieving Agent to own
   * @param {int} owner - Agent who owns this info
   * @param {int} time - Time information copied
   */
  make_copy(owner, time) {
    const i = new Info(undefined, owner, time, this.reference ? this.infoID : this.id);
    i.reference = true;
    return i;
  }

  /**
   * Give this info to an agent.
   * @param {Object} owner - agent object to give info to.
   */
  give_to_agent(owner) {
    this.owner = owner.agent_id;
  }

  /**
   * Take this info from an agent.
   */
  take_from_agent() {
    this.owner = undefined;
  }

  /**
   * Pass JSON parsed object to be loaded in as info
   * @param {Object} info
   */
  static load(info) {
    const i = new Info(info.id, info.owner, info.time, info.infoId);
    for (const key in info) {
      i[key] = info[key];
    }
    return i;
  }

  /**
   * Serialize all info and save them to files.
   */
  static save_all() {
    logger.log("Saving information...", 2);

    fs.writeFileSync(
      panoptykSettings.data_dir + "/info/" + "all_info" + ".json",
      JSON.stringify({ objects: Info._objects, nextID: Info.nextID })
    );

    logger.log("Information saved.", 2);
  }

  /**
   * Load all info from file into memory.
   */
  static load_all() {
    logger.log("Loading Information...", 2);

    fs
      .readdirSync(panoptykSettings.data_dir + "/info/")
      .forEach(function(file) {
        fs.readFile(
          panoptykSettings.data_dir + "/info/" + file,
          function read(err, data) {
            if (err) {
              logger.log(err);
              return;
            }

            const json = JSON.parse(data.toString());
            for (const info in json.objects) {
              Info.load(json.objects[info]);
            }
            Info.nextID = json.nextID !== undefined ? json.nextID : 1;
            // logger.log("Loading info " + json.id, 2);
          }
        );
      });
  }

  /**
   * Retrieve Info object by id
   * @param {int} id - Info object's id
   */
  static get_info_by_id(id) {
    return Info._objects[id];
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
        const i = new Info(undefined, owner, v[0], undefined);
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
        const i = new Info(undefined, owner, v[0], undefined);
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
        const i = new Info(undefined, owner, v[0], undefined);
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
        const i = new Info(undefined, owner, v[0], undefined);
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
        const i = new Info(undefined, owner, v[0], undefined);
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
        const i = new Info(undefined, owner, v[0], undefined);
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
        const i = new Info(undefined, owner, v[0], undefined);
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
        const i = new Info(undefined, owner, v[0], undefined);
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
  static get_ACTION(code) {
    return Info.ACTION[Object.keys(Info.ACTION)[code]];
  }

}

