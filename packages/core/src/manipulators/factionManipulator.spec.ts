import { assert } from "chai";
import "mocha";
import { MemoryDatabase } from "../database/MemoryDatabase";
import AppContext from "../utilities/AppContext";
import { Agent, Item, Room, Conversation, Faction } from "../models";
import { FactionManipulator } from "./factionManipulator";

describe("Faction Manipulator", () => {
    let db: MemoryDatabase;
    let agent: Agent;
    let faction: Faction;
    beforeEach(() => {
        db = new MemoryDatabase();
        AppContext.db = db;
        agent = new Agent("A");
        faction = new Faction("F", "");
    });
    context("Add/Remove Agent", () => {
        it("basic", () => {
            // add
            FactionManipulator.addAgentToFaction(faction, agent);

            assert.equal(faction.members.length, 1);
            assert.isTrue(faction.includesAgent(agent));
            const status = faction.getFactionStatusOfAgent(agent);
            assert.isDefined(status);
            assert.equal(status.rank, 1);

            // removal
            FactionManipulator.removeAgentFromFaction(faction, agent);

            assert.equal(faction.members.length, 0);
            assert.isFalse(faction.includesAgent(agent));
            assert.isUndefined(faction.getFactionStatusOfAgent(agent));
        });
    });
});