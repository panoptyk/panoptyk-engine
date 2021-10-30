import { assert, expect } from "chai";
import "mocha";
import AppContext from "../utilities/AppContext";
import { Agent } from "./agent";
import { Faction } from "./faction";
import { FactionManipulator } from "../manipulators/factionManipulator";

describe("Faction Model", () => {
    let agentA: Agent;
    let agentB: Agent;
    let faction: Faction;
    beforeEach(() => {
        AppContext.defaultInitialize();
        agentA = new Agent("A");
        agentB = new Agent("B");
        faction = new Faction("F", "");
    });
    context("toJSON <-> fromJSON", () => {
        it("basic", () => {
            FactionManipulator.addAgentToFaction(faction, agentA);
            FactionManipulator.addAgentToFaction(faction, agentB, 5);

            const factionJson: any = faction.toJSON(false, {});
            const newFaction = new Faction("Fnew", "", factionJson.id);

            assert.doesNotThrow(() => {
                newFaction.fromJSON(factionJson);
            });
            assert.deepEqual(faction, newFaction);
        });
    });
});
