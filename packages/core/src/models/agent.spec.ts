// import { assert } from "chai";
// import "mocha";
// import * as fs from "fs";
// import { Agent } from "./agent";

// const idObj = Agent;

// describe("Agent Class", function() {
//     describe("Load Function", function() {
//         it("Exists", function() {
//             assert.exists((Agent as any).load);
//         });
//     });

//     describe("Test Save/Load", function() {
//         it("Save -> Load", function() {
//             const a1: any = new Agent("Agent 1");
//             const a2: any = new Agent("Agent 2");

//             a1.roomID = 3;
//             a2.roomID = 4;

//             a1._knowledge = new Set([11, 12, 13]);
//             a2._knowledge = new Set([21, 22, 23]);

//             a1._inventory = new Set([3, 2, 1]);
//             a2._inventory = new Set([5, 6, 7]);

//             assert.exists(a1);
//             assert.exists(a2);

//             const objs = idObj.objects;
//             const nextID = idObj.nextID;

//             assert.exists(objs);
//             assert.equal(nextID, 3);

//             idObj.fileName = "testSave.json";
//             idObj.saveAll();

//             assert.isTrue(fs.existsSync(idObj.getPath()));

//             idObj.purge();
//             assert.isEmpty(idObj.objects);

//             idObj.loadAll();

//             assert.deepEqual(idObj.objects, objs);
//             assert.equal(idObj.nextID, nextID);

//             fs.unlinkSync(idObj.getPath());
//         });
//     });
// });