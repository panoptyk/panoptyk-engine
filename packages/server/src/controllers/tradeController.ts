import { 
    Agent, 
    AgentManipulator, 
    Conversation, 
    Trade, 
    TradeManipulator
} from "@panoptyk/core";
import { BaseController } from "./baseController";

export class TradeController extends BaseController {
    createTrade(
        initiator: Agent,
        receiver: Agent,
        conversation: Conversation
    ): Trade {
        const trade: Trade = new Trade(initiator, receiver, conversation);
        
        AgentManipulator.requestTrade(initiator, receiver);

        TradeManipulator.addToActiveTrades(trade);

        this.updateChanges(initiator, [initiator, trade]);
        this.updateChanges(receiver, [receiver, trade]);

        // add in trade info to conversation log
        // spread trade info to participants

        return trade;
    }
}