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
            const infoToBeTold = new Information<T>(
                "test",
                new PredicateT({ time: 123 })
            );

            db.storeModels([conversation, room, agent1, agent2]);

            ConversationManipulator.addAgentToConversation(conversation, agent1);
            ConversationManipulator.addAgentToConversation(conversation, agent2);
            ConversationManipulator.addInfoToConversationLog(conversation, infoToBeTold);

            assert.sameDeepMembers(conversation.log, [infoToBeTold]);
        });
        it("Multiple Times", () => {
            const agent1: Agent = new Agent("A1");
            const agent2: Agent = new Agent("A2");
            const infoToBeTold = new Information<T>(
                "test",
                new PredicateT({ time: 123 })
            );
            const anotherInfoToBeTold = new Information<TA>(
                "test",
                new PredicateTA({ time: 456, agent: agent2})
            )

            db.storeModels([conversation, room, agent1, agent2]);

            ConversationManipulator.addAgentToConversation(conversation, agent1);
            ConversationManipulator.addAgentToConversation(conversation, agent2);
            ConversationManipulator.addInfoToConversationLog(conversation, infoToBeTold);
            ConversationManipulator.addInfoToConversationLog(conversation, anotherInfoToBeTold);

            assert.sameDeepMembers(conversation.log, [infoToBeTold, anotherInfoToBeTold]);
        }); 
    });
    context("Removes Info from Conversation", () => {
        it("Removes One from Multiple", () => {
            const agent1: Agent = new Agent("A1");
            const agent2: Agent = new Agent("A2");
            const infoToBeTold = new Information<T>(
                "test",
                new PredicateT({ time: 123 })
            );
            const anotherInfoToBeTold = new Information<TA>(
                "test",
                new PredicateTA({ time: 456, agent: agent2})
            )

            db.storeModels([conversation, room, agent1, agent2]);

            ConversationManipulator.addAgentToConversation(conversation, agent1);
            ConversationManipulator.addAgentToConversation(conversation, agent2);
            ConversationManipulator.addInfoToConversationLog(conversation, infoToBeTold);
            ConversationManipulator.addInfoToConversationLog(conversation, anotherInfoToBeTold);

            ConversationManipulator.removeInfoFromConversationLog(conversation, infoToBeTold);

            assert.sameDeepMembers(conversation.log, [anotherInfoToBeTold]);
        });
        it("Removes Two from Multiple", () => {
            const agent1: Agent = new Agent("A1");
            const agent2: Agent = new Agent("A2");
            const infoToBeTold = new Information<T>(
                "test",
                new PredicateT({ time: 123 })
            );
            const anotherInfoToBeTold = new Information<TA>(
                "test",
                new PredicateTA({ time: 456, agent: agent2})
            )

            db.storeModels([conversation, room, agent1, agent2]);

            ConversationManipulator.addAgentToConversation(conversation, agent1);
            ConversationManipulator.addAgentToConversation(conversation, agent2);
            ConversationManipulator.addInfoToConversationLog(conversation, infoToBeTold);
            ConversationManipulator.addInfoToConversationLog(conversation, anotherInfoToBeTold);

            ConversationManipulator.removeInfoFromConversationLog(conversation, infoToBeTold);
            ConversationManipulator.removeInfoFromConversationLog(conversation, anotherInfoToBeTold);

            assert.sameDeepMembers(conversation.log, []);
        });
        it("Removes One from One", () => {
            const agent1: Agent = new Agent("A1");
            const agent2: Agent = new Agent("A2");
            const infoToBeTold = new Information<T>(
                "test",
                new PredicateT({ time: 123 })
            );

            db.storeModels([conversation, room, agent1, agent2]);
            
            ConversationManipulator.addAgentToConversation(conversation, agent1);
            ConversationManipulator.addAgentToConversation(conversation, agent2);
            ConversationManipulator.addInfoToConversationLog(conversation, infoToBeTold);

            ConversationManipulator.removeInfoFromConversationLog(conversation, infoToBeTold);

            assert.sameDeepMembers(conversation.log, []);
        })
    });
    context("Adds question to Conversation", () => {
        it("Once", () => {
            const agent1: Agent = new Agent("A1");
            const agent2: Agent = new Agent("A2");
            const question = new Information<T>(
                "test",
                new PredicateT({ time: 123 })
            );

            db.storeModels([conversation, room, agent1, agent2]);

            ConversationManipulator.addAgentToConversation(conversation, agent1);
            ConversationManipulator.addAgentToConversation(conversation, agent2);
            ConversationManipulator.addQuestionToAskedQuestions(conversation, question);
    
            assert.sameDeepMembers(conversation.askedQuestions, [question]);
        });
        it("Multiple Times", () => {
            const agent1: Agent = new Agent("A1");
            const agent2: Agent = new Agent("A2");
            const question = new Information<T>(
                "test",
                new PredicateT({ time: 123 })
            );
            const anotherQuestion = new Information<TA>(
                "test",
                new PredicateTA({ time: 456, agent: agent2})
            )

            db.storeModels([conversation, room, agent1, agent2]);

            ConversationManipulator.addAgentToConversation(conversation, agent1);
            ConversationManipulator.addAgentToConversation(conversation, agent2);
            ConversationManipulator.addQuestionToAskedQuestions(conversation, question);
            ConversationManipulator.addQuestionToAskedQuestions(conversation,
            anotherQuestion);

            assert.sameDeepMembers(conversation.askedQuestions, [question, anotherQuestion]);
        }); 
    });
    context("Removes Questions from Conversation", () => {
        it("Removes One from Multiple", () => {
            const agent1: Agent = new Agent("A1");
            const agent2: Agent = new Agent("A2");
            const question = new Information<T>(
                "test",
                new PredicateT({ time: 123 })
            );
            const anotherQuestion = new Information<TA>(
                "test",
                new PredicateTA({ time: 456, agent: agent2})
            )

            db.storeModels([conversation, room, agent1, agent2]);

            ConversationManipulator.addAgentToConversation(conversation, agent1);
            ConversationManipulator.addAgentToConversation(conversation, agent2);
            ConversationManipulator.addQuestionToAskedQuestions(conversation, question);
            ConversationManipulator.addQuestionToAskedQuestions(conversation, anotherQuestion);

            ConversationManipulator.removeQuestionFromAskedQuestions(conversation, question);

            assert.sameDeepMembers(conversation.askedQuestions, [anotherQuestion]);
        });
        it("Removes Two from Multiple", () => {
            const agent1: Agent = new Agent("A1");
            const agent2: Agent = new Agent("A2");
            const question = new Information<T>(
                "test",
                new PredicateT({ time: 123 })
            );
            const anotherQuestion = new Information<TA>(
                "test",
                new PredicateTA({ time: 456, agent: agent2})
            )

            db.storeModels([conversation, room, agent1, agent2]);

            ConversationManipulator.addAgentToConversation(conversation, agent1);
            ConversationManipulator.addAgentToConversation(conversation, agent2);
            ConversationManipulator.addQuestionToAskedQuestions(conversation, question);
            ConversationManipulator.addQuestionToAskedQuestions(conversation, anotherQuestion);

            ConversationManipulator.removeQuestionFromAskedQuestions(conversation, question);
            ConversationManipulator.removeQuestionFromAskedQuestions(conversation, anotherQuestion);

            assert.sameDeepMembers(conversation.askedQuestions, []);
        });
        it("Removes One from One", () => {
            const agent1: Agent = new Agent("A1");
            const agent2: Agent = new Agent("A2");
            const question = new Information<T>(
                "test",
                new PredicateT({ time: 123 })
            );

            db.storeModels([conversation, room, agent1, agent2]);
            
            ConversationManipulator.addAgentToConversation(conversation, agent1);
            ConversationManipulator.addAgentToConversation(conversation, agent2);
            ConversationManipulator.addQuestionToAskedQuestions(conversation, question);

            ConversationManipulator.removeQuestionFromAskedQuestions(conversation, question);

            assert.sameDeepMembers(conversation.askedQuestions, []);
        })
    });

});
