import { Agent, Item, Info, Room, Conversation, Recipe, Faction } from "../models";

export class FactionManipulator {
    static addAgentToFaction(faction: Faction, agent: Agent, rank = 1) {
        // Default rank is 1, can be passed as a parameter
        faction._members.set(agent.id, rank);
    }

    static removeAgentFromFaction(faction: Faction, agent: Agent) {
        // Currently rank is lost upon removal from faction
        faction._members.delete(agent.id);
    }
}