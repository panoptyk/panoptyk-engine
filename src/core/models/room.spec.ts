import { assert } from "chai";
import "mocha";
import fs = require("fs");
import { Room } from "./room";

const idObj = Room;

describe("Room Class", function() {
    describe("Load Function", function() {
        it("Exists", function() {
            assert.exists((Room as any).load);
        });
    });

    describe("Test Save/Load", function() {
        it("Save -> Load", function() {
            const r1: any = new Room("Room 1", 5);
            const r2: any = new Room("Room 2", 7);

            r1.adjacents = [2];
            r2.adjacents = [1];

            r1.occupants = [1, 2, 3];
            r2.occupants = [4, 5, 6];

            r1.items = [11, 12, 13];
            r2.items = [21, 22, 23];

            r1.conversations = [71, 72, 73];
            r2.conversations = [81, 82, 83];
            assert.exists(r1);
            assert.exists(r2);

            const objs = idObj.objects;
            const nextID = idObj.nextID;

            assert.exists(objs);
            assert.equal(nextID, 3);

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