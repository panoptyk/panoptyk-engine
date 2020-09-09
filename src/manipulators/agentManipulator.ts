import { Agent, Item, Info, Room, Conversation } from "../models";

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
        agent._knowledge.add(info.id);
    }

    static putInRoom(agent: Agent, room: Room): void {
        agent.room = room;
    }

    static removeFromRoom(agent: Agent): void {
        agent.room = undefined;
    }

    static requestConversation(from: Agent, to: Agent): void {
        from._conversationRequested.add(to.id);
        to._conversationRequests.add(from.id);
    }

    static removeRequestedCovnersation(requester: Agent, requestee: Agent): void {
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

    static leaveConversation(agent: Agent, conversation: Conversation): void {
        agent.conversation = undefined;
    }

    static addQuest() {
        throw new Error ("Quest not implemented");
    }

    static modifyGold(agent: Agent, amount: number): void {
        agent._gold += amount;
    }

}