import { Agent, Item, Info, Room, Conversation, Recipe } from "../models";

export class AgentManipulator {
    static addItemInventory(agent: Agent, item: Item): void {
        agent._inventory.add(item.id);
    }

    static removeItemInventory(agent: Agent, item: Item): void {
        agent._inventory.delete(item.id);
    }

    static addInfo(agent: Agent, info: Info): void {
        agent._knowledge.add(info.id);
    }

    static deleteInfo(agent: Agent, info: Info): void {
        agent._knowledge.delete(info.id);
    }

    static putInRoom(agent: Agent, room: Room): void {
        agent.room = room;
    }

    static removeFromRoom(agent: Agent): void {
        agent.room = undefined;
    }

    static requestConversation(requester: Agent, requestee: Agent): void {
        requester._conversationRequested.add(requestee.id);
        requestee._conversationRequests.add(requester.id);
    }

    static removeRequestedCovnersation(
        requester: Agent,
        requestee: Agent
    ): void {
        requester._conversationRequested.delete(requestee.id);
        requestee._conversationRequests.delete(requester.id);
    }

    static requestTrade(requester: Agent, requestee: Agent): void {
        requester._tradeRequested.add(requestee.id);
        requestee._tradeRequests.add(requester.id);
    }

    static removeRequestedTrade(requester: Agent, requestee: Agent): void {
        requester._tradeRequested.delete(requestee.id);
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

    static learnRecipe(agent: Agent, recipe: Recipe): void {
        agent._recipes.add(recipe.id);
    }
}
