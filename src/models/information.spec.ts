import { assert } from "chai";
import "mocha";
import { Info } from "./information";
import * as fs from "fs";

const idObj = Info;

describe("Info Class", function() {
    describe("Load Function", function() {
        it("Exists", function() {
            assert.exists((Info as any).load);
        });
    });

    describe("Test Save/Load", function() {
        it("Save -> Load", function() {
            const i1 = new Info(undefined, 10);
            const i2 = new Info(undefined, 10);
            const i3 = new Info(undefined, 10);

            (i1 as any)._owner = 3;
            (i2 as any)._owner = 4;
            (i3 as any)._owner = 5;

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