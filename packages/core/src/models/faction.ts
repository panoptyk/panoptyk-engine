import { IDatabase } from "../database/IDatabase";
import { BaseModel } from "./Imodel";
import { Agent } from "./agent";
import { logger } from "../utilities";

/**
 * Info on an Agent's status in a faction
 */
export interface FactionStatus {
    rank: number;
    rankName: string;
}

export class Faction extends BaseModel {
    //#region Properties
    get factionName(): string {
        return this._factionName;
    }
    get factionType(): string {
        return this._factionType;
    }
    //#endregion

    //#region Fields
    _factionName: string;
    _factionType: string;
    _members: Map<AgentID, number>;
    //#endregion

    constructor(name: string, type: string, id?: number, db?: IDatabase) {
        super(id, db);

        this._factionName = name;
        this._factionType = type;

        logger.log("Faction " + this + " Initialized.", "FACTION");
    }

    toJSON(forClient: boolean, context: any): object {
        const safeFaction = super.toJSON(forClient, context);
        return safeFaction;
    }

    displayName(): string {
        return this._factionName;
    }
    toString(): string {
        return this.factionName + " (id# " + this.id + ")";
    }
    equals(model: any) {
        return model instanceof Faction && this.id === model.id;
    }

    /**
     * Returns numeric value of agent's rank or undefined if agent is not in faction
     * Client: A value of undefined may mean that the agent's rank is unknown
     * @param agent
     */
    public getFactionStatusOfAgent(agent: Agent): FactionStatus {
        return {
            rank: this._members.get(agent.id),
            rankName: ""
        };
    }
}
