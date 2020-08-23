import { BaseController } from "./baseController";
import { Agent, Item, Info, Room, Conversation } from "../models";
import { format } from "path";

export class AgentController extends BaseController {

    addItemInventory(agent: Agent, item: Item): void {
        agent._inventory.add(item.id);
    }

    removeItemInventory(agent: Agent, item: Item): void {
        agent._inventory.delete(item.id);
    }

    addInfo(agent: Agent, info: Info): void {
        agent._knowledge.add(info.id);
    }

    deleteInfo(agent: Agent, info: Info): void {
        agent._knowledge.add(info.id);
    }

    putInRoom(agent: Agent, room: Room): void {
        agent.room = room;
    }

    removeFromRoom(agent: Agent, room: Room): void {
        agent.room = undefined;
    }

    requestConversation(from: Agent, to: Agent): void {
        from._conversationRequested.add(to.id);
        to._conversationRequests.add(from.id);
    }

    removeRequestedCovnersation(from: Agent, to: Agent): void {
        from._conversationRequested.delete(to.id);
        to._conversationRequests.delete(from.id);
    }

    requestTrade(from: Agent, to: Agent): void {
        from._tradeRequested.add(to.id);
        to._tradeRequests.add(from.id);
    }

    removeRequestedTrade(from: Agent, to: Agent): void {
        from._tradeRequested.delete(to.id);
        to._tradeRequests.delete(to.id);
    }

    joinConversation(agent: Agent, conversation: Conversation): void {
        agent.conversation = conversation;
    }

    leaveConversation(agent: Agent, conversation: Conversation): void {
        agent.conversation = undefined;
    }

    addQuest() {
        throw new Error ("Quest not implemented");
    }

    modifyGold(agent: Agent, amount: number): void {
        agent._gold += amount;
    }

}