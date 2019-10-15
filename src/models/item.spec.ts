import { assert } from "chai";
import "mocha";
import * as fs from "fs";
import { Item } from "./item";

const idObj = Item;

describe("Item Class", function() {
    describe("Load Function", function() {
        it("Exists", function() {
            assert.exists((Item as any).load);
        });
    });

    describe("Test Save/Load", function() {
        it("Save -> Load", function() {
            const i1 = new Item("Item 1", "type 1");
            const i2 = new Item("Item 2", "type 2");
            const i3 = new Item("Item 3", "type 3");

            assert.exists(i1);
            assert.exists(i2);
            assert.exists(i3);

            const objs = idObj.objects;
            const nextID = idObj.nextID;

            assert.exists(objs);
            assert.equal(nextID, 4);

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