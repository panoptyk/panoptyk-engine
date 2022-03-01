import { BaseModel } from "./Imodel";
import { IDatabase } from "../database/IDatabase";
import { logger } from "../utilities";
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
    tradeStatus: number;
    _itemIDs: Map<number, Set<number>>;
    _itemRequests: Map<number, Request[]>;

    _answerIDs: Map<number, Map<number, AnswerInfo[]>>;
    _answerRequests: Map<number, Request[]>;

    _gold: Map<number, number>;
    _goldRequest: Map<number, Request>;

    status: Map<number, boolean>;

    static activeTrades: Set<number> = new Set();

    set conversation(conversation: Conversation) {
        this._conversation = conversation ? conversation.id : -1;
    }

    get conversation(): Conversation {
        return this.db.retrieveModel(this._conversation, Conversation);
    }

    get agents(): Agent[] {
        return this.db.retrieveModels([...this._agentIDs], Agent);
    }

    get answerIDs() {
        return this._answerIDs;
    }

    get itemIDs() {
        return this._itemIDs;
    }

    get gold() {
        return this._gold;
    }

    get itemRequests() {
        return this._itemRequests;
    }

    get goldRequest() {
        return this._goldRequest;
    }

    get answerRequests() {
        return this._answerRequests;
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
        this.tradeStatus = TradeStatus.IN_PROGRESS;
        this._itemIDs = new Map();
        this._itemRequests = new Map();
        this._answerIDs = new Map();
        this._answerRequests = new Map();
        this._gold = new Map();
        this._goldRequest = new Map();
        this.status = new Map();

        if (initiator) {
            this.status.set(initiator.id, false);
            this._gold.set(initiator.id, 0);
            this._agentIDs.add(initiator.id);
        }
        if (receiver) {
            this.status.set(receiver.id, false);
            this._gold.set(receiver.id, 0);
            this._agentIDs.add(receiver.id);
        }

        logger.log("Trade " + this + " Initialized.", "TRADE");
    }

    displayName(): string {
        return this.toString();
    }

    toString(): string {
        return "Trade (id#" + this.id + ")";
    }
    
    equals(model: any) {
        return model instanceof Trade && this.id === model.id;
    }

    toJSON(forClient: boolean, context: any): object {
        const safeTrade = super.toJSON(forClient, context);
        return safeTrade;
    }
}
