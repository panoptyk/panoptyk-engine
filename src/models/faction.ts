import { logger, LOG } from "../utilities/logger";
import { IDObject } from "./idObject";
import { Agent } from "./agent";

export interface FactionStatus {
  factionName: string;
  factionType: string;
  exp: number;
  toNextLevel: number;
  lvl: number;
  rankName: string;
}

export class Faction extends IDObject {
  private static expToNextLvl(lvl: number): number {
    const exponent = 1.5;
    const baseXP = 10;
    return Math.floor(baseXP * (Math.pow(lvl, exponent)));
  }
  private _factionName: string;
  public get factionName(): string {
    return this._factionName;
  }
  private _factionType: string;
  public get factionType(): string {
    return this._factionType;
  }
  private _members: Map<number, { lvl: number; exp: number }>; // second number is experience
  private _lvlToName: Map<number, string>;

  /**
   * Faction model
   * @param name name of faction.
   * @param type faction Archetype.
   * @param id id of faction. If undefined, one will be assigned.
   */
  constructor(name: string, type: string, id?: number) {
    super(Faction.name, id);
    this._factionName = name;
    this._factionType = type;
    this._members = new Map();
    this._lvlToName = new Map();

    logger.log("Faction " + this + " initialized.", LOG.INFO);
  }

  /**
   * Load a JSON object into memory.
   * @param {JSON} json - serialized faction JSON.
   */
  static load(json: Faction) {
    let f: Faction = Faction.objects[json.id];
    f = f ? f : new Faction(json._factionName, json._factionType, json.id);
    for (const key in json) {
      f[key] = json[key];
    }
    f._members = new Map<number, { lvl: number; exp: number }>(f._members);
    f._lvlToName = new Map<number, string>(f._lvlToName);
    return f;
  }

  /**
   * Sanatizes data to be serialized
   * @param removePrivateData {boolean} Determines if private is removed information that a client/agent
   *  may not be privy to.
   */
  public serialize(agent?: Agent, removePrivateData = false) {
    const safeFaction = Object.assign({}, this);
    (safeFaction._members as any) = Array.from(safeFaction._members);
    (safeFaction._lvlToName as any) = Array.from(safeFaction._lvlToName);
    return safeFaction;
  }

  toString() {
    return this._factionName + " (id#" + this.id + ")";
  }

  /**
   * Sever: Add/modify an agent to given rank
   * @param agent
   * @param exp
   */
  public addAgentExp(agent: Agent, exp: number) {
    if (this._members.has(agent.id)) {
      const status = this._members.get(agent.id);
      let toNextLvl = Faction.expToNextLvl(status.lvl);
      status.exp += exp;
      while (status.exp >= toNextLvl) {
        status.exp -= toNextLvl;
        status.lvl += 1;
        toNextLvl = Faction.expToNextLvl(status.lvl);
      }
      this._members.set(agent.id, status);
    }
  }

  /**
   * Server: Remove agent from faction
   * @param agent
   */
  public removeAgent(agent: Agent) {
    this._members.delete(agent.id);
  }

  public addAgent(agent: Agent) {
    this._members.set(agent.id, { lvl: 0, exp: 0 });
  }

  public getAllMembers(): Agent[] {
    return Agent.getByIDs(Array.from(this._members.keys()));
  }

  public nameLvl(lvl: number, name: string) {
    this._lvlToName.set(lvl, name);
  }

  public getLvlName(lvl: number) {
    let name = 0;
    for (const key of this._lvlToName.keys()) {
      if (lvl >= key && key > name) {
        name = key;
      }
    }
    return this._lvlToName.get(name);
  }

  /**
   * Returns numeric value of agent's rank or undefined if agent is not in faction
   * Client: A value of undefined may mean that the agent's rank is unknown
   * @param agent
   */
  public getAgentStatus(agent: Agent): FactionStatus {
    const status = this._members.get(agent.id);
    if (!status) {
      return undefined;
    }
    return {
      factionName: this._factionName,
      factionType: this._factionType,
      exp: status.exp,
      toNextLevel: Faction.expToNextLvl(status.lvl),
      lvl: status.lvl,
      rankName: this.getLvlName(status.lvl)
    };
  }
}
