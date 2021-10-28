import { IDatabase } from "../database/IDatabase";
import { BaseModel } from "./Imodel";
import { Room } from "./room";
import { Item } from "./item";
import { Info, Information } from "./information";
import { Quest } from "./quest";
import { Conversation } from "./conversation";
import { Faction, FactionStatus } from "./faction";
import { Trade } from "./trade";
import { logger } from "../utilities";
import { Recipe } from "./recipe";

export class Agent extends BaseModel {
    //#region Properties
    get agentName(): string {
        return this._agentName;
    }

    get room() {
        return this.db.retrieveModel(this._room, Room);
    }
    set room(room: Room) {
        this._room = room ? room.id : -1;
    }

    get inventory(): Item[] {
        return this.db.retrieveModels([...this._inventory], Item);
    }

    get knowledge(): Info[] {
        return this.db.retrieveModels(
            [...this._knowledge],
            Information
        ) as Info[];
    }

    get activeAssignedQuests(): Quest[] {
        return this.db.retrieveModels(
            [...this._assignedQuests],
            Quest
        );
    }
    get activeGivenQuests(): Quest[] {
        return this.db.retrieveModels([...this._givenQuests], Quest);
    }

    get conversation(): Conversation {
        return this.db.retrieveModel(
            this._conversation,
            Conversation
        );
    }
    set conversation(conversation: Conversation) {
        this._conversation = conversation ? conversation.id : -1;
    }

    /**
     * "Other" agents to this agent
     */

    get conversationRequesters(): Agent[] {
        return this.db.retrieveModels(
            [...this._conversationRequests],
            Agent
        );
    }
    /**
     * This agent to "other" agents
     */

    get conversationRequested(): Agent[] {
        return this.db.retrieveModels(
            [...this._conversationRequested],
            Agent
        );
    }

    get trade(): Trade {
        return this.db.retrieveModel(this._trade, Trade);
    }
    set trade(trade: Trade) {
        this._trade = trade ? trade.id : -1;
    }
    /**
     * "Other" agents to this agent
     */

    get tradeRequesters(): Agent[] {
        return this.db.retrieveModels(
            [...this._tradeRequests],
            Agent
        );
    }

    /**
     * This agent to "other" agents
     */

    get tradeRequested(): Agent[] {
        return this.db.retrieveModels(
            [...this._tradeRequested],
            Agent
        );
    }

    get resources(): Map<string, number> {
        return this._resources;
    }

    get recipes(): Recipe[] {
        return this.db.retrieveModels([...this._recipes], Recipe);
    }

    get gold(): number {
        return this._gold;
    }

    get faction(): Faction {
        return this.db.retrieveModel(this._faction, Faction);
    }
    set faction(newFaction: Faction) {
        this._faction = newFaction ? newFaction.id : -1;
    }
    get factionStatus(): FactionStatus {
        if (this.faction) {
            return this.faction.getFactionStatusOfAgent(this);
        }
        return undefined;
    }
    //#endregion

    //#region Fields
    _agentName: string;
    _faction: FactionID;
    _room: RoomID;

    // TODO: https://github.com/panoptyk/panoptyk-engine/issues/91
    _inventory: Set<number>;
    _resources: Map<string, number>;
    _gold: number;
    _recipes: Set<number>;

    _knowledge: Set<number>;

    _assignedQuests: Set<number>;
    _givenQuests: Set<number>;

    _conversation = -1;
    _conversationRequests: Set<number>;
    _conversationRequested: Set<number>;

    _trade = -1;
    _tradeRequests: Set<number>;
    _tradeRequested: Set<number>;
    //#endregion

    constructor(username: string, room?: Room, id?: number, db?: IDatabase) {
        super(id, db);
        this._agentName = username;
        this.room = room;
        this._inventory = new Set<number>();
        this._knowledge = new Set<number>();
        this._gold = 0;
        this._conversationRequests = new Set<number>();
        this._conversationRequested = new Set<number>();
        this._tradeRequests = new Set<number>();
        this._tradeRequested = new Set<number>();
        this._assignedQuests = new Set<number>();
        this._givenQuests = new Set<number>();
        this._resources = new Map<string, number>();
        this._recipes = new Set<number>();

        logger.log("Agent " + this + " Initialized.", "AGENT");
    }

    toJSON(forClient: boolean, context: any): object {
        const safeAgent = super.toJSON(forClient, context);
        if (forClient) {
            if (context && context.agent instanceof Agent) {
                const agent: Agent = context.agent;
                if (agent.id !== this.id) {
                    // TODO: Remove hidden data
                }
            }
        }
        return safeAgent;
    }
    displayName(): string {
        return this._agentName;
    }
    toString(): string {
        return this._agentName + " (id#" + this.id + ")";
    }
    equals(model: any) {
        return model instanceof Agent && this.id === model.id;
    }

    activeConversationRequestTo(other: Agent): boolean {
        return this._conversationRequested.has(other.id);
    }

    activeTradeRequestTo(other: Agent): boolean {
        return this._tradeRequested.has(other.id);
    }

    inConversation(): boolean {
        return this._conversation > 0;
    }

    inTrade(): boolean {
        return this._trade > 0;
    }

    getInfoRef(targetInfo: Info): Info {
        throw new Error("Method not implemented.");
    }

    hasItem(item: Item): boolean {
        return this._inventory.has(item.id);
    }

    hasInfo(info: Info): boolean {
        return this._knowledge.has(info.id);
    }

    hasGold(gold: number): boolean {
        return this._gold >= gold;
    }
}
