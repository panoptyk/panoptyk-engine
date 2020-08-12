import { logger, LOG } from "../utilities/logger";
import { Agent, BaseModel } from ".";
import { IDatabase } from "../database/IDatabase";

export class Faction extends BaseModel {
    _factionName: string;
    get factionName(): string{
        return this._factionName;
    }
    _factionType: string;
    get factionType(): string {
        return this._factionType;
    }
    _exp: number;
    get exp(): number {
        return this._exp;
    }
    _toNextLevel: number;
    get toNextLevel(): number {
        return this._toNextLevel;
    }
    _level: number;
    get level(): number {
        return this._level;
    }
    _rankName: string;
    get rankName(): string {
        return this._rankName;
    }
    _members: Map<number, number>;
    displayName(): string {
        return this._factionName;
    }
    toString(): string {
        return this.factionName + " (id# " + this.id + ")";
    }

    constructor(name: string, type: string, id?: number, db?: IDatabase) {
        super(id, db);

        this._factionName = name;
        this._factionType = type;

        logger.log("Faction " + this + " Initialized.");
    }

    toJSON(forClient: boolean, context: any): object {
        throw new Error("Method not implemented.");
      }

    /**
     * Returns numeric value of agent's rank or undefined if agent is not in faction
     * Client: A value of undefined may mean that the agent's rank is unknown
     * @param agent
     */
    public getAgentRank(agent: Agent) {
        return this._members.get(agent.id);
    }

}