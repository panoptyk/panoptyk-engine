import { Trade, Agent, Item, Info } from "../models";

export class TradeManipulator {
    static addToActiveTrades(trade: Trade) {
        Trade.activeTrades.add(trade.id);
    }

    static removeFromActiveTrades(trade: Trade) {
        Trade.activeTrades.forEach(tradeID => {
            if (trade.id === tradeID) { 
                Trade.activeTrades.delete(trade.id);
            }
        });
    }

    static addItems(trade: Trade, agent: Agent, items: Item[]) {
        if (!trade._itemIDs.has(agent.id)) {
            trade._itemIDs.set(agent.id, new Set());
        }
        items.forEach(item => trade._itemIDs.get(agent.id).add(item.id));
    }

    static removeItems(trade: Trade, agent: Agent, items: Item[]) {
        if (trade._itemIDs.has(agent.id)) {
            items.forEach(item => trade._itemIDs.get(agent.id).delete(item.id));
        }
    }

    static addInfo(trade: Trade, agent: Agent, question: Info, answer: Info, maskedInfo: string[]) {
        if (!trade._answerIDs.has(agent.id)) {
            trade._answerIDs.set(agent.id, new Map());
        }
        const agentQuestionAnswerMap = trade._answerIDs.get(agent.id);
        const questionID = question.getMasterCopy().id;
        const answerID = answer.getMasterCopy().id;

        if (!agentQuestionAnswerMap.has(questionID)) {
            agentQuestionAnswerMap.set(questionID, []);
        }
        agentQuestionAnswerMap.get(questionID).push({
            answerID: answerID,
            maskedInfo
        });
    }

    static removeInfo(trade: Trade, infos: Info[], owner: Agent) {
        // TODO: what info is being passed to remove question or answer?
        // NO OP
    }

    static updateOfferedGold(trade: Trade, agent: Agent, amount: number) {
        if (!trade._gold.has(agent.id)) {
            trade._gold.set(agent.id, 0);
        }
        const gold = trade._gold.get(agent.id);
        trade._gold.set(agent.id, Math.max(0, gold + amount));
    }
    
    static removeAllOffersFromTrade(trade: Trade, agent: Agent) {
        trade._gold.set(agent.id, 0);
        trade._itemIDs.set(agent.id, new Set());
        trade._answerIDs.set(agent.id, new Map());
    }

    static addItemsToItemRequests(trade: Trade, agent: Agent, items: Item[]) {
        if (!trade._itemRequests.has(agent.id)) {
            trade._itemRequests.set(agent.id, []);
        }
        
        items.forEach(item => {
            if (
                !trade._itemRequests
                    .get(agent.id)
                    .reduce((a, b) => a || b.data === item.id, false)
            ) {
                trade._itemRequests.get(agent.id).push({
                    data: item.id,
                    pass: false
                });
            }
        });
    }

    static removeItemFromItemRequests(trade: Trade, agent: Agent, items: Item[]) {
        const itemIDs = items.map(item => item.id);

        if (trade._itemRequests.has(agent.id)) {
            const itemRequests = trade._itemRequests.get(agent.id);

            trade._itemRequests.set(
                agent.id,
                itemRequests.filter(request => !itemIDs.includes(request.data))
            );
        }
    }

    static passOnRequestedItems(trade: Trade, agent: Agent, items: Item[]) {
        const itemIDs = items.map(item => item.id);

        if (trade._itemRequests.has(agent.id)) {
            for (let req of trade._itemRequests.get(agent.id)) {
                if (itemIDs.includes(req.data)) {
                    req.pass = true;
                }
            }
        }
    }

    static addQuestionsToAnswerRequests(trade: Trade, agent: Agent, questions: Info[]) {
        if (!trade._answerRequests.has(agent.id)) {
            trade._answerRequests.set(agent.id, []);
        }

        questions.forEach(question => {
            const questionID = question.getMasterCopy().id;
            if (
                !trade._answerRequests
                    .get(agent.id)
                    .reduce((a, b) => a || b.data === questionID, false)
            ) {
                trade._answerRequests.get(agent.id).push({
                    data: questionID,
                    pass: false
                });
            }
        })
        
    }

    static removeQuestionsFromAnswerRequests(trade: Trade, agent: Agent, questions: Info[]) {
        const questionIDs = questions.map(question => question.getMasterCopy().id);

        if (trade._answerRequests.has(agent.id)) {
            const answerRequests = trade._answerRequests.get(agent.id);

            trade._answerRequests.set(
                agent.id, 
                answerRequests.filter(request => !questionIDs.includes(request.data))
            );
        }
    }

    static passOnRequestedQuestions(trade: Trade, agent: Agent, questions: Info[]) {
        const questionIDs = questions.map(question => question.getMasterCopy().id);

        if (trade._answerRequests.has(agent.id)) {
            for (let req of trade._answerRequests.get(agent.id)) {
                if (questionIDs.includes(req.data)) {
                    req.pass = true;
                }
            }
        }
    }

    static updateGoldInGoldRequest(trade: Trade, agent: Agent, amount: number) {
        if (!trade._goldRequest.has(agent.id)) {
            trade._goldRequest.set(agent.id, 0);
        }
        const gold = trade._goldRequest.get(agent.id);
        trade._goldRequest.set(agent.id, gold + amount);
    }
}
