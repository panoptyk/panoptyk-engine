import { 
    Agent, 
    Trade, 
    Item,
    TradeManipulator 
} from "@panoptyk/core";
import { BaseController } from "./baseController";

export class TradeController extends BaseController {
    addItems(agent: Agent, trade: Trade, items: Item[]) {
        items.forEach(item => TradeManipulator.addItem(trade, agent, item));
    }

    removeItems(agent: Agent, trade: Trade, items: Item[]) {
        items.forEach(item => TradeManipulator.removeItem(trade, agent, item));
    }
}
