import { assert } from "chai";
import "mocha";
import { MemoryDatabase } from "../database/MemoryDatabase";
import inject from "../utilities/injectables";
import { Item, Room, Agent, Conversation } from "../models";
import { RoomManipulator } from "./roomManipulator";

describe("RoomManipulator", () => {
    let db: MemoryDatabase;
    let room: Room;
    beforeEach(() => {
        db = new MemoryDatabase();
        inject.db = db;
        room = new Room("R", 5);
    });
    context("Connect Two-Way", () => {
        it("To Another Room", () => {
            const room2: Room = new Room("R2", 5);

            db.storeModels([room, room2]);

            RoomManipulator.connectRooms(room, room2);

            assert.sameDeepMembers([room2], room.adjacentRooms);
            assert.sameDeepMembers([room], room2.adjacentRooms);
        });
        it("To Multiple Other Rooms", () => {
            const room2: Room = new Room("R2", 5);
            const room3: Room = new Room("R3", 5);
            const room4: Room = new Room("R4", 5);

            db.storeModels([room, room2, room3, room4]);

            RoomManipulator.connectRooms(room, room2);
            RoomManipulator.connectRooms(room, room3);
            RoomManipulator.connectRooms(room, room4);

            assert.sameDeepMembers([room2, room3, room4], room.adjacentRooms);
            assert.sameDeepMembers([room], room2.adjacentRooms);
            assert.sameDeepMembers([room], room3.adjacentRooms);
            assert.sameDeepMembers([room], room4.adjacentRooms);
        });
    });
    context("Connect One-Way", () => {
        it("To Another Room", () => {
            const room2: Room = new Room("R2", 5);

            db.storeModels([room, room2]);

            RoomManipulator.connectRooms(room, room2, false);

            assert.sameDeepMembers([room2], room.adjacentRooms);
            assert.sameDeepMembers([], room2.adjacentRooms);
        });
        it("To Multiple Other Rooms", () => {
            const room2: Room = new Room("R2", 5);
            const room3: Room = new Room("R3", 5);
            const room4: Room = new Room("R4", 5);

            db.storeModels([room, room2, room3, room4]);

            RoomManipulator.connectRooms(room, room2, false);
            RoomManipulator.connectRooms(room, room3, false);
            RoomManipulator.connectRooms(room, room4, false);

            assert.sameDeepMembers([room2, room3, room4], room.adjacentRooms);
            assert.sameDeepMembers([], room2.adjacentRooms);
            assert.sameDeepMembers([], room3.adjacentRooms);
            assert.sameDeepMembers([], room4.adjacentRooms);
        });
    });
    context("Seperate Two-Way", () => {
        it("From Another Room", () => {
            const room2: Room = new Room("R2", 5);

            db.storeModels([room, room2]);

            RoomManipulator.connectRooms(room, room2);

            assert.sameDeepMembers([room2], room.adjacentRooms);
            assert.sameDeepMembers([room], room2.adjacentRooms);

            RoomManipulator.seperateRooms(room, room2);

            assert.sameDeepMembers([], room.adjacentRooms);
            assert.sameDeepMembers([], room2.adjacentRooms);
        });
        it("From Another Room When Connected to Multiple", () => {
            const room2: Room = new Room("R2", 5);
            const room3: Room = new Room("R3", 5);
            const room4: Room = new Room("R4", 5);

            db.storeModels([room, room2, room3, room4]);

            RoomManipulator.connectRooms(room, room2);
            RoomManipulator.connectRooms(room, room3);
            RoomManipulator.connectRooms(room, room4);

            assert.sameDeepMembers([room2, room3, room4], room.adjacentRooms);
            assert.sameDeepMembers([room], room2.adjacentRooms);
            assert.sameDeepMembers([room], room3.adjacentRooms);
            assert.sameDeepMembers([room], room4.adjacentRooms);

            RoomManipulator.seperateRooms(room, room2);

            assert.sameDeepMembers([room3, room4], room.adjacentRooms);
            assert.sameDeepMembers([], room2.adjacentRooms);
            assert.sameDeepMembers([room], room3.adjacentRooms);
            assert.sameDeepMembers([room], room4.adjacentRooms);
        });
        it("From Multiple Rooms", () => {
            const room2: Room = new Room("R2", 5);
            const room3: Room = new Room("R3", 5);
            const room4: Room = new Room("R4", 5);

            db.storeModels([room, room2, room3, room4]);

            RoomManipulator.connectRooms(room, room2);
            RoomManipulator.connectRooms(room, room3);
            RoomManipulator.connectRooms(room, room4);

            assert.sameDeepMembers([room2, room3, room4], room.adjacentRooms);
            assert.sameDeepMembers([room], room2.adjacentRooms);
            assert.sameDeepMembers([room], room3.adjacentRooms);
            assert.sameDeepMembers([room], room4.adjacentRooms);

            RoomManipulator.seperateRooms(room, room2);
            RoomManipulator.seperateRooms(room, room3);

            assert.sameDeepMembers([room4], room.adjacentRooms);
            assert.sameDeepMembers([], room2.adjacentRooms);
            assert.sameDeepMembers([], room3.adjacentRooms);
            assert.sameDeepMembers([room], room4.adjacentRooms);
        });
    });
    context("Seperate One-Way", () => {
        it("From Another Room", () => {
            const room2: Room = new Room("R2", 5);

            db.storeModels([room, room2]);

            RoomManipulator.connectRooms(room, room2);

            assert.sameDeepMembers([room2], room.adjacentRooms);
            assert.sameDeepMembers([room], room2.adjacentRooms);

            RoomManipulator.seperateRooms(room, room2, false);

            assert.sameDeepMembers([], room.adjacentRooms);
            assert.sameDeepMembers([room], room2.adjacentRooms);
        });
        it("From Another Room When Connected to Multiple", () => {
            const room2: Room = new Room("R2", 5);
            const room3: Room = new Room("R3", 5);
            const room4: Room = new Room("R4", 5);

            db.storeModels([room, room2, room3, room4]);

            RoomManipulator.connectRooms(room, room2);
            RoomManipulator.connectRooms(room, room3);
            RoomManipulator.connectRooms(room, room4);

            assert.sameDeepMembers([room2, room3, room4], room.adjacentRooms);
            assert.sameDeepMembers([room], room2.adjacentRooms);
            assert.sameDeepMembers([room], room3.adjacentRooms);
            assert.sameDeepMembers([room], room4.adjacentRooms);

            RoomManipulator.seperateRooms(room, room2, false);

            assert.sameDeepMembers([room3, room4], room.adjacentRooms);
            assert.sameDeepMembers([room], room2.adjacentRooms);
            assert.sameDeepMembers([room], room3.adjacentRooms);
            assert.sameDeepMembers([room], room4.adjacentRooms);
        });
        it("From Multiple Rooms", () => {
            const room2: Room = new Room("R2", 5);
            const room3: Room = new Room("R3", 5);
            const room4: Room = new Room("R4", 5);

            db.storeModels([room, room2, room3, room4]);

            RoomManipulator.connectRooms(room, room2);
            RoomManipulator.connectRooms(room, room3);
            RoomManipulator.connectRooms(room, room4);

            assert.sameDeepMembers([room2, room3, room4], room.adjacentRooms);
            assert.sameDeepMembers([room], room2.adjacentRooms);
            assert.sameDeepMembers([room], room3.adjacentRooms);
            assert.sameDeepMembers([room], room4.adjacentRooms);

            RoomManipulator.seperateRooms(room, room2, false);
            RoomManipulator.seperateRooms(room, room3, false);

            assert.sameDeepMembers([room4], room.adjacentRooms);
            assert.sameDeepMembers([room], room2.adjacentRooms);
            assert.sameDeepMembers([room], room3.adjacentRooms);
            assert.sameDeepMembers([room], room4.adjacentRooms);
        });
    });
    context("Add Agents", () => {
        it("Once", () => {
            const agent1: Agent = new Agent("A1");

            db.storeModels([room, agent1]);

            RoomManipulator.addAgent(room, agent1);

            assert.sameDeepMembers([agent1], room.occupants);
        });
        it("Multiple Times", () => {
            const agent1: Agent = new Agent("A1");
            const agent2: Agent = new Agent("A2");
            const agent3: Agent = new Agent("A3");

            db.storeModels([room, agent1, agent2, agent3]);

            RoomManipulator.addAgent(room, agent1);
            RoomManipulator.addAgent(room, agent2);
            RoomManipulator.addAgent(room, agent3);

            assert.sameDeepMembers([agent1, agent2, agent3], room.occupants);
        });
    });
    context("Remove Agents", () => {
        it("Once", () => {
            const agent1: Agent = new Agent("A1");

            db.storeModels([room, agent1]);

            RoomManipulator.addAgent(room, agent1);

            assert.sameDeepMembers([agent1], room.occupants);

            RoomManipulator.removeAgent(room, agent1);

            assert.sameDeepMembers([], room.occupants);
        });
        it("Once When Multiple Are Present", () => {
            const agent1: Agent = new Agent("A1");
            const agent2: Agent = new Agent("A2");
            const agent3: Agent = new Agent("A3");

            db.storeModels([room, agent1, agent2, agent3]);

            RoomManipulator.addAgent(room, agent1);
            RoomManipulator.addAgent(room, agent2);
            RoomManipulator.addAgent(room, agent3);

            assert.sameDeepMembers([agent1, agent2, agent3], room.occupants);

            RoomManipulator.removeAgent(room, agent1);

            assert.sameDeepMembers([agent2, agent3], room.occupants);
        });
        it("Multiple Times", () => {
            const agent1: Agent = new Agent("A1");
            const agent2: Agent = new Agent("A2");
            const agent3: Agent = new Agent("A3");

            db.storeModels([room, agent1, agent2, agent3]);

            RoomManipulator.addAgent(room, agent1);
            RoomManipulator.addAgent(room, agent2);
            RoomManipulator.addAgent(room, agent3);

            assert.sameDeepMembers([agent1, agent2, agent3], room.occupants);

            RoomManipulator.removeAgent(room, agent1);
            RoomManipulator.removeAgent(room, agent2);

            assert.sameDeepMembers([agent3], room.occupants);
        });
    });
    context("Add Items", () => {
        it("Once", () => {
            const item1: Item = new Item("I1");

            db.storeModels([room, item1]);

            RoomManipulator.addItem(room, item1);

            assert.sameDeepMembers([item1], room.items);
        });
        it("Multiple Times", () => {
            const item1: Item = new Item("I1");
            const item2: Item = new Item("I2");
            const item3: Item = new Item("I3");

            db.storeModels([room, item1, item2, item3]);

            RoomManipulator.addItem(room, item1);
            RoomManipulator.addItem(room, item2);
            RoomManipulator.addItem(room, item3);

            assert.sameDeepMembers([item1, item2, item3], room.items);
        });
    });
    context("Remove Items", () => {
        it("Once", () => {
            const item1: Item = new Item("I1");

            db.storeModels([room, item1]);

            RoomManipulator.addItem(room, item1);

            assert.sameDeepMembers([item1], room.items);

            RoomManipulator.removeItem(room, item1);

            assert.sameDeepMembers([], room.items);
        });
        it("Once When Multiple Are Present", () => {
            const item1: Item = new Item("I1");
            const item2: Item = new Item("I2");
            const item3: Item = new Item("I3");

            db.storeModels([room, item1, item2, item3]);

            RoomManipulator.addItem(room, item1);
            RoomManipulator.addItem(room, item2);
            RoomManipulator.addItem(room, item3);

            assert.sameDeepMembers([item1, item2, item3], room.items);

            RoomManipulator.removeItem(room, item1);

            assert.sameDeepMembers([item2, item3], room.items);
        });
        it("Multiple Times", () => {
            const item1: Item = new Item("I1");
            const item2: Item = new Item("I2");
            const item3: Item = new Item("I3");

            db.storeModels([room, item1, item2, item3]);

            RoomManipulator.addItem(room, item1);
            RoomManipulator.addItem(room, item2);
            RoomManipulator.addItem(room, item3);

            assert.sameDeepMembers([item1, item2, item3], room.items);

            RoomManipulator.removeItem(room, item1);
            RoomManipulator.removeItem(room, item2);

            assert.sameDeepMembers([item3], room.items);
        });
    });
    context("Add Conversations", () => {
        it("Once", () => {
            const conversation1: Conversation = new Conversation(room);

            db.storeModels([room, conversation1]);

            RoomManipulator.addConversation(room, conversation1);

            assert.sameDeepMembers([conversation1], room.conversations);
        });
        it("Multiple Times", () => {
            const conversation1: Conversation = new Conversation(room);
            const conversation2: Conversation = new Conversation(room);
            const conversation3: Conversation = new Conversation(room);

            db.storeModels([room, conversation1, conversation2, conversation3]);

            RoomManipulator.addConversation(room, conversation1);
            RoomManipulator.addConversation(room, conversation2);
            RoomManipulator.addConversation(room, conversation3);

            assert.sameDeepMembers([conversation1, conversation2, conversation3], room.conversations);
        });
    });
    context("Remove Conversations", () => {
        it("Once", () => {
            const conversation1: Conversation = new Conversation(room);

            db.storeModels([room, conversation1]);

            RoomManipulator.addConversation(room, conversation1);

            assert.sameDeepMembers([conversation1], room.conversations);

            RoomManipulator.removeConversation(room, conversation1);

            assert.sameDeepMembers([], room.conversations);
        });
        it("Once When Multiple Are Present", () => {
            const conversation1: Conversation = new Conversation(room);
            const conversation2: Conversation = new Conversation(room);
            const conversation3: Conversation = new Conversation(room);

            db.storeModels([room, conversation1, conversation2, conversation3]);

            RoomManipulator.addConversation(room, conversation1);
            RoomManipulator.addConversation(room, conversation2);
            RoomManipulator.addConversation(room, conversation3);

            assert.sameDeepMembers([conversation1, conversation2, conversation3], room.conversations);

            RoomManipulator.removeConversation(room, conversation1);

            assert.sameDeepMembers([conversation2, conversation3], room.conversations);
        });
        it("Multiple Times", () => {
            const conversation1: Conversation = new Conversation(room);
            const conversation2: Conversation = new Conversation(room);
            const conversation3: Conversation = new Conversation(room);

            db.storeModels([room, conversation1, conversation2, conversation3]);

            RoomManipulator.addConversation(room, conversation1);
            RoomManipulator.addConversation(room, conversation2);
            RoomManipulator.addConversation(room, conversation3);

            assert.sameDeepMembers([conversation1, conversation2, conversation3], room.conversations);

            RoomManipulator.removeConversation(room, conversation1);
            RoomManipulator.removeConversation(room, conversation2);

            assert.sameDeepMembers([conversation3], room.conversations);
        });
    });
});