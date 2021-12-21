import { assert, expect } from "chai";
import "mocha";
import AppContext from "../../utilities/AppContext";
import { MemoryDatabase } from "../../database/MemoryDatabase";
import { Agent, Item, Quest, Room } from "..";
import {
    T,
    TA,
    TAA,
    TAAR,
    TAARK,
    TAARQ,
    TAR,
    TARI,
    TARR,
    PredicateT,
    PredicateTA,
    PredicateTAA,
    PredicateTAAR,
    PredicateTAARK,
    PredicateTAARQ,
    PredicateTAR,
    PredicateTARI,
    PredicateTARR,
    QUERY,
    metadata,
    PredicateTerms,
} from "./predicates";
import { Actions, Query } from "./actionshortcuts";
import { Information } from "./information";
import { InformationManipulator } from "../../manipulators/informationManipulator";

describe("Information Model", () => {
    let agentA: Agent;
    let agentB: Agent;
    let roomA: Room;
    let roomB: Room;
    let itemA: Item;
    beforeEach(() => {
        AppContext.defaultInitialize();
        agentA = new Agent("A");
        agentB = new Agent("B");
        roomA = new Room("A", 1);
        roomB = new Room("B", 1);
        itemA = new Item("A");
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
    context("toJSON <-> fromJSON", () => {
        it("basic", () => {
            const info1 = new Information<T>(
                "test",
                new PredicateT({ time: 123 })
            );
            const metaData: metadata<T> = {
                time: true,
            };
            InformationManipulator.setMask(info1, {
                action: false,
                predMetaData: metaData,
            });
            const json = info1.toJSON(false, {});
            assert.exists(json);

            const info = new Information(
                "",
                undefined,
                false,
                undefined,
                info1.id
            );
            info.fromJSON(json);
            assert.deepEqual(info, info1);
        });
        it("all predicates", () => {
            const infoA = new Information<T>(
                "test",
                new PredicateT({ time: 123 })
            );
            const quest = new Quest(agentA, agentB, infoA, "ACTIVE", 123);
            const infos: { [key: string]: Information<PredicateTerms> } = {
                infoT: new Information<T>(
                    "test",
                    new PredicateT({ time: 123 })
                ),
                infoTA: new Information<TA>(
                    "test",
                    new PredicateTA({ time: 123, agent: agentA })
                ),
                infoTAA: new Information<TAA>(
                    "test",
                    new PredicateTAA({ time: 123, agent: agentA, agentB })
                ),
                infoTAAR: new Information<TAAR>(
                    "test",
                    new PredicateTAAR({
                        time: 123,
                        agent: agentA,
                        agentB,
                        room: roomA,
                    })
                ),
                infoTAARK: new Information<TAARK>(
                    "test",
                    new PredicateTAARK({
                        time: 123,
                        agent: agentA,
                        agentB,
                        room: roomA,
                        info: infoA,
                    })
                ),
                infoTAARQ: new Information<TAARQ>(
                    "test",
                    new PredicateTAARQ({
                        time: 123,
                        agent: agentA,
                        agentB,
                        room: roomA,
                        quest,
                    })
                ),
                infoTAR: new Information<TAR>(
                    "test",
                    new PredicateTAR({ time: 123, agent: agentA, room: roomA })
                ),
                infoTARI: new Information<TARI>(
                    "test",
                    new PredicateTARI({
                        time: 123,
                        agent: agentA,
                        room: roomA,
                        item: itemA,
                    })
                ),
                infoTARR: new Information<TARR>(
                    "test",
                    new PredicateTARR({
                        time: 123,
                        agent: agentA,
                        room: roomA,
                        roomB,
                    })
                ),
            };

            for (const key in infos) {
                const infoMaster = infos[key];
                const infoMasterJson: any = infos[key].toJSON(false, {});
                const infoCopy = infoMaster.getCopy(agentA);
                const infoCopyJson: any = infoCopy.toJSON(false, {});
                assert.exists(
                    infoMasterJson,
                    "failed to create json for info(master) " + key
                );
                assert.exists(
                    infoCopyJson,
                    "failed to create json for info(copy) " + key
                );
                const newInfoMaster = new Information(
                    "",
                    undefined,
                    false,
                    undefined,
                    infoMasterJson.id
                );
                const newInfoCopy = new Information(
                    "",
                    undefined,
                    false,
                    undefined,
                    infoCopyJson.id
                );

                // Test master info fromJson
                assert.doesNotThrow(() => {
                    newInfoMaster.fromJSON(infoMasterJson);
                }, "failed to create info(master) from json for " + key);
                assert.deepEqual(
                    newInfoMaster,
                    infoMaster,
                    "info(master) from json not equal for " + key
                );
                // Test copy info fromJson
                assert.doesNotThrow(() => {
                    newInfoCopy.fromJSON(infoCopyJson);
                }, "failed to create info(copy) from json for " + key);
                assert.deepEqual(
                    newInfoCopy,
                    infoCopy,
                    "info(copy) from json not equal for " + key
                );
            }
        });
    });
    context("isAnswer", () => {
        it("exact", () => {
            const mov1 = Actions.moved({
                time: 123,
                agent: agentA,
                room: roomA,
                roomB,
            });
            const mov2 = Actions.moved({
                time: 123,
                agent: agentA,
                room: roomB,
                roomB: roomA,
            });
            const mov1c = mov1.getCopy();

            const movQ = Query.moved({
                time: 123,
                agent: agentA,
                room: roomA,
                roomB,
            });
            const movQc = movQ.getCopy();
            assert.equal(movQ.isAnswer(mov1), true);
            assert.equal(movQ.isAnswer(mov1c), true);
            assert.equal(movQc.isAnswer(mov1c), true);
            assert.equal(movQ.isAnswer(mov2), false);
        });
        it("same predicate", () => {
            const mov1 = Actions.moved({
                time: 123,
                agent: agentA,
                room: roomA,
                roomB,
            });
            const mov2 = Actions.moved({
                time: 123,
                agent: agentA,
                room: roomB,
                roomB: roomA,
            });
            const mov1c = mov1.getCopy();

            const movQ = Query.moved({
                time: 123,
                agent: agentA,
                room: roomA,
                roomB: QUERY,
            });
            const movQ2 = Query.moved({
                time: 123,
                agent: agentA,
                room: QUERY,
                roomB: QUERY,
            });
            const movQc = movQ.getCopy();

            assert.equal(movQ.isAnswer(mov1), true);
            assert.equal(movQ.isAnswer(mov1c), true);
            assert.equal(movQc.isAnswer(mov1c), true);
            assert.equal(movQ.isAnswer(mov2), false);

            assert.equal(movQ2.isAnswer(mov1), true);
            assert.equal(movQ2.isAnswer(mov2), true);
        });
        it("different predicate", () => {
            const mov1 = Actions.moved({
                time: 123,
                agent: agentA,
                room: roomA,
                roomB,
            });
            const mov2 = Actions.moved({
                time: 123,
                agent: agentB,
                room: roomB,
                roomB: roomA,
            });
            const mov3 = Actions.conversed({
                time: 123,
                agent: agentA,
                agentB,
                room: roomA,
            });
            const mov1c = mov1.getCopy();

            const movQ = Query.about.agent(agentA);
            const movQc = movQ.getCopy();
            assert.equal(movQ.isAnswer(mov1), true);
            assert.equal(movQ.isAnswer(mov3), true);
            assert.equal(movQ.isAnswer(mov1c), true);
            assert.equal(movQc.isAnswer(mov1c), true);
            assert.equal(movQ.isAnswer(mov2), false);
        });
    });
});
