import { 
    Agent, 
    Item, 
    Info, 
    Room, 
    Conversation, 
    Recipe, 
    Faction,
    Trade
} from "../models";

export class AgentManipulator {
    static putInRoom(agent: Agent, room: Room): void {
        agent.room = room;
    }

    static removeFromRoom(agent: Agent): void {
        agent.room = undefined;
    }

    static addItemToInventory(agent: Agent, item: Item): void {
        agent._inventory.add(item.id);
    }

    static addInfo(agent: Agent, info: Info): void {
        agent._knowledge.add(info.id);
    }

    static deleteInfo(agent: Agent, info: Info): void {
        agent._knowledge.delete(info.id);
    }

    static removeItemFromInventory(agent: Agent, item: Item): void {
        agent._inventory.delete(item.id);
    }

    static modifyResources(
        agent: Agent,
        resource: string,
        amount: number
    ): void {
        if (agent._resources.has(resource)) {
            const curAmount = agent._resources.get(resource);
            agent._resources.set(resource, curAmount + amount);
        } else {
            agent._resources.set(resource, amount);
        }
    }

    static modifyGold(agent: Agent, amount: number): void {
        agent._gold += amount;
    }

    static addRecipe(agent: Agent, recipe: Recipe): void {
        agent._recipes.add(recipe.id);
    }

    static deleteRecipe(agent: Agent, recipe: Recipe): void {
        agent._recipes.delete(recipe.id);
    }

    static requestConversation(requester: Agent, requestee: Agent): void {
        requester._conversationsRequested.add(requestee.id);
        requestee._conversationRequests.add(requester.id);
    }

    static removeRequestedConversation(
        requester: Agent,
        requestee: Agent
    ): void {
        requester._conversationsRequested.delete(requestee.id);
        requestee._conversationRequests.delete(requester.id);
    }

    static requestTrade(requester: Agent, requestee: Agent): void {
        requester._tradesRequested.add(requestee.id);
        requestee._tradeRequests.add(requester.id);
    }

    static removeRequestedTrade(requester: Agent, requestee: Agent): void {
        requester._tradesRequested.delete(requestee.id);
        requestee._tradeRequests.delete(requester.id);
    }

    static joinConversation(agent: Agent, conversation: Conversation): void {
        agent.conversation = conversation;
    }

    static leaveConversation(agent: Agent): void {
        agent.conversation = undefined;
    }

    static addQuest() {
        throw new Error("Quest not implemented");
    }

    static joinFaction(agent: Agent, faction: Faction) {
        agent._factions.add(faction.id);
    }

    static leaveFaction(agent: Agent, faction: Faction) {
        agent._factions.delete(faction.id);
    }

    static addTradeRequest(agent: Agent, trade: Trade): void {
        agent._tradeRequests.add(trade.id);
    }

    static removeTradeRequest(agent: Agent, trade: Trade): void {
        agent._tradeRequests.delete(trade.id);
    }

    static addTradeRequested(agent: Agent, trade: Trade): void {
        agent._tradesRequested.add(trade.id);
    }

    static removeTradeRequested(agent: Agent, trade: Trade): void {
        agent._tradesRequested.delete(trade.id);
    }
}
