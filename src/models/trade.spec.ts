import { assert } from "chai";
import "mocha";
import * as fs from "fs";
import { Trade } from "./trade";
import { Conversation } from "./conversation";
import { Room } from "./room";
import { Item } from "./item";
import { Agent } from "./agent";
import { logger } from "../utilities/logger";

const idObj = Trade;

describe("Trade Class", function() {
    describe("Load Function", function() {
        it("Exists", function() {
            assert.exists((Trade as any).load);
        });
    });

    describe("Test Save/Load", function() {
        it("Save -> Load", function() {
            const r1: any = new Room("room1", 15);
            const a1: any = new Agent("agent1", r1);
            const a2: any = new Agent("agent2", r1);
            const c1: any = new Conversation(r1);
            (c1 as Conversation).add_agent(a1);
            (c1 as Conversation).add_agent(a2);
            const t1: any = new Trade(a1, a2, c1);

            assert.exists(t1);

            const objs = idObj.objects;
            const nextID = idObj.nextID;

            assert.exists(objs);
            assert.equal(nextID, 2);

            idObj.fileName = "testSave.json";
            idObj.saveAll();

            assert.isTrue(fs.existsSync(idObj.getPath()));

            idObj.purge();
            assert.isEmpty(idObj.objects);

            idObj.loadAll();

            assert.deepEqual(idObj.objects, objs);
            assert.equal(idObj.nextID, nextID);

            fs.unlinkSync(idObj.getPath());
        });
    });
});