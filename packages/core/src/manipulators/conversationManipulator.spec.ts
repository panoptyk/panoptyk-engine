import { assert } from "chai";
import "mocha";
import { MemoryDatabase } from "../database/MemoryDatabase";
import inject from "../utilities/injectables";
import { Agent, Conversation, Room } from "../models";
import { ConversationManipulator } from "./conversationManipulator";

describe("Conversation Manipulator", () => {
    let db: MemoryDatabase;
    let conversation: Conversation;
    let room: Room;
    beforeEach(() => {
        db = new MemoryDatabase();
        inject.db = db;
        room = new Room("R", 5);
        conversation = new Conversation(room);
    });
    context("Adds Agent to Conversation", () => {
        it("Once", () => {
            const agent1: Agent = new Agent("A1");

            db.storeModels([conversation, room, agent1]);

            ConversationManipulator.addAgentToConversation(conversation, agent1);

            assert.sameDeepMembers([agent1], conversation.participants);
        });
        it("Multiple Times", () => {
            const agent1: Agent = new Agent("A1");
            const agent2: Agent = new Agent("A2");

            db.storeModels([conversation, room, agent1, agent2]);

            ConversationManipulator.addAgentToConversation(conversation, agent1);
            ConversationManipulator.addAgentToConversation(conversation, agent2);

            assert.sameDeepMembers([agent1, agent2], conversation.participants);
        });
    });
    context("Removes Agent from Conversation", () => {
        it("Once", () => {
            const agent1: Agent = new Agent("A1");

            db.storeModels([conversation, room, agent1]);

            ConversationManipulator.addAgentToConversation(conversation, agent1);

            assert.sameDeepMembers([agent1], conversation.participants);

            ConversationManipulator.removeAgentFromConversation(conversation, agent1);

            assert.sameDeepMembers([], conversation.participants);
        });
        it("Once When Multiple are Present", () => {
            const agent1: Agent = new Agent("A1");
            const agent2: Agent = new Agent("A2");

            db.storeModels([conversation, room, agent1, agent2]);

            ConversationManipulator.addAgentToConversation(conversation, agent1);
            ConversationManipulator.addAgentToConversation(conversation, agent2);

            assert.sameDeepMembers([agent1, agent2], conversation.participants);

            ConversationManipulator.removeAgentFromConversation(conversation, agent1);

            assert.sameDeepMembers([agent2], conversation.participants);
        });
        it("Multiple Times", () => {
            const agent1: Agent = new Agent("A1");
            const agent2: Agent = new Agent("A2");

            db.storeModels([conversation, room, agent1, agent2]);

            ConversationManipulator.addAgentToConversation(conversation, agent1);
            ConversationManipulator.addAgentToConversation(conversation, agent2);

            assert.sameDeepMembers([agent1, agent2], conversation.participants);

            ConversationManipulator.removeAgentFromConversation(conversation, agent1);
            ConversationManipulator.removeAgentFromConversation(conversation, agent2);

            assert.sameDeepMembers([], conversation.participants);
        });
    });
});