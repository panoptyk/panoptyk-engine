import { assert } from "chai";
import "mocha";
import { MemoryDatabase } from "../database/MemoryDatabase";
import inject from "../utilities/injectables";
import { Agent, Item, Room, Conversation } from "../models";
import { Information } from "./information";
import { TA, PredicateTA, TAR, PredicateTAR } from "./predicates";

describe("Information Model", () => {
  let db: MemoryDatabase;
  let agentA: Agent;
  let agentB: Agent;
  let roomA: Room;
  beforeEach(() => {
    db = new MemoryDatabase();
    inject.db = db;
    agentA = new Agent("A");
    agentB = new Agent("B");
    roomA = new Room("A", 1);
  });
  context("ID numbering", () => {
    it("basic creation", () => {
      const info1 = new Information<TA>(
        "test",
        new PredicateTA({ time: 123, agent: agentA })
      );
      const info2 = new Information<TAR>(
        "test",
        new PredicateTAR({ time: 123, agent: agentA, room: roomA })
      );
      const roomB = new Room("B", 1);
      const info3 = new Information<TAR>(
        "test",
        new PredicateTAR({ time: 123, agent: agentB, room: roomA })
      );
      const info4 = new Information<TA>(
        "test",
        new PredicateTA({ time: 123, agent: agentB })
      );

      assert.equal(info1.id, 1);
      assert.equal(info2.id, 2);
      assert.equal(info3.id, 3);
      assert.equal(info4.id, 4);
    });
    it("with copies", () => {
      const info1 = new Information<TA>(
        "test",
        new PredicateTA({ time: 123, agent: agentA })
      );
      const info1c = info1.getCopy(agentA);
      const info2 = new Information<TAR>(
        "test",
        new PredicateTAR({ time: 123, agent: agentA, room: roomA })
      );
      const info2c = info2.getCopy(agentA);
      const info3 = new Information<TAR>(
        "test",
        new PredicateTAR({ time: 123, agent: agentB, room: roomA })
      );
      const info3c = info3.getCopy(agentA);
      const info4 = new Information<TA>(
        "test",
        new PredicateTA({ time: 123, agent: agentB })
      );
      const info4c = info4.getCopy(agentA);
      const info4cc = info4.getCopy(agentB);

      assert.equal(info1.id, 1);
      assert.equal(info1c.id, 2);
      assert.equal(info2.id, 3);
      assert.equal(info2c.id, 4);
      assert.equal(info3.id, 5);
      assert.equal(info3c.id, 6);
      assert.equal(info4.id, 7);
      assert.equal(info4c.id, 8);
      assert.equal(info4cc.id, 9);
    });
  });
});
