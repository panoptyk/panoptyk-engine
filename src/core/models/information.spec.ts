import { assert } from "chai";
import "mocha";
import { Info } from "./information";
import fs = require("fs");

const idObj = Info;

describe("Info Class", function() {
    describe("Load Function", function() {
        it("Exists", function() {
            assert.exists((Info as any).load);
        });
    });

    describe("Test Save/Load", function() {
        it("Save -> Load", function() {
            assert.exists(new Info(undefined, 1, 10));
            assert.exists(new Info(undefined, 2, 10));
            assert.exists(new Info(undefined, 3, 10));

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