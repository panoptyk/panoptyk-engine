import { assert } from "chai";
import "mocha";
import { MemoryDatabase } from "../database/MemoryDatabase";
import AppContext from "../utilities/AppContext";
import { Item, Room, Agent } from "../models";
import { ItemManipulator } from "./itemManipulator";

describe("ItemManipulator", () => {
    let db: MemoryDatabase;
    let item: Item;
    beforeEach(() => {
        db = new MemoryDatabase();
        AppContext.db = db;
        item = new Item("I");
    });
    context("Move Item", () => {
        it("Into a Room", () => {
            const room1: Room = new Room("R1", 5);

            db.storeModels([item, room1]);

            ItemManipulator.putInRoom(item, room1);

            assert.deepEqual(room1, item.room);
        });
        it("Into a New Room", () => {
            const room1: Room = new Room("R1", 5);
            const room2: Room = new Room("R2", 5);

            db.storeModels([item, room1, room2]);

            ItemManipulator.putInRoom(item, room1);

            assert.deepEqual(room1, item.room);

            ItemManipulator.putInRoom(item, room2);

            assert.deepEqual(room2, item.room);
        });
        it("Out of a Room", () => {
            const room1: Room = new Room("R1", 5);

            db.storeModels([item, room1]);

            ItemManipulator.putInRoom(item, room1);

            assert.deepEqual(room1, item.room);

            ItemManipulator.removeFromRoom(item);

            assert.equal(-1, item._room);
            assert.isUndefined(item.room);
        });
        it("Out of a Room When Not in One", () => {
            db.storeModels([item]);

            ItemManipulator.removeFromRoom(item);

            assert.equal(-1, item._room);
            assert.isUndefined(item.room);
        });
    });
    context("Give Item", () => {
        it("To One Agent", () => {
            const agent1: Agent = new Agent("A1");

            db.storeModels([item, agent1]);

            ItemManipulator.giveToAgent(item, agent1);

            assert.deepEqual(agent1, item.agent);
        });
        it("To Multiple Agents", () => {
            const agent1: Agent = new Agent("A1");
            const agent2: Agent = new Agent("A1");

            db.storeModels([item, agent1, agent2]);

            ItemManipulator.giveToAgent(item, agent1);

            assert.deepEqual(agent1, item.agent);

            ItemManipulator.giveToAgent(item, agent2);

            assert.deepEqual(agent2, item.agent);
        });
    });
    context("Take Item", () => {
        it("From Agent", () => {
            const agent1: Agent = new Agent("A1");

            db.storeModels([item, agent1]);

            ItemManipulator.giveToAgent(item, agent1);

            assert.deepEqual(agent1, item.agent);

            ItemManipulator.takeFromAgent(item);

            assert.equal(-1, item._agent);
            assert.isUndefined(item.agent);
        });
        it("From Agent When Never Given", () => {
            db.storeModels([item]);

            ItemManipulator.takeFromAgent(item);

            assert.equal(-1, item._agent);
            assert.isUndefined(item.agent);
        });
    });
});