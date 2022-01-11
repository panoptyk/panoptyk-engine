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

    set itemFromInitiator(item: Item) {
        this._itemFromInitiator = item ? item.id : -1;
    }

    get itemFromInitiator(): Item {
        return this.db.retrieveModel(this._itemFromInitiator, Item);
    }

    set itemFromReceiver(item: Item) {
        this._itemFromReceiver = item ? item.id: -1;
    }

    get itemFromReceiver(): Item {
        return this.db.retrieveModel(this._itemFromReceiver, Item);
    }

    _initiator: number;
    _receiver: number;
    _status: number;  // 0: failed, 1: success, 2: in-progress
    _itemFromInitiator: number;
    _itemFromReceiver: number;
    
    constructor(initiator: Agent, receiver: Agent, itemFromInitiator: Item, itemFromReceiver: Item, id?: number, db?: IDatabase) {
        super(id, db);

        this.initiator = initiator;
        this.receiver = receiver;
        this.itemFromInitiator = itemFromInitiator;
        this.itemFromReceiver = itemFromReceiver;
        this._status = 2;

        logger.log("Trade " + this + " Initialized", "TRADE");
    }

    toJSON(forClient: boolean, context: any): object {
        const safeTrade = super.toJSON(forClient, context);
        return safeTrade;
    }
}
