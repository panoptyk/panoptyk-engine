import { assert } from "chai";
import "mocha";
import { MemoryDatabase } from "../../../database/MemoryDatabase";
import AppContext from "../../../utilities/AppContext";
import { Agent, Item, Room } from "../../../models";
import { masked, MASKED, metadata, query, QUERY } from "./IPredicate";
import { PredicateBase } from "./predBase";
import { T, PredicateT } from "./predT";
import { TA, PredicateTA } from "./predTA";
import { TAA, PredicateTAA } from "./predTAA";
import { TAAR, PredicateTAAR } from "./predTAAR";
import { TAARK, PredicateTAARK } from "./predTAARK";
import { TAARKK, PredicateTAARKK } from "./predTAARKK";
import { TAARQ, PredicateTAARQ } from "./predTAARQ";
import { TAR, PredicateTAR } from "./predTAR";
import { TARI, PredicateTARI } from "./predTARI";
import { TARR, PredicateTARR } from "./predTARR";
import { Information } from "../information";
import { Quest, QuestStatus } from "../../quest";

describe("PredicateBase", () => {
    let db: MemoryDatabase;
    let agent: Agent;
    beforeEach(() => {
        db = new MemoryDatabase();
        AppContext.db = db;
        agent = new Agent("A");
    });
    context("equalTerms", () => {
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

    context("getTerms", () => {
        it("PredicateT", () => {
            const terms: T = { time: 123 };
            const termsM: masked<T> = { time: MASKED };
            const termsQ: query<T> = { time: QUERY };
            const pred1 = new PredicateT(terms);
            const metaData: metadata<T> = {
                time: true,
            };
            assert.deepEqual(pred1.getTerms(), terms);
            assert.deepEqual(pred1.getTerms(metaData), termsM);
            assert.deepEqual(pred1.getTerms(metaData, true), termsQ);
        });
        it("PredicateTA", () => {
            const terms: TA = { time: 123, agent };
            const termsM: masked<TA> = { time: MASKED, agent: MASKED };
            const termsQ: query<TA> = { time: QUERY, agent: QUERY };
            const pred1 = new PredicateTA(terms);
            const metaData: metadata<TA> = {
                time: true,
                agent: true,
            };
            assert.deepEqual(pred1.getTerms(), terms);
            assert.deepEqual(pred1.getTerms(metaData), termsM);
            assert.deepEqual(pred1.getTerms(metaData, true), termsQ);
        });
        it("PredicateTAA", () => {
            const agentB = new Agent("B");
            const terms: TAA = { time: 123, agent, agentB };
            const termsM: masked<TAA> = {
                time: MASKED,
                agent: MASKED,
                agentB: MASKED,
            };
            const termsQ: query<TAA> = {
                time: QUERY,
                agent: QUERY,
                agentB: QUERY,
            };
            const pred1 = new PredicateTAA(terms);
            const metaData: metadata<TAA> = {
                time: true,
                agent: true,
                agentB: true,
            };
            assert.deepEqual(pred1.getTerms(), terms);
            assert.deepEqual(pred1.getTerms(metaData), termsM);
            assert.deepEqual(pred1.getTerms(metaData, true), termsQ);
        });
        it("PredicateTAAR", () => {
            const room = new Room("rA", 1);
            const agentB = new Agent("B");
            const terms: TAAR = { time: 123, agent, agentB, room };
            const termsM: masked<TAAR> = {
                time: MASKED,
                agent: MASKED,
                agentB: MASKED,
                room: MASKED,
            };
            const termsQ: query<TAAR> = {
                time: QUERY,
                agent: QUERY,
                agentB: QUERY,
                room: QUERY,
            };
            const pred1 = new PredicateTAAR(terms);
            const metaData: metadata<TAAR> = {
                time: true,
                agent: true,
                agentB: true,
                room: true,
            };
            assert.deepEqual(pred1.getTerms(), terms);
            assert.deepEqual(pred1.getTerms(metaData), termsM);
            assert.deepEqual(pred1.getTerms(metaData, true), termsQ);
        });
        it("PredicateTAARK", () => {
            const room = new Room("rA", 1);
            const agentB = new Agent("B");
            const infoA = new Information<T>(
                "test",
                new PredicateT({ time: 123 })
            );
            const terms: TAARK = {
                time: 123,
                agent,
                agentB,
                room,
                info: infoA,
            };
            const termsM: masked<TAARK> = {
                time: MASKED,
                agent: MASKED,
                agentB: MASKED,
                room: MASKED,
                info: MASKED,
            };
            const termsQ: query<TAARK> = {
                time: QUERY,
                agent: QUERY,
                agentB: QUERY,
                room: QUERY,
                info: QUERY,
            };
            const pred1 = new PredicateTAARK(terms);
            const metaData: metadata<TAARK> = {
                time: true,
                agent: true,
                agentB: true,
                room: true,
                info: true,
            };
            assert.deepEqual(pred1.getTerms(), terms);
            assert.deepEqual(pred1.getTerms(metaData), termsM);
            assert.deepEqual(pred1.getTerms(metaData, true), termsQ);
        });
        it("PredicateTAARKK", () => {
            const room = new Room("rA", 1);
            const agentB = new Agent("B");
            const infoA = new Information<T>(
                "test",
                new PredicateT({ time: 123 })
            );
            const infoB = new Information<T>(
                "testB",
                new PredicateT({ time: 321 })
            );
            const terms: TAARKK = {
                time: 123,
                agent,
                agentB,
                room,
                info: infoA,
                infoB: infoB
            };
            const termsM: masked<TAARKK> = {
                time: MASKED,
                agent: MASKED,
                agentB: MASKED,
                room: MASKED,
                info: MASKED,
                infoB: MASKED,
            };
            const termsQ: query<TAARKK> = {
                time: QUERY,
                agent: QUERY,
                agentB: QUERY,
                room: QUERY,
                info: QUERY,
                infoB: QUERY,
            };
            const pred1 = new PredicateTAARKK(terms);
            const metaData: metadata<TAARKK> = {
                time: true,
                agent: true,
                agentB: true,
                room: true,
                info: true,
                infoB: true,
            };
            assert.deepEqual(pred1.getTerms(), terms);
            assert.deepEqual(pred1.getTerms(metaData), termsM);
            assert.deepEqual(pred1.getTerms(metaData, true), termsQ);
        });
        it("PredicateTAARQ", () => {
            const room = new Room("rA", 1);
            const agentB = new Agent("B");
            const infoA = new Information<T>(
                "test",
                new PredicateT({ time: 123 })
            );
            const quest = new Quest(agent, agentB, infoA, QuestStatus.ACTIVE, 123);
            const terms: TAARQ = {
                time: 123,
                agent,
                agentB,
                room,
                quest,
            };
            const termsM: masked<TAARQ> = {
                time: MASKED,
                agent: MASKED,
                agentB: MASKED,
                room: MASKED,
                quest: MASKED,
            };
            const termsQ: query<TAARQ> = {
                time: QUERY,
                agent: QUERY,
                agentB: QUERY,
                room: QUERY,
                quest: QUERY,
            };
            const pred1 = new PredicateTAARQ(terms);
            const metaData: metadata<TAARQ> = {
                time: true,
                agent: true,
                agentB: true,
                room: true,
                quest: true,
            };
            assert.deepEqual(pred1.getTerms(), terms);
            assert.deepEqual(pred1.getTerms(metaData), termsM);
            assert.deepEqual(pred1.getTerms(metaData, true), termsQ);
        }),
        it("PredicateTAR", () => {
            const room = new Room("rA", 1);
            const terms: TAR = { time: 123, agent, room };
            const termsM: masked<TAR> = {
                time: MASKED,
                agent: MASKED,
                room: MASKED,
            };
            const termsQ: query<TAR> = {
                time: QUERY,
                agent: QUERY,
                room: QUERY,
            };
            const pred1 = new PredicateTAR(terms);
            const metaData: metadata<TAR> = {
                time: true,
                agent: true,
                room: true,
            };
            assert.deepEqual(pred1.getTerms(), terms);
            assert.deepEqual(pred1.getTerms(metaData), termsM);
            assert.deepEqual(pred1.getTerms(metaData, true), termsQ);
        });
        it("PredicateTARI", () => {
            const room = new Room("rA", 1);
            const item = new Item("A");
            const terms: TARI = { time: 123, agent, room, item };
            const termsM: masked<TARI> = {
                time: MASKED,
                agent: MASKED,
                room: MASKED,
                item: MASKED,
            };
            const termsQ: query<TARI> = {
                time: QUERY,
                agent: QUERY,
                room: QUERY,
                item: QUERY,
            };
            const pred1 = new PredicateTARI(terms);
            const metaData: metadata<TARI> = {
                time: true,
                agent: true,
                room: true,
                item: true,
            };
            assert.deepEqual(pred1.getTerms(), terms);
            assert.deepEqual(pred1.getTerms(metaData), termsM);
            assert.deepEqual(pred1.getTerms(metaData, true), termsQ);
        });
        it("PredicateTARR", () => {
            const room = new Room("rA", 1);
            const roomB = new Room("rB", 1);
            const terms: TARR = { time: 123, agent, room, roomB };
            const termsM: masked<TARR> = {
                time: MASKED,
                agent: MASKED,
                room: MASKED,
                roomB: MASKED,
            };
            const termsQ: query<TARR> = {
                time: QUERY,
                agent: QUERY,
                room: QUERY,
                roomB: QUERY,
            };
            const pred1 = new PredicateTARR(terms);
            const metaData: metadata<TARR> = {
                time: true,
                agent: true,
                room: true,
                roomB: true,
            };
            assert.deepEqual(pred1.getTerms(), terms);
            assert.deepEqual(pred1.getTerms(metaData), termsM);
            assert.deepEqual(pred1.getTerms(metaData, true), termsQ);
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

    context("queryCompare", () => {
        it("equal", () => {
            const pred1 = new PredicateTA({ time: 123, agent });
            const pred1Q1: metadata<TA> = {
                time: false,
                agent: false,
            };
            const pred2 = new PredicateTA({ time: 123, agent });
            assert.equal(pred1.queryCompare(pred1, pred1Q1), "equal");
            assert.equal(pred1.queryCompare(pred2, pred1Q1), "equal");
            assert.equal(pred2.queryCompare(pred1, pred1Q1), "equal");
            assert.equal(pred2.queryCompare(pred2, pred1Q1), "equal");
        });
        it("not equal", () => {
            const agentB = new Agent("B");
            const pred1 = new PredicateTA({ time: 123, agent });
            const pred1Q1: metadata<TA> = {
                time: false,
                agent: false,
            };
            const pred2 = new PredicateTA({ time: 123, agent: agentB });
            assert.equal(pred1.queryCompare(pred2, pred1Q1), "not equal");
            assert.equal(pred2.queryCompare(pred1, pred1Q1), "not equal");
        });
        it("superset", () => {
            const room = new Room("rA", 1);
            const pred1 = new PredicateTAR({ time: 123, agent, room });
            const pred1Q1: metadata<TAR> = {
                time: false,
                agent: false,
                room: false,
            };
            const pred1Q2: metadata<TAR> = {
                time: false,
                agent: false,
                room: true,
            };
            const pred2 = new PredicateTA({ time: 123, agent });
            assert.equal(pred1.queryCompare(pred2, pred1Q1), "superset");
            assert.equal(pred1.queryCompare(pred2, pred1Q2), "superset");
        });
        it("subset", () => {
            const room = new Room("rA", 1);
            const pred1 = new PredicateTAR({ time: 123, agent, room });
            const pred2 = new PredicateTA({ time: 123, agent });
            const pred2Q1: metadata<TA> = {
                time: false,
                agent: true,
            };
            assert.equal(pred2.queryCompare(pred1, pred2Q1), "subset");
        });
    });
});
