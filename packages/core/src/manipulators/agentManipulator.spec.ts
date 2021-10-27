import { assert } from "chai";
import "mocha";
import { MemoryDatabase } from "../database/MemoryDatabase";
import AppContext from "../utilities/AppContext";
import { Agent, Item, Room, Conversation } from "../models";
import { AgentManipulator } from "./agentManipulator";

describe("Agent Manipulator", () => {
  let db: MemoryDatabase;
  let agent: Agent;
  beforeEach(() => {
    db = new MemoryDatabase();
    AppContext.db = db;
    agent = new Agent("A");
  });
  context("Adds Items", () => {
    it("Once", () => {
      const item1 = new Item("I1");

      db.storeModels([agent, item1]);

      AgentManipulator.addItemInventory(agent, item1);

      assert.deepEqual(item1, agent.inventory[0]);
    });
    it("Multiple Times", () => {
      const item1 = new Item("I1");
      const item2 = new Item("I2");
      const item3 = new Item("I3");

      db.storeModels([agent, item1, item2, item3]);

      AgentManipulator.addItemInventory(agent, item1);
      AgentManipulator.addItemInventory(agent, item2);
      AgentManipulator.addItemInventory(agent, item3);

      assert.sameDeepMembers([item1, item2, item3], agent.inventory);
    });
  });
  context("Removes Items", () => {
    it("Once", () => {
      const item1 = new Item("I1");

      db.storeModels([agent, item1]);

      AgentManipulator.addItemInventory(agent, item1);

      assert.deepEqual(item1, agent.inventory[0]);

      AgentManipulator.removeItemInventory(agent, item1);

      assert.equal(0, agent.inventory.length);
    });
    it("Once When Multiple are Present", () => {
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
    it("Multiple Times", () => {
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
  context("Moves Agent", () => {
    it("Into a Room", () => {
      const room1 = new Room("R1", 5);

      db.storeModels([agent, room1]);

      AgentManipulator.putInRoom(agent, room1);

      assert.deepEqual(room1, agent.room);
    });
    it("Into a Different Room", () => {
      const room1 = new Room("R1", 5);
      const room2 = new Room("R2", 5);

      db.storeModels([agent, room1, room2]);

      AgentManipulator.putInRoom(agent, room1);

      assert.deepEqual(room1, agent.room);

      AgentManipulator.putInRoom(agent, room2);

      assert.deepEqual(room2, agent.room);
    });
    it("Out of Any Room", () => {
      const room1 = new Room("R1", 5);

      db.storeModels([agent, room1]);

      AgentManipulator.putInRoom(agent, room1);

      assert.deepEqual(room1, agent.room);

      AgentManipulator.removeFromRoom(agent);

      assert.equal(-1, agent._room);
      assert.isUndefined(agent.room);
    });
    it("When Not In a Room", () => {
      const room1 = new Room("R1", 5);

      db.storeModels([agent, room1]);

      AgentManipulator.removeFromRoom(agent);

      assert.equal(-1, agent._room);
      assert.isUndefined(agent.room);
    });
  });
  context("Requests Trades", () => {
    it("Once", () => {
      const agent2 = new Agent("A2");

      db.storeModels([agent, agent2]);

      AgentManipulator.requestTrade(agent, agent2);

      assert.sameDeepMembers([agent2], agent.tradeRequested);
      assert.sameDeepMembers([agent], agent2.tradeRequesters);
    });
    it("Multiple Times", () => {
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
  });
  context("Removes Trade Requests", () => {
    it("Once", () => {
      const agent2 = new Agent("A2");

      db.storeModels([agent, agent2]);

      AgentManipulator.requestTrade(agent, agent2);

      assert.sameDeepMembers([agent2], agent.tradeRequested);
      assert.sameDeepMembers([agent], agent2.tradeRequesters);

      AgentManipulator.removeRequestedTrade(agent, agent2);

      assert.sameDeepMembers([], agent.tradeRequested);
      assert.sameDeepMembers([], agent.tradeRequested);
    });
    it("Once When Multiple are present", () => {
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
    it("Multiple Times", () => {
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
  context("Requests Conversations", () => {
    it("Once", () => {
      const agent2 = new Agent("A2");

      db.storeModels([agent, agent2]);

      AgentManipulator.requestConversation(agent, agent2);

      assert.sameDeepMembers([agent2], agent.conversationRequested);
      assert.sameDeepMembers([agent], agent2.conversationRequesters);
    });
    it("Multiple Times", () => {
      const agent2 = new Agent("A2");
      const agent3 = new Agent("A3");
      const agent4 = new Agent("A4");

      db.storeModels([agent, agent2, agent3, agent4]);

      AgentManipulator.requestConversation(agent, agent2);
      AgentManipulator.requestConversation(agent, agent3);
      AgentManipulator.requestConversation(agent, agent4);

      assert.sameDeepMembers(
        [agent2, agent3, agent4],
        agent.conversationRequested
      );
      assert.sameDeepMembers([agent], agent2.conversationRequesters);
      assert.sameDeepMembers([agent], agent3.conversationRequesters);
      assert.sameDeepMembers([agent], agent4.conversationRequesters);
    });
  });
  context("Removes Conversation Requests", () => {
    it("Once", () => {
      const agent2 = new Agent("A2");

      db.storeModels([agent, agent2]);

      AgentManipulator.requestConversation(agent, agent2);

      assert.sameDeepMembers([agent2], agent.conversationRequested);
      assert.sameDeepMembers([agent], agent2.conversationRequesters);

      AgentManipulator.removeRequestedCovnersation(agent, agent2);

      assert.sameDeepMembers([], agent.conversationRequested);
      assert.sameDeepMembers([], agent.conversationRequested);
    });
    it("When Multiple are Present", () => {
      const agent2 = new Agent("A2");
      const agent3 = new Agent("A3");
      const agent4 = new Agent("A4");

      db.storeModels([agent, agent2, agent3, agent4]);

      AgentManipulator.requestConversation(agent, agent2);
      AgentManipulator.requestConversation(agent, agent3);
      AgentManipulator.requestConversation(agent, agent4);

      assert.sameDeepMembers(
        [agent2, agent3, agent4],
        agent.conversationRequested
      );
      assert.sameDeepMembers([agent], agent2.conversationRequesters);
      assert.sameDeepMembers([agent], agent3.conversationRequesters);
      assert.sameDeepMembers([agent], agent4.conversationRequesters);

      AgentManipulator.removeRequestedCovnersation(agent, agent3);

      assert.sameDeepMembers([agent2, agent4], agent.conversationRequested);
      assert.sameDeepMembers([agent], agent2.conversationRequesters);
      assert.sameDeepMembers([], agent3.conversationRequesters);
      assert.sameDeepMembers([agent], agent4.conversationRequesters);
    });
    it("Multiple Times", () => {
      const agent2 = new Agent("A2");
      const agent3 = new Agent("A3");
      const agent4 = new Agent("A4");

      db.storeModels([agent, agent2, agent3, agent4]);

      AgentManipulator.requestConversation(agent, agent2);
      AgentManipulator.requestConversation(agent, agent3);
      AgentManipulator.requestConversation(agent, agent4);

      assert.sameDeepMembers(
        [agent2, agent3, agent4],
        agent.conversationRequested
      );
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
  context("Modifies Gold", () => {
    it("To Add Gold Once", () => {
      AgentManipulator.modifyGold(agent, 10);

      assert.equal(10, agent.gold);
    });
    it("To Add Gold Multiple Times", () => {
      AgentManipulator.modifyGold(agent, 10);
      AgentManipulator.modifyGold(agent, 10);

      assert.equal(20, agent.gold);
    });
    it("To Remove Gold", () => {
      AgentManipulator.modifyGold(agent, 10);
      AgentManipulator.modifyGold(agent, -5);

      assert.equal(5, agent.gold);
    });
  });
  context("Modifies Resources", () => {
    it("To Add A New Resource Once", () => {
      AgentManipulator.modifyResources(agent, "gold", 10);

      assert.equal(10, agent.resources.get("gold"));
    });
    it("To Add A Resource Multiple Times", () => {
      AgentManipulator.modifyResources(agent, "gold", 10);
      AgentManipulator.modifyResources(agent, "gold", 10);

      assert.equal(20, agent.resources.get("gold"));
    });
    it("To Remove From A Resource", () => {
      AgentManipulator.modifyResources(agent, "gold", 10);
      AgentManipulator.modifyResources(agent, "gold", -5);

      assert.equal(5, agent.resources.get("gold"));
    });
    it("To Add Two Resources", () => {
      AgentManipulator.modifyResources(agent, "gold", 10);
      AgentManipulator.modifyResources(agent, "wood", 11);

      assert.equal(10, agent.resources.get("gold"));
      assert.equal(11, agent.resources.get("wood"));
    });
    it("To Add Multiple Resources", () => {
      AgentManipulator.modifyResources(agent, "gold", 10);
      AgentManipulator.modifyResources(agent, "wood", 11);
      AgentManipulator.modifyResources(agent, "stone", 12);

      assert.equal(10, agent.resources.get("gold"));
      assert.equal(11, agent.resources.get("wood"));
      assert.equal(12, agent.resources.get("stone"));
    });
  });
  context("Joins a Conversation", () => {
    it("Once", () => {
      const room1: Room = new Room("R1", 5);
      const conversation1 = new Conversation(room1);

      db.storeModels([agent, room1, conversation1]);

      AgentManipulator.joinConversation(agent, conversation1);

      assert.deepEqual(conversation1, agent.conversation);
    });
    it("When Already In a Covnersation", () => {
      const room1: Room = new Room("R1", 5);
      const conversation1 = new Conversation(room1);
      const conversation2 = new Conversation(room1);

      db.storeModels([agent, room1, conversation1, conversation2]);

      AgentManipulator.joinConversation(agent, conversation1);

      assert.deepEqual(conversation1, agent.conversation);

      AgentManipulator.joinConversation(agent, conversation2);

      assert.deepEqual(conversation2, agent.conversation);
    });
  });
  context("Leaves a Covnersation", () => {
    it("When In One", () => {
      const room1: Room = new Room("R1", 5);
      const conversation1 = new Conversation(room1);

      db.storeModels([agent, room1, conversation1]);

      AgentManipulator.joinConversation(agent, conversation1);

      assert.deepEqual(conversation1, agent.conversation);

      AgentManipulator.leaveConversation(agent);

      assert.equal(-1, agent._conversation);
      assert.isUndefined(agent.conversation);
    });
    it("When Not In One", () => {
      const room1: Room = new Room("R1", 5);
      const conversation1 = new Conversation(room1);

      db.storeModels([agent, room1, conversation1]);

      AgentManipulator.leaveConversation(agent);

      assert.equal(-1, agent._conversation);
      assert.isUndefined(agent.conversation);
    });
  });
});
