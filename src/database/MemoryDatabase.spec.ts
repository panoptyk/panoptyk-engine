import { assert } from "chai";
import "mocha";
import { MemoryDatabase } from "./MemoryDatabase";
import { Room, Agent, Item } from "./../models/index";
import inject from "../utilities/injectables";


describe("In-Memory Database", () => {
    let db: MemoryDatabase;
    beforeEach(() => {
        db = new MemoryDatabase();
        inject.db = db;
    });
    context("Increments ID", () => {
        it("For One Model", () => {
            assert.equal(db.getNextID(Room), 1);
            assert.equal(db.getNextID(Room), 2);
            assert.equal(db.getNextID(Room), 3);
        });

        it("For Several Models", () => {
            assert.equal(db.getNextID(Room), 1);

            assert.equal(db.getNextID(Agent), 1);
            assert.equal(db.getNextID(Agent), 2);

            assert.equal(db.getNextID(Item), 1);
            assert.equal(db.getNextID(Item), 2);
            assert.equal(db.getNextID(Item), 3);

            assert.equal(db.getNextID(Agent), 3);

            assert.equal(db.getNextID(Room), 2);
            assert.equal(db.getNextID(Room), 3);
        });

        it("When Auto-Assigning ID to Multiple Models", () => {
            const room1: Room = new Room("R1", 1);
            const room2: Room = new Room("R2", 1);
            const item1: Item = new Item("I1");
            const agent1: Agent = new Agent("A1");
            const item2: Item = new Item("I2");
            const agent2: Agent = new Agent("A2");

            assert.equal(room1.id, 1);
            assert.equal(room2.id, 2);
            assert.equal(item1.id, 1);
            assert.equal(item2.id, 2);
            assert.equal(agent1.id, 1);
            assert.equal(agent2.id, 2);
        });
    });
    context("Retrives", () => {
        it("One Model", () => {
            const room: Room = new Room("R", 1);
            db.storeModel(room);
            assert.deepEqual(room, db.retrieveModel(room.id, Room));
        });
        it("Multiple Models", () => {
            const room1: Room = new Room("R1", 1);
            const room2: Room = new Room("R2", 1);
            db.storeModels([room1, room2]);
            assert.deepEqual(room1, db.retrieveModel(room1.id, Room));
            assert.sameDeepMembers([room1, room2], db.retrieveModels([room1.id, room2.id], Room));
        });
        it("Multiple Models of Different Types", () => {
            const room1: Room = new Room("R1", 1);
            const room2: Room = new Room("R2", 1);
            const item1: Item = new Item("I1");
            const agent1: Agent = new Agent("A1");
            const item2: Item = new Item("I2");
            const agent2: Agent = new Agent("A2");

            db.storeModels([room1, room2, item1, item2, agent1, agent2]);
            assert.sameDeepMembers([room1, room2], db.retrieveModels([room1.id, room2.id], Room));
            assert.sameDeepMembers([item1, item2], db.retrieveModels([item1.id, item2.id], Item));
            assert.sameDeepMembers([agent1, agent2], db.retrieveModels([agent1.id, agent2.id], Agent));
        });
    });
});