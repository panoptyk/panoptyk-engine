import { BaseModel } from "./Imodel";
import { IDatabase } from "../database/IDatabase";
import { logger } from "../utilities";
import { Item } from "./item";
import { Conversation } from "./conversation";
import { Agent } from "./agent";


export interface AnswerInfo {
    answerID: number;
    maskedInfo: string[];
}

export interface Request {
    data: any;
    pass: boolean;
}

export const TradeStatus = {
    FAILED: 0,
    SUCCESS: 1,
    IN_PROGRESS: 2
};

export class Trade extends BaseModel {

    _conversation: number
    _agentIDs: Set<number>;
    _conversationID: number;
    _tradeStatus: number;
    _itemIDs: Map<number, Set<number>>;
    _itemRequests: Map<number, Request[]>;

    _answerIDs: Map<number, Map<number, AnswerInfo[]>>;
    _answerRequests: Map<number, Request[]>;

    _gold: Map<number, number>;
    _goldRequest: Map<number, number>;

    _status: Map<number, boolean>;

    static activeTrades: Set<number> = new Set();

    set conversation(conversation: Conversation) {
        this._conversation = conversation ? conversation.id : -1;
    }

    get conversation(): Conversation {
        return this.db.retrieveModel(this._conversation, Conversation);
    }

    get tradeStatus(): number {
        return this._tradeStatus;
    }

    get agents(): Agent[] {
        return this.db.retrieveModels([...this._agentIDs], Agent);
    }

    constructor(
        initiator: Agent, 
        receiver: Agent, 
        conversation: Conversation,
        id?: number, 
        db?: IDatabase
    ) {
        super(id, db);

        this._agentIDs = new Set();
        this.conversation = conversation;
        this._tradeStatus = TradeStatus.IN_PROGRESS;
        this._itemIDs = new Map();
        this._itemRequests = new Map();
        this._answerIDs = new Map();
        this._answerRequests = new Map();
        this._gold = new Map();
        this._goldRequest = new Map();
        this._status = new Map();

        this._agentIDs.add(initiator.id);
        this._agentIDs.add(receiver.id);

        if (initiator) {
            this._status.set(initiator.id, false);
            this._gold.set(initiator.id, 0);
        }
        if (receiver) {
            this._status.set(receiver.id, false);
            this._gold.set(receiver.id, 0);
        }

        logger.log("Trade " + this + " Initialized.", "TRADE");
    }

    displayName(): string {
        throw new Error("Method not implemented.");
    }

    toString(): string {
        return `Trade(id#${this.id})`;
    }

    equals(model: any): boolean {
        return model instanceof Trade && this.id === model.id;
    }

    /**
     * Get item data for an agent in the trade.
     * @param {Agent} agent - agent object.
     * @returns [Item] array of agent's items involved in trade.
     */
    getAgentItemsData(agent: Agent): Item[] {
        let items: Item[] = [];

        if (this._itemIDs.has(agent?.id)) {
            items = this.db.retrieveModels([...this._itemIDs.get(agent.id)], Item);
        }

        return items;
    }

    /**
     * Client: Returns ready status of agent or nothing if agent is not part of trade
     * @param agent
     */
    getAgentReadyStatus(agent: Agent): boolean {
        let status;
        if (this._status.has(agent?.id)) {
            status = this._status.get(agent.id);
        }
        return status;
    }

    /**
     * Server: Set an agent's ready status. Returns true when both agents are ready.
     * @param {Agent} agent - agent to set status for.
     * @param {boolean} status - status. True = ready, false = not ready.
     */
    setAgentReady(agent: Agent, status: boolean) {
        this._status.set(agent.id, status);
    }

    /**
   * Server: Check if all agents are ready to complete trade
   * @return {boolean} True = all ready, false = not all ready.
   */
    allAgentsReady(): boolean {
        return Array.from(this._status.values()).reduce((a, b) => a && b);
    }
}
