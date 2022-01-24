import { 
    Agent, 
    AgentManipulator, 
    Conversation, 
    Trade, 
    TradeManipulator,
    Item,
    ItemManipulator,
    Actions,
    Info,
    Util,
    Information,
    AnswerInfo,
    TradeStatus
} from "@panoptyk/core";
import { ConversationController } from ".";
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

    offerItems(
        agent: Agent,
        trade: Trade,
        items: Item[]
    ): void {
        TradeManipulator.addItems(trade, agent, items);

        items.forEach(item => item.inTransaction = true);

        // perform transaction if all agents ready
        if (this.allAgentsReady(trade)) {
            // make transaction
            this.makeTransaction(trade);
        }

        this.updateChanges(agent, [agent, items, trade]);
    }

    makeTransaction(
        trade: Trade
    ): void {
        if (trade.agents.length >= 2) {
            const agent = trade.agents[0];
            const agentB = trade.agents[1];

            // trade items
            const itemsFromAgent: Item[] = this.getAgentItemsOffered(agent, trade);
            const itemsFromAgentB: Item[] = this.getAgentItemsOffered(agentB, trade);

            this.tradeItems(agent, agentB, itemsFromAgent);
            this.tradeItems(agentB, agent, itemsFromAgentB);

            // TO-DO: trade gold
            
            // trade info
            const questionAnswersMapFromAgent = this.getAgentQuestionAnswerMap(agent, trade);
            const questionAnswersMapFromAgentB = this.getAgentQuestionAnswerMap(agentB, trade);

            this.tradeInfo(agent, questionAnswersMapFromAgent);
            this.tradeInfo(agentB, questionAnswersMapFromAgentB);

            trade.tradeStatus = TradeStatus.SUCCESS;

            const tradeCompletedInfo = Actions.tradeCompleted({
                time: Date.now(),
                agent,
                agentB,
                room: agent.room,
                trade
            });

            this.giveInfoToAgent(tradeCompletedInfo, agent);
            this.giveInfoToAgent(tradeCompletedInfo, agentB);

            // leaving trade
            AgentManipulator.leaveTrade(agent);
            AgentManipulator.leaveTrade(agentB);

            this.updateChanges(agent, [agent, trade]);
            this.updateChanges(agentB, [agentB, trade]);
        }
    }

    tradeItems(
        giver: Agent,
        receiver: Agent,
        items: Item[]
    ): void {
        items.forEach(item => {
            item.inTransaction = false;

            AgentManipulator.addItemToInventory(receiver, item);
            AgentManipulator.removeItemFromInventory(giver, item);
            ItemManipulator.giveToAgent(item, receiver);

            this.updateChanges(giver, [giver, item]);
            this.updateChanges(receiver, [receiver, item]);
        });
    }

    tradeInfo(
        giver: Agent,
        questionAnswerMap: Map<number, AnswerInfo[]>
    ): void {
        const cc: ConversationController = new ConversationController(this);
        const conversation = giver.conversation;

        questionAnswerMap?.forEach((answerInfos, questionID) => {
            for (let answerInfo of answerInfos) {
                const question = Util.AppContext.db.retrieveModel(
                    questionID, 
                    Information
                );
                const answer = Util.AppContext.db.retrieveModel(
                    answerInfo.answerID, 
                    Information
                );

                cc.tellInfoInConversation(
                    conversation, 
                    giver, 
                    question,
                    answer
                );
            }
        });
    }

    getAgentItemsOffered(
        agent: Agent,
        trade: Trade
    ): Item[] {
        let items: Item[] = [];

        if (trade.itemIDs.has(agent.id)) {
            items = Util.AppContext.db.retrieveModels(
                [...trade.itemIDs.get(agent.id)],
                Item
            );
        }

        return items;
    }

    getAgentGoldOffered(
        agent: Agent,
        trade: Trade
    ): number {
        return trade.gold.get(agent.id);
    }

    getAgentQuestionAnswerMap(
        agent: Agent,
        trade: Trade
    ): Map<number, AnswerInfo[]> {
        let map = new Map<number, AnswerInfo[]>();

        if (trade.answerIDs.has(agent.id)) {
            map = trade.answerIDs.get(agent.id);
        }

        return map;
    }

    getAgentReadyStatus(
        agent: Agent,
        trade: Trade
    ): boolean {
        let status;

        if (trade.status.has(agent.id)) {
            status = trade.status.get(agent.id);
        }

        return status;
    }

    setAgentReady(
        agent: Agent, 
        status: boolean,
        trade: Trade
    ) {
        trade.status.set(agent.id, status);

        if (this.allAgentsReady(agent.trade)) {
            this.makeTransaction(agent.trade);
        }
    }

    allAgentsReady(
        trade: Trade
    ): boolean {
        return Array.from(trade.status.values()).reduce((a, b) => a && b);
    }
}
