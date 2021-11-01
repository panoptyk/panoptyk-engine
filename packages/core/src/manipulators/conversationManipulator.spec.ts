import { assert } from "chai";
import "mocha";
import { MemoryDatabase } from "../database/MemoryDatabase";
import AppContext from "../utilities/AppContext";
import { Agent, Conversation, Room, Information } from "../models";
import { ConversationManipulator } from "./conversationManipulator";
import { T, TA, PredicateT, PredicateTA } from "../models/information/predicates";

describe("Conversation Manipulator", () => {
    let db: MemoryDatabase;
    let conversation: Conversation;
    let room: Room;
    beforeEach(() => {
        db = new MemoryDatabase();
        AppContext.db = db;
        room = new Room("R", 5);
        conversation = new Conversation(room);
    });
    context("Adds Agent to Conversation", () => {
        it("Once", () => {
            const agent1: Agent = new Agent("A1");

            db.storeModels([conversation, room, agent1]);

            ConversationManipulator.addAgentToConversation(
                conversation,
                agent1
            );

            assert.sameDeepMembers([agent1], conversation.participants);
        });
        it("Multiple Times", () => {
            const agent1: Agent = new Agent("A1");
            const agent2: Agent = new Agent("A2");

            db.storeModels([conversation, room, agent1, agent2]);

            ConversationManipulator.addAgentToConversation(
                conversation,
                agent1
            );
            ConversationManipulator.addAgentToConversation(
                conversation,
                agent2
            );

            assert.sameDeepMembers([agent1, agent2], conversation.participants);
        });
    });
    context("Removes Agent from Conversation", () => {
        it("Once", () => {
            const agent1: Agent = new Agent("A1");

            db.storeModels([conversation, room, agent1]);

            ConversationManipulator.addAgentToConversation(
                conversation,
                agent1
            );

            assert.sameDeepMembers([agent1], conversation.participants);

            ConversationManipulator.removeAgentFromConversation(
                conversation,
                agent1
            );

            assert.sameDeepMembers([], conversation.participants);
        });
        it("Once When Multiple are Present", () => {
            const agent1: Agent = new Agent("A1");
            const agent2: Agent = new Agent("A2");

            db.storeModels([conversation, room, agent1, agent2]);

            ConversationManipulator.addAgentToConversation(
                conversation,
                agent1
            );
            ConversationManipulator.addAgentToConversation(
                conversation,
                agent2
            );

            assert.sameDeepMembers([agent1, agent2], conversation.participants);

            ConversationManipulator.removeAgentFromConversation(
                conversation,
                agent1
            );

            assert.sameDeepMembers([agent2], conversation.participants);
        });
        it("Multiple Times", () => {
            const agent1: Agent = new Agent("A1");
            const agent2: Agent = new Agent("A2");

            db.storeModels([conversation, room, agent1, agent2]);

            ConversationManipulator.addAgentToConversation(
                conversation,
                agent1
            );
            ConversationManipulator.addAgentToConversation(
                conversation,
                agent2
            );

            assert.sameDeepMembers([agent1, agent2], conversation.participants);

            ConversationManipulator.removeAgentFromConversation(
                conversation,
                agent1
            );
            ConversationManipulator.removeAgentFromConversation(
                conversation,
                agent2
            );

            assert.sameDeepMembers([], conversation.participants);
        });
    });
    context("Adds Info to Conversation", () => {
        it("Once", () => {
            const agent1: Agent = new Agent("A1");
            const agent2: Agent = new Agent("A2");
            const info_to_be_told = new Information<T>(
                "test",
                new PredicateT({ time: 123 })
            );

            db.storeModels([conversation, room, agent1, agent2]);

            ConversationManipulator.addAgentToConversation(conversation, agent1);
            ConversationManipulator.addAgentToConversation(conversation, agent2);
            ConversationManipulator.addInfoToConversation(conversation, info_to_be_told);

            assert.sameDeepMembers(conversation.infos, [info_to_be_told]);
        });
        it("Multiple Times", () => {
            const agent1: Agent = new Agent("A1");
            const agent2: Agent = new Agent("A2");
            const info_to_be_told = new Information<T>(
                "test",
                new PredicateT({ time: 123 })
            );
            const another_info_to_be_told = new Information<TA>(
                "test",
                new PredicateTA({ time: 456, agent: agent2})
            )

            db.storeModels([conversation, room, agent1, agent2]);

            ConversationManipulator.addAgentToConversation(conversation, agent1);
            ConversationManipulator.addAgentToConversation(conversation, agent2);
            ConversationManipulator.addInfoToConversation(conversation, info_to_be_told);
            ConversationManipulator.addInfoToConversation(conversation, another_info_to_be_told);

            assert.sameDeepMembers(conversation.infos, [info_to_be_told, another_info_to_be_told]);

            context("Removes Info from Conversation", () => {
                it("Removes One from Multiple", () => {
                    ConversationManipulator.removeInfoFromConversation(conversation, info_to_be_told);

                    assert.sameDeepMembers(conversation.infos, [another_info_to_be_told]);
                });
            });
        }); 
    });
    
});
