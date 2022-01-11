import { BaseModel } from "./Imodel";
import { IDatabase } from "../database/IDatabase";
import { logger } from "../utilities";
import { Agent } from "./agent";
import { Item } from "./item";

export interface AnswerInfo {
    answerID: number;
    maskedInfo: string[];
}

export class Trade extends BaseModel {
    displayName(): string {
        throw new Error("Method not implemented.");
    }
    toString(): string {
        return "Trade (id#" + this.id + ")";
    }
    equals(model: any) {
        return model instanceof Trade && this.id === model.id;
    }

    set initiator(initiator: Agent) {
        this._initiator = initiator ? initiator.id : -1;
    }

    get initiator(): Agent {
        return this.db.retrieveModel(this._initiator, Agent);
    }

    set receiver(receiver: Agent) {
        this._receiver = receiver ? receiver.id : -1;
    }

    get receiver(): Agent {
        return this.db.retrieveModel(this._receiver, Agent);
    }

    set itemsFromInitiator(items: Item[]) {
        this._itemsFromInitiator = items ? new Set(items.map(item => item.id)) : new Set<ItemID>();
    }

    get itemsFromInitiator(): Item[] {
        return this.db.retrieveModels(
            [...this._itemsFromInitiator],
            Item
        ) as Item[];
    }

    set itemsFromReceiver(items: Item[]) {
        this._itemsFromReceiver = items ? new Set(items.map(item => item.id)) : new Set<ItemID>();
    }

    get itemsFromReceiver(): Item[] {
        return this.db.retrieveModels(
            [...this._itemsFromReceiver],
            Item
        ) as Item[];
    }

    _initiator: AgentID;
    _receiver: AgentID;
    _status: number;  // 0: failed, 1: success, 2: in-progress
    _itemsFromInitiator: Set<ItemID>;
    _itemsFromReceiver: Set<ItemID>;
    
    constructor(initiator: Agent, receiver: Agent, itemsFromInitiator?: Item[], itemsFromReceiver?: Item[], id?: number, db?: IDatabase) {
        super(id, db);

        this.initiator = initiator;
        this.receiver = receiver;
        this._itemsFromInitiator
        this.itemsFromInitiator = itemsFromInitiator;
        this.itemsFromReceiver = itemsFromReceiver;
        this._status = 2;

        logger.log("Trade " + this + " Initialized", "TRADE");
    }

    toJSON(forClient: boolean, context: any): object {
        const safeTrade = super.toJSON(forClient, context);
        return safeTrade;
    }

    updateTradeStatus(status: number) {
        this._status = status;
    }
}
