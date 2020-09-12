import { assert } from "chai";
import "mocha";
import { MemoryDatabase } from "../../database/MemoryDatabase";
import inject from "../../utilities/injectables";
import { Agent, Item, Room, Conversation } from "../../models";
import { MASKED, QUERY } from "./IPredicate";
import { PredicateBase } from "./predBase";
import { PredicateTAR } from "./predTAR";
import { PredicateTA } from "./predTA";

describe("PredicateBase", () => {
  let db: MemoryDatabase;
  let agent: Agent;
  beforeEach(() => {
    db = new MemoryDatabase();
    inject.db = db;
    agent = new Agent("A");
  });
  context("_equalTerms", () => {
    it("Undefined", () => {
      assert.equal(PredicateBase.equalTerms(undefined, undefined), true);
      assert.equal(PredicateBase.equalTerms(agent, undefined), false);
      assert.equal(PredicateBase.equalTerms(undefined, agent), false);
    });
    it("Primitive terms", () => {
      assert.equal(PredicateBase.equalTerms(1, 1), true);
      assert.equal(PredicateBase.equalTerms(1, 2), false);
      assert.equal(PredicateBase.equalTerms(2, 1), false);

      assert.equal(PredicateBase.equalTerms(MASKED, MASKED), true);
      assert.equal(PredicateBase.equalTerms(QUERY, QUERY), true);
      assert.equal(PredicateBase.equalTerms(MASKED, QUERY), false);
    });
    it("IModel terms", () => {
      const agentB = new Agent("B");
      assert.equal(PredicateBase.equalTerms(agent, agentB), false);
      assert.equal(PredicateBase.equalTerms(agentB, agent), false);
      assert.equal(PredicateBase.equalTerms(agent, agent), true);
      assert.equal(PredicateBase.equalTerms(agentB, agentB), true);
    });
    it("Mixed terms (should never happen)", () => {
      assert.equal(PredicateBase.equalTerms(agent, 2), false);
      assert.equal(PredicateBase.equalTerms(2, agent), false);
    });
  });

  context("compare", () => {
    it("equal", () => {
      const pred1 = new PredicateTA({ time: 123, agent });
      const pred2 = new PredicateTA({ time: 123, agent });
      assert.equal(pred1.compare(pred1), "equal");
      assert.equal(pred2.compare(pred2), "equal");
      assert.equal(pred1.compare(pred2), "equal");
      assert.equal(pred2.compare(pred1), "equal");
    });
    it("not equal", () => {
      const agentB = new Agent("B");
      const pred1 = new PredicateTA({ time: 123, agent });
      const pred2 = new PredicateTA({ time: 123, agent: agentB });
      assert.equal(pred1.compare(pred2), "not equal");
      assert.equal(pred2.compare(pred1), "not equal");
    });
    it("superset", () => {
      const room = new Room("rA", 1);
      const pred1 = new PredicateTAR({ time: 123, agent, room });
      const pred2 = new PredicateTA({ time: 123, agent });
      assert.equal(pred1.compare(pred2), "superset");
    });
    it("subset", () => {
      const room = new Room("rA", 1);
      const pred1 = new PredicateTAR({ time: 123, agent, room });
      const pred2 = new PredicateTA({ time: 123, agent });
      assert.equal(pred2.compare(pred1), "subset");
    });
  });
});
