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

    cancelTrade(
        trade: Trade
    ): void {
        const agents = trade.agents;

        TradeManipulator.removeFromActiveTrades(trade);
        trade.tradeStatus = TradeStatus.FAILED;

        agents.forEach(agent => {
            this.removeAgentFromTrade(agent);
        
            const items = TradeController.getAgentItemsOffered(agent, trade);

            items.forEach(item => item.inTransaction = false);

            TradeManipulator.removeAllOffersFromTrade(trade, agent);

            this.updateChanges(agent, [agent, trade, items]);
        });
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

        return trade;
    }

    removeAgentFromTrade(
        agent: Agent,
    ): void {
        AgentManipulator.leaveTrade(agent);

        agent.tradesRequested.forEach((requestee) => {
            AgentManipulator.removeRequestedTrade(agent, requestee);
        });
        agent.tradeRequesters.forEach((requester) => {
            AgentManipulator.removeRequestedTrade(requester, agent);
        });
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
        if (TradeController.allAgentsReady(trade)) {
            // make transaction
            this.makeTransaction(trade);
        }

        this.updateChanges(agent, [agent, items, trade]);
    }

    removeItems(
        agent: Agent,
        trade: Trade,
        items: Item[]
    ): void {
        TradeManipulator.removeItems(trade, agent, items);

        items.forEach(item => item.inTransaction = false);

        this.updateChanges(agent, [agent, items, trade]);
    }

    offerAnswers(
        agent: Agent,
        trade: Trade,
        answer: Info,
        question: Info,
        mask: string[] = []
    ): void {
        TradeManipulator.addInfo(trade, agent, question, answer, mask);

        // perform transaction if all agents ready
        if (TradeController.allAgentsReady(trade)) {
            // make transaction
            this.makeTransaction(trade);
        }

        this.updateChanges(agent, [agent, trade]);
    }

    removeInfo(
        agent: Agent,
        trade: Trade,
        info: Info
    ): void {
        TradeManipulator.removeInfo(trade, [info], agent);

        this.updateChanges(agent, [agent, trade]);
    }

    makeTransaction(
        trade: Trade
    ): void {
        if (trade.agents.length >= 2) {
            const agent = trade.agents[0];
            const agentB = trade.agents[1];

            // trade items
            const itemsFromAgent: Item[] = TradeController.getAgentItemsOffered(agent, trade);
            const itemsFromAgentB: Item[] = TradeController.getAgentItemsOffered(agentB, trade);

            this.tradeItems(agent, agentB, itemsFromAgent);
            this.tradeItems(agentB, agent, itemsFromAgentB);

            // TO-DO: trade gold
            
            // trade info
            const questionAnswersMapFromAgent = TradeController.getAgentQuestionAnswerMap(agent, trade);
            const questionAnswersMapFromAgentB = TradeController.getAgentQuestionAnswerMap(agentB, trade);

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

    static getAgentItemsOffered(
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

    static getAgentGoldOffered(
        agent: Agent,
        trade: Trade
    ): number {
        return trade.gold.get(agent.id);
    }

    static getAgentQuestionAnswerMap(
        agent: Agent,
        trade: Trade
    ): Map<number, AnswerInfo[]> {
        let map = new Map<number, AnswerInfo[]>();

        if (trade.answerIDs.has(agent.id)) {
            map = trade.answerIDs.get(agent.id);
        }

        return map;
    }

    static getAnswers(
        agent: Agent,
        trade: Trade
    ): number[] {
        let answers = [];
        let map = TradeController.getAgentQuestionAnswerMap(agent, trade);

        map.forEach((answerInfos) => {
            answers = answers.concat(answerInfos.map(info => info.answerID));
        });

        return answers;
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

        if (TradeController.allAgentsReady(agent.trade)) {
            this.makeTransaction(agent.trade);
        }
    }

    static allAgentsReady(
        trade: Trade
    ): boolean {
        return Array.from(trade.status.values()).reduce((a, b) => a && b);
    }
}
