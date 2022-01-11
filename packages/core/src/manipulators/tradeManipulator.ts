import { Trade, Agent, Item } from "../models";

export class TradeManipulator {
    static addItem(trade: Trade, agent: Agent, item: Item) {
        if (trade.initiator === agent) {
            trade._itemsFromInitiator.add(item.id);
        }
        else if (trade.receiver === agent) {
            trade._itemsFromReceiver.add(item.id);
        }
    }

    static removeItem(trade: Trade, agent: Agent, item: Item) {
        if (trade.initiator === agent) {
            trade._itemsFromInitiator.delete(item.id);
        }
        else if (trade.receiver === agent) {
            trade._itemsFromReceiver.delete(item.id);
        }
    }
}