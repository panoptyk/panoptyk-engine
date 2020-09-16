import { assert } from "chai";
import "mocha";
import inject from "../utilities/injectables";
import { MemoryDatabase } from "../database/MemoryDatabase";
import { Agent, Item, Room, Conversation } from "../models";
import { TA, PredicateTA, TAR, PredicateTAR, QUERY } from "./predicates";
import { Actions, Query } from "./actionshortcuts";
import { Information } from "./information";

describe("Information Model", () => {
  let db: MemoryDatabase;
  let agentA: Agent;
  let agentB: Agent;
  let roomA: Room;
  let roomB: Room;
  beforeEach(() => {
    db = new MemoryDatabase();
    inject.db = db;
    agentA = new Agent("A");
    agentB = new Agent("B");
    roomA = new Room("A", 1);
    roomB = new Room("B", 1);
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
  context("isAnswer", () => {
    it("exact", () => {
      const mov1 = Actions.moved({time: 123, agent: agentA, room: roomA, roomB});
      const mov2 = Actions.moved({time: 123, agent: agentA, room: roomB, roomB: roomA});
      const mov1c = mov1.getCopy();

      const movQ = Query.moved({time: 123, agent: agentA, room: roomA, roomB});
      const movQc = movQ.getCopy();
      assert.equal(movQ.isAnswer(mov1), true);
      assert.equal(movQ.isAnswer(mov1c), true);
      assert.equal(movQc.isAnswer(mov1c), true);
      assert.equal(movQ.isAnswer(mov2), false);
    });
    it("same predicate", () => {
      const mov1 = Actions.moved({time: 123, agent: agentA, room: roomA, roomB});
      const mov2 = Actions.moved({time: 123, agent: agentA, room: roomB, roomB: roomA});
      const mov1c = mov1.getCopy();

      const movQ = Query.moved({time: 123, agent: agentA, room: roomA, roomB: QUERY});
      const movQ2 = Query.moved({time: 123, agent: agentA, room: QUERY, roomB: QUERY});
      const movQc = movQ.getCopy();

      assert.equal(movQ.isAnswer(mov1), true);
      assert.equal(movQ.isAnswer(mov1c), true);
      assert.equal(movQc.isAnswer(mov1c), true);
      assert.equal(movQ.isAnswer(mov2), false);

      assert.equal(movQ2.isAnswer(mov1), true);
      assert.equal(movQ2.isAnswer(mov2), true);
    });
    it("different predicate", () => {
      const mov1 = Actions.moved({time: 123, agent: agentA, room: roomA, roomB});
      const mov2 = Actions.moved({time: 123, agent: agentB, room: roomB, roomB: roomA});
      const mov1c = mov1.getCopy();

      const movQ = Query.about.agent(agentA);
      const movQc = movQ.getCopy();
      assert.equal(movQ.isAnswer(mov1), true);
      assert.equal(movQ.isAnswer(mov1c), true);
      assert.equal(movQc.isAnswer(mov1c), true);
      assert.equal(movQ.isAnswer(mov2), false);
    });
  });
});
