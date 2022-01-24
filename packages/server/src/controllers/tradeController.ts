import { 
    Agent, 
    AgentManipulator, 
    Conversation, 
    Trade, 
    TradeManipulator
} from "@panoptyk/core";
import { BaseController } from "./baseController";

export class TradeController extends BaseController {
    requestTrade(
        initiator: Agent,
        receiver: Agent,
    ): void {
        AgentManipulator.requestTrade(initiator, receiver);

        this.updateChanges(initiator, [initiator]);
        this.updateChanges(receiver, [receiver]);
    }

    rejectTrade(
        initiator: Agent,
        receiver: Agent,
    ): void {
        AgentManipulator.removeRequestedTrade(initiator, receiver);

        this.updateChanges(initiator, [initiator]);
        this.updateChanges(receiver, [receiver]);
    }

    createTrade(
        initiator: Agent,
        receiver: Agent,
        conversation: Conversation
    ): Trade {
        const trade: Trade = new Trade(initiator, receiver, conversation);
        
        TradeManipulator.addToActiveTrades(trade);

        this.addAgentToTrade(initiator, trade);
        this.addAgentToTrade(receiver, trade);

        this.updateChanges(initiator, [initiator, trade]);
        this.updateChanges(receiver, [receiver, trade]);

        // TO-DO: add in trade creation info to conversation log
        // TO-DO: spread trade creation info to participants

        return trade;
    }

    addAgentToTrade(
        agent: Agent,
        trade: Trade
    ): void {
        AgentManipulator.enterTrade(agent, trade);

        agent.tradesRequested.forEach((requestee) => {
            AgentManipulator.removeRequestedTrade(agent, requestee);
        });
        agent.tradeRequesters.forEach((requester) => {
            AgentManipulator.removeRequestedTrade(requester, agent);
        });
    }

}