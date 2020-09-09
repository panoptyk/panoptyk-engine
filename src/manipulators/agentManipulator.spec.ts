import { assert } from "chai";
import "mocha";
import { MemoryDatabase } from "../database/MemoryDatabase";
import inject from "../utilities/injectables";
import { Agent, Item } from "..";
import { AgentManipulator } from "./agentManipulator";
import { Room } from "../models";


describe("Agent Manipulator", () => {
    let db: MemoryDatabase;
    let agent: Agent;
    beforeEach(() => {
        db = new MemoryDatabase();
        inject.db = db;
        agent = new Agent("A");
    });
    context("Items", () => {
        it("Adds One", () => {
            const item1 = new Item("I1");

            db.storeModels([agent, item1]);

            AgentManipulator.addItemInventory(agent, item1);

            assert.deepEqual(item1, agent.inventory[0]);
        });
        it("Adds Multiple", () => {
            const item1 = new Item("I1");
            const item2 = new Item("I2");
            const item3 = new Item("I3");

            db.storeModels([agent, item1, item2, item3]);

            AgentManipulator.addItemInventory(agent, item1);
            AgentManipulator.addItemInventory(agent, item2);
            AgentManipulator.addItemInventory(agent, item3);

            assert.sameDeepMembers([item1, item2, item3], agent.inventory);
        });
        it("Removes One", () => {
            const item1 = new Item("I1");

            db.storeModels([agent, item1]);

            AgentManipulator.addItemInventory(agent, item1);

            assert.deepEqual(item1, agent.inventory[0]);

            AgentManipulator.removeItemInventory(agent, item1);

            assert.equal(0, agent.inventory.length);
        });
        it("Removes One of Multiple", () => {
            const item1 = new Item("I1");
            const item2 = new Item("I2");
            const item3 = new Item("I3");

            db.storeModels([agent, item1, item2, item3]);

            AgentManipulator.addItemInventory(agent, item1);
            AgentManipulator.addItemInventory(agent, item2);
            AgentManipulator.addItemInventory(agent, item3);

            assert.sameDeepMembers([item1, item2, item3], agent.inventory);

            AgentManipulator.removeItemInventory(agent, item2);

            assert.sameDeepMembers([item1, item3], agent.inventory);
        });
        it("Removes Multiple", () => {
            const item1 = new Item("I1");
            const item2 = new Item("I2");
            const item3 = new Item("I3");

            db.storeModels([agent, item1, item2, item3]);

            AgentManipulator.addItemInventory(agent, item1);
            AgentManipulator.addItemInventory(agent, item2);
            AgentManipulator.addItemInventory(agent, item3);

            assert.sameDeepMembers([item1, item2, item3], agent.inventory);

            AgentManipulator.removeItemInventory(agent, item1);
            AgentManipulator.removeItemInventory(agent, item2);

            assert.sameDeepMembers([item3], agent.inventory);
        });
    });
    context("Rooms", () => {
        it("Puts Agent in Room", () => {
            const room1 = new Room("R1", 5);

            db.storeModels([agent, room1]);

            AgentManipulator.putInRoom(agent, room1);

            assert.deepEqual(room1, agent.room);
        });
        it("Puts Agent in Different Room", () => {
            const room1 = new Room("R1", 5);
            const room2 = new Room("R2", 5);

            db.storeModels([agent, room1, room2]);

            AgentManipulator.putInRoom(agent, room1);

            assert.deepEqual(room1, agent.room);

            AgentManipulator.putInRoom(agent, room2);

            assert.deepEqual(room2, agent.room);
        });
        it("Removes Agent from Room", () => {
            const room1 = new Room("R1", 5);

            db.storeModels([agent, room1]);

            AgentManipulator.putInRoom(agent, room1);

            assert.deepEqual(room1, agent.room);

            AgentManipulator.removeFromRoom(agent);

            assert.equal(-1, agent._room);
        });
    });
    context("Request Trades", () => {
        it("Requests One Trade", () => {
            const agent2 = new Agent("A2");

            db.storeModels([agent, agent2]);

            AgentManipulator.requestTrade(agent, agent2);

            assert.sameDeepMembers([agent2], agent.tradeRequested);
            assert.sameDeepMembers([agent], agent2.tradeRequesters);
        });
        it("Requests Multiple Trades", () => {
            const agent2 = new Agent("A2");
            const agent3 = new Agent("A3");
            const agent4 = new Agent("A4");

            db.storeModels([agent, agent2, agent3, agent4]);

            AgentManipulator.requestTrade(agent, agent2);
            AgentManipulator.requestTrade(agent, agent3);
            AgentManipulator.requestTrade(agent, agent4);

            assert.sameDeepMembers([agent2, agent3, agent4], agent.tradeRequested);
            assert.sameDeepMembers([agent], agent2.tradeRequesters);
            assert.sameDeepMembers([agent], agent3.tradeRequesters);
            assert.sameDeepMembers([agent], agent4.tradeRequesters);
        });
        it("Removes One Trade", () => {
            const agent2 = new Agent("A2");

            db.storeModels([agent, agent2]);

            AgentManipulator.requestTrade(agent, agent2);

            assert.sameDeepMembers([agent2], agent.tradeRequested);
            assert.sameDeepMembers([agent], agent2.tradeRequesters);

            AgentManipulator.removeRequestedTrade(agent, agent2);

            assert.sameDeepMembers([], agent.tradeRequested);
            assert.sameDeepMembers([], agent.tradeRequested);
        });
        it("Removes One of Multiple Trades", () => {
            const agent2 = new Agent("A2");
            const agent3 = new Agent("A3");
            const agent4 = new Agent("A4");

            db.storeModels([agent, agent2, agent3, agent4]);

            AgentManipulator.requestTrade(agent, agent2);
            AgentManipulator.requestTrade(agent, agent3);
            AgentManipulator.requestTrade(agent, agent4);

            assert.sameDeepMembers([agent2, agent3, agent4], agent.tradeRequested);
            assert.sameDeepMembers([agent], agent2.tradeRequesters);
            assert.sameDeepMembers([agent], agent3.tradeRequesters);
            assert.sameDeepMembers([agent], agent4.tradeRequesters);

            AgentManipulator.removeRequestedTrade(agent, agent3);

            assert.sameDeepMembers([agent2, agent4], agent.tradeRequested);
            assert.sameDeepMembers([agent], agent2.tradeRequesters);
            assert.sameDeepMembers([], agent3.tradeRequesters);
            assert.sameDeepMembers([agent], agent4.tradeRequesters);
        });
        it("Removes Multiple Trades", () => {
            const agent2 = new Agent("A2");
            const agent3 = new Agent("A3");
            const agent4 = new Agent("A4");

            db.storeModels([agent, agent2, agent3, agent4]);

            AgentManipulator.requestTrade(agent, agent2);
            AgentManipulator.requestTrade(agent, agent3);
            AgentManipulator.requestTrade(agent, agent4);

            assert.sameDeepMembers([agent2, agent3, agent4], agent.tradeRequested);
            assert.sameDeepMembers([agent], agent2.tradeRequesters);
            assert.sameDeepMembers([agent], agent3.tradeRequesters);
            assert.sameDeepMembers([agent], agent4.tradeRequesters);

            AgentManipulator.removeRequestedTrade(agent, agent3);
            AgentManipulator.removeRequestedTrade(agent, agent4);

            assert.sameDeepMembers([agent2], agent.tradeRequested);
            assert.sameDeepMembers([agent], agent2.tradeRequesters);
            assert.sameDeepMembers([], agent3.tradeRequesters);
            assert.sameDeepMembers([], agent4.tradeRequesters);
        });
    });
    context("Request Conversations", () => {
        it("Requests One Conversation", () => {
            const agent2 = new Agent("A2");

            db.storeModels([agent, agent2]);

            AgentManipulator.requestConversation(agent, agent2);

            assert.sameDeepMembers([agent2], agent.conversationRequested);
            assert.sameDeepMembers([agent], agent2.conversationRequesters);
        });
        it("Requests Multiple Conversations", () => {
            const agent2 = new Agent("A2");
            const agent3 = new Agent("A3");
            const agent4 = new Agent("A4");

            db.storeModels([agent, agent2, agent3, agent4]);

            AgentManipulator.requestConversation(agent, agent2);
            AgentManipulator.requestConversation(agent, agent3);
            AgentManipulator.requestConversation(agent, agent4);

            assert.sameDeepMembers([agent2, agent3, agent4], agent.conversationRequested);
            assert.sameDeepMembers([agent], agent2.conversationRequesters);
            assert.sameDeepMembers([agent], agent3.conversationRequesters);
            assert.sameDeepMembers([agent], agent4.conversationRequesters);
        });
        it("Removes One Conversation", () => {
            const agent2 = new Agent("A2");

            db.storeModels([agent, agent2]);

            AgentManipulator.requestConversation(agent, agent2);

            assert.sameDeepMembers([agent2], agent.conversationRequested);
            assert.sameDeepMembers([agent], agent2.conversationRequesters);

            AgentManipulator.removeRequestedCovnersation(agent, agent2);

            assert.sameDeepMembers([], agent.conversationRequested);
            assert.sameDeepMembers([], agent.conversationRequested);
        });
        it("Removes One of Multiple Conversations", () => {
            const agent2 = new Agent("A2");
            const agent3 = new Agent("A3");
            const agent4 = new Agent("A4");

            db.storeModels([agent, agent2, agent3, agent4]);

            AgentManipulator.requestConversation(agent, agent2);
            AgentManipulator.requestConversation(agent, agent3);
            AgentManipulator.requestConversation(agent, agent4);

            assert.sameDeepMembers([agent2, agent3, agent4], agent.conversationRequested);
            assert.sameDeepMembers([agent], agent2.conversationRequesters);
            assert.sameDeepMembers([agent], agent3.conversationRequesters);
            assert.sameDeepMembers([agent], agent4.conversationRequesters);

            AgentManipulator.removeRequestedCovnersation(agent, agent3);

            assert.sameDeepMembers([agent2, agent4], agent.conversationRequested);
            assert.sameDeepMembers([agent], agent2.conversationRequesters);
            assert.sameDeepMembers([], agent3.conversationRequesters);
            assert.sameDeepMembers([agent], agent4.conversationRequesters);
        });
        it("Removes Multiple Conversations", () => {
            const agent2 = new Agent("A2");
            const agent3 = new Agent("A3");
            const agent4 = new Agent("A4");

            db.storeModels([agent, agent2, agent3, agent4]);

            AgentManipulator.requestConversation(agent, agent2);
            AgentManipulator.requestConversation(agent, agent3);
            AgentManipulator.requestConversation(agent, agent4);

            assert.sameDeepMembers([agent2, agent3, agent4], agent.conversationRequested);
            assert.sameDeepMembers([agent], agent2.conversationRequesters);
            assert.sameDeepMembers([agent], agent3.conversationRequesters);
            assert.sameDeepMembers([agent], agent4.conversationRequesters);

            AgentManipulator.removeRequestedCovnersation(agent, agent3);
            AgentManipulator.removeRequestedCovnersation(agent, agent4);

            assert.sameDeepMembers([agent2], agent.conversationRequested);
            assert.sameDeepMembers([agent], agent2.conversationRequesters);
            assert.sameDeepMembers([], agent3.conversationRequesters);
            assert.sameDeepMembers([], agent4.conversationRequesters);
        });
    });
    context("Gold", () => {
        it("Adds Gold", () => {
            AgentManipulator.modifyGold(agent, 10);

            assert.equal(10, agent.gold);
        });
        it("Adds Gold Multiple Times", () => {
            AgentManipulator.modifyGold(agent, 10);
            AgentManipulator.modifyGold(agent, 10);

            assert.equal(20, agent.gold);
        });
        it("Removes Gold", () => {
            AgentManipulator.modifyGold(agent, 10);
            AgentManipulator.modifyGold(agent, -5);

            assert.equal(5, agent.gold);
        });
    });
});