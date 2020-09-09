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

    static removeRequestedCovnersation(from: Agent, to: Agent): void {
        from._conversationRequested.delete(to.id);
        to._conversationRequests.delete(from.id);
    }

    static requestTrade(from: Agent, to: Agent): void {
        from._tradeRequested.add(to.id);
        to._tradeRequests.add(from.id);
    }

    static removeRequestedTrade(from: Agent, to: Agent): void {
        from._tradeRequested.delete(to.id);
        to._tradeRequests.delete(from.id);
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