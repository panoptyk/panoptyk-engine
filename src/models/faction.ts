import { logger, LOG } from "../utilities/logger";
import { panoptykSettings } from "../utilities/util";
import { IDObject } from "./idObject";
import { Agent } from "./agent";
import { BaseModel } from "./Imodel";

export class Faction extends BaseModel {
    displayName(): string {
        throw new Error("Method not implemented.");
    }
    toString(): string {
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
    private _factionName: string;
    public get factionName(): string {
        return this._factionName;
    }
    private _factionType: string;
    public get factionType(): string {
        return this._factionType;
    }
    private _members: Map<number, number>;  // second number is rank

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

        logger.log("Faction " + this + " initialized.", 2);
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
        f._members = new Map<number, number>(f._members);
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
        return safeFaction;
    }

    toString() {
        return this._factionName + " (id#" + this.id + ")";
    }

    /**
     * Sever: Add/modify an agent to given rank
     * @param agent
     * @param rank
     */
    public setAgentRank(agent: Agent, rank: number) {
        this._members.set(agent.id, rank);
    }

    /**
     * Server: Remove agent from faction
     * @param agent
     */
    public removeAgent(agent: Agent) {
        this._members.delete(agent.id);
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