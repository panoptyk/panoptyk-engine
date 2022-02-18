import { assert } from "chai";
import "mocha";
import { MemoryDatabase } from "../database/MemoryDatabase";
import AppContext from "../utilities/AppContext";
import { Trade, Item, Agent, Conversation, Room, Information } from "../models";
import { TradeManipulator } from "./tradeManipulator";
import { PredicateT, T } from "../models/information";

describe("TradeManipulator", () => {
    let db: MemoryDatabase;
    let trade: Trade;
    let initiator: Agent;
    let receiver: Agent;
    let conversation: Conversation;
    beforeEach(() => {
        db = new MemoryDatabase();
        AppContext.db = db;
        initiator = new Agent("A");
        receiver = new Agent("B");
        conversation = new Conversation(new Room("R", 5));
        trade = new Trade(initiator, receiver, conversation);
    });
    context("Add Items", () => {
        it("Once", () => {
            const item = new Item("I1");

            db.storeModels([trade, initiator, item]);

            TradeManipulator.addItems(trade, initiator, [item]);
            const res = new Map([
                [initiator.id, new Set([item.id])
            ]]);

            assert.hasAllDeepKeys(res, Array.from(trade._itemIDs.keys()));
            assert.sameDeepMembers(Array.from(res), Array.from(trade._itemIDs));
        });
        it("Multiple Times", () => {
            const item = new Item("I1");
            const item2 = new Item("I2");

            db.storeModels([trade, initiator, item, item2]);

            TradeManipulator.addItems(trade, initiator, [item, item2]);
            
            const res = new Map([
                [initiator.id, new Set([item.id, item2.id])
            ]]);

            assert.hasAllDeepKeys(res, Array.from(trade._itemIDs.keys()));
            assert.sameDeepMembers(Array.from(res), Array.from(trade._itemIDs));
        });
    });
    context("Remove Items", () => {
        it("Once", () => {
            const item = new Item("I1");

            db.storeModels([trade, initiator, item]);

            TradeManipulator.addItems(trade, initiator, [item]);
            
            const res = new Map([
                [initiator.id, new Set([item.id])
            ]]);

            assert.hasAllDeepKeys(res, Array.from(trade._itemIDs.keys()));
            assert.sameDeepMembers(Array.from(res), Array.from(trade._itemIDs));

            TradeManipulator.removeItems(trade, initiator, [item]);

            const res2 = new Map([
                [initiator.id, new Set([])]
            ]);

            assert.hasAllDeepKeys(res2, Array.from(trade._itemIDs.keys()));
            assert.sameDeepMembers(Array.from(res2), Array.from(trade._itemIDs));
        });
        it("Once When Multiple Are Present", () => {
            const item = new Item("I1");
            const item2 = new Item("I2");
            const item3 = new Item("I3");

            db.storeModels([trade, initiator, receiver, item, item2, item3]);

            TradeManipulator.addItems(trade, initiator, [item, item2]);
            TradeManipulator.addItems(trade, receiver, [item3]);
            
            const res = new Map([
                [initiator.id, new Set([item.id, item2.id])],
                [receiver.id, new Set([item3.id])]
            ]);

            assert.hasAllDeepKeys(res, Array.from(trade._itemIDs.keys()));
            assert.sameDeepMembers(Array.from(res), Array.from(trade._itemIDs));

            TradeManipulator.removeItems(trade, initiator, [item2]);

            const res2 = new Map([
                [initiator.id, new Set([item.id])],
                [receiver.id, new Set([item3.id])]
            ]);

            assert.hasAllDeepKeys(res2, Array.from(trade._itemIDs.keys()));
            assert.sameDeepMembers(Array.from(res2), Array.from(trade._itemIDs));
        });
        it("Multiple Times", () => {
            const item = new Item("I1");
            const item2 = new Item("I2");
            const item3 = new Item("I3");

            db.storeModels([trade, initiator, receiver, item, item2, item3]);

            TradeManipulator.addItems(trade, initiator, [item, item2]);
            TradeManipulator.addItems(trade, receiver, [item3]);
            
            const res = new Map([
                [initiator.id, new Set([item.id, item2.id])],
                [receiver.id, new Set([item3.id])]
            ]);

            assert.hasAllDeepKeys(res, Array.from(trade._itemIDs.keys()));
            assert.sameDeepMembers(Array.from(res), Array.from(trade._itemIDs));

            TradeManipulator.removeItems(trade, initiator, [item2]);
            TradeManipulator.removeItems(trade, receiver, [item3]);

            const res2 = new Map([
                [initiator.id, new Set([item.id])],
                [receiver.id, new Set([])]
            ]);

            assert.hasAllDeepKeys(res2, Array.from(trade._itemIDs.keys()));
            assert.sameDeepMembers(Array.from(res2), Array.from(trade._itemIDs));
        });
    });
    context("Add Info", () => {
        it("Once", () => {
            const question = new Information<T>(
                "test",
                new PredicateT({time: 123})
            );
            const answer = new Information<T>(
                "test",
                new PredicateT({time: 123})
            );
            
            db.storeModels([trade, initiator, question, answer]);

            TradeManipulator.addInfo(trade, initiator, question, answer, []);
            
            const res = new Map([
                [initiator.id, new Map([
                    [question.id, [{
                        answerID: answer.id,
                        maskedInfo: []
                    }]]
                ])]
            ]);

            assert.hasAllDeepKeys(res, Array.from(trade._answerIDs.keys()));
            assert.sameDeepMembers(Array.from(res), Array.from(trade._answerIDs));
        });
        it("Multiple Times", () => {
            const question = new Information<T>(
                "test",
                new PredicateT({time: 123})
            );
            const question2 = new Information<T>(
                "test",
                new PredicateT({time: 123})
            );
            const answer = new Information<T>(
                "test",
                new PredicateT({time: 123})
            );
            const answer2 = new Information<T>(
                "test",
                new PredicateT({time: 123})
            );
            const answer3 = new Information<T>(
                "test",
                new PredicateT({time: 123})
            );
            
            db.storeModels([trade, initiator, receiver, question, question2, answer, answer2, answer3]);

            TradeManipulator.addInfo(trade, initiator, question, answer, []);
            TradeManipulator.addInfo(trade, initiator, question, answer2, []);
            TradeManipulator.addInfo(trade, receiver, question2, answer3, []);
            
            const res = new Map([
                [initiator.id, new Map([
                    [   
                        question.id, [
                        {
                            answerID: answer.id,
                            maskedInfo: []
                        },
                        {
                            answerID: answer2.id,
                            maskedInfo: []
                        }
                        ]
                    ]
                ])],
                [receiver.id, new Map([
                    [
                        question2.id, [
                        {
                            answerID: answer3.id,
                            maskedInfo: []
                        }
                        ]
                    ]
                ])]
            ]);

            assert.hasAllDeepKeys(res, Array.from(trade._answerIDs.keys()));
            assert.sameDeepMembers(Array.from(res), Array.from(trade._answerIDs));
        });
    });
    context("Update Offered Gold", () => {
        it("Add Gold", () => {
            db.storeModels([trade, initiator]);

            TradeManipulator.updateOfferedGold(trade, initiator, 10);

            const res = new Map([
                [initiator.id, 10],
                [receiver.id, 0]
            ]);

            assert.hasAllDeepKeys(res, Array.from(trade._gold.keys()));
            assert.sameDeepMembers(Array.from(res), Array.from(trade._gold));
        });
        it("Remove God", () => {
            db.storeModels([trade, initiator]);

            TradeManipulator.updateOfferedGold(trade, initiator, 10);

            const res = new Map([
                [initiator.id, 10],
                [receiver.id, 0]
            ]);

            assert.hasAllDeepKeys(res, Array.from(trade._gold.keys()));
            assert.sameDeepMembers(Array.from(res), Array.from(trade._gold));

            TradeManipulator.updateOfferedGold(trade, initiator, -6);

            const res2 = new Map([
                [initiator.id, 4],
                [receiver.id, 0]
            ]);

            assert.hasAllDeepKeys(res2, Array.from(trade._gold.keys()));
            assert.sameDeepMembers(Array.from(res2), Array.from(trade._gold));
        });
    });
    context("Remove All Offers From Trade", () => {
        it("Remove From One Agent", () => {
            db.storeModels([trade, initiator]);

            TradeManipulator.updateOfferedGold(trade, initiator, 10);

            const res = new Map([
                [initiator.id, 10],
                [receiver.id, 0]
            ]);

            assert.hasAllDeepKeys(res, Array.from(trade._gold.keys()));
            assert.sameDeepMembers(Array.from(res), Array.from(trade._gold));

            TradeManipulator.removeAllOffersFromTrade(trade, initiator);

            const res2 = new Map([
                [initiator.id, 0],
                [receiver.id, 0]
            ]);

            assert.hasAllDeepKeys(res2, Array.from(trade._gold.keys()));
            assert.sameDeepMembers(Array.from(res2), Array.from(trade._gold));
            assert.sameDeepMembers(Array.from(new Map([[initiator.id, new Set()]])), Array.from(trade._itemIDs));
            assert.sameDeepMembers(Array.from(new Map([[initiator.id, new Map()]])), Array.from(trade._answerIDs));

        });
    });
    context("Add Items To Item Requests", () => {
        it("Add One Item", () => {
            const item = new Item("I1");

            db.storeModels([trade, initiator, item]);

            TradeManipulator.addItemsToItemRequests(trade, initiator, [item]);

            const res = new Map([
                [initiator.id, [{data: item.id, pass: false}]]
            ]);

            assert.hasAllDeepKeys(res, Array.from(trade._itemRequests.keys()));
            assert.sameDeepMembers(Array.from(res), Array.from(trade._itemRequests));
        });
        it("Add Multiple Items", () => {
            const item = new Item("I1");
            const item2 = new Item("I2");
            const item3 = new Item("I3");

            db.storeModels([trade, initiator, receiver, item, item2, item3]);

            TradeManipulator.addItemsToItemRequests(trade, initiator, [item, item2]);
            TradeManipulator.addItemsToItemRequests(trade, receiver, [item3]);

            const res = new Map([
                [initiator.id, [
                    {data: item.id, pass: false},
                    {data: item2.id, pass: false}
                ]],
                [receiver.id, [
                    {data: item3.id, pass: false}
                ]]
            ]);

            assert.hasAllDeepKeys(res, Array.from(trade._itemRequests.keys()));
            assert.sameDeepMembers(Array.from(res), Array.from(trade._itemRequests));
        });
    });
    context("Remove Items From Item Requests", () => {
        it("One Item", () => {
            const item = new Item("I1");

            db.storeModels([trade, initiator, item]);

            TradeManipulator.addItemsToItemRequests(trade, initiator, [item]);

            const res = new Map([
                [initiator.id, [{data: item.id, pass: false}]]
            ]);

            assert.hasAllDeepKeys(res, Array.from(trade._itemRequests.keys()));
            assert.sameDeepMembers(Array.from(res), Array.from(trade._itemRequests));

            TradeManipulator.removeItemFromItemRequests(trade, initiator, [item]);

            const res2 = new Map([
                [initiator.id, []]
            ]);

            assert.hasAllDeepKeys(res2, Array.from(trade._itemRequests.keys()));
            assert.sameDeepMembers(Array.from(res2), Array.from(trade._itemRequests));
        });
        it("One Item When Multiple Are Present", () => {
            const item = new Item("I1");
            const item2 = new Item("I2");
            const item3 = new Item("I3");

            db.storeModels([trade, initiator, receiver, item, item2, item3]);

            TradeManipulator.addItemsToItemRequests(trade, initiator, [item, item2]);
            TradeManipulator.addItemsToItemRequests(trade, receiver, [item3]);

            const res = new Map([
                [initiator.id, [
                    {data: item.id, pass: false},
                    {data: item2.id, pass: false}
                ]],
                [receiver.id, [
                    {data: item3.id, pass: false}
                ]]
            ]);

            assert.hasAllDeepKeys(res, Array.from(trade._itemRequests.keys()));
            assert.sameDeepMembers(Array.from(res), Array.from(trade._itemRequests));

            TradeManipulator.removeItemFromItemRequests(trade, initiator, [item2]);

            const res2 = new Map([
                [initiator.id, [
                    {data: item.id, pass: false},
                ]],
                [receiver.id, [
                    {data: item3.id, pass: false}
                ]]
            ]);

            assert.hasAllDeepKeys(res2, Array.from(trade._itemRequests.keys()));
            assert.sameDeepMembers(Array.from(res2), Array.from(trade._itemRequests));
        });
        it("Multiple Items", () => {
            const item = new Item("I1");
            const item2 = new Item("I2");
            const item3 = new Item("I3");

            db.storeModels([trade, initiator, receiver, item, item2, item3]);

            TradeManipulator.addItemsToItemRequests(trade, initiator, [item, item2]);
            TradeManipulator.addItemsToItemRequests(trade, receiver, [item3]);

            const res = new Map([
                [initiator.id, [
                    {data: item.id, pass: false},
                    {data: item2.id, pass: false}
                ]],
                [receiver.id, [
                    {data: item3.id, pass: false}
                ]]
            ]);

            assert.hasAllDeepKeys(res, Array.from(trade._itemRequests.keys()));
            assert.sameDeepMembers(Array.from(res), Array.from(trade._itemRequests));

            TradeManipulator.removeItemFromItemRequests(trade, initiator, [item2]);
            TradeManipulator.removeItemFromItemRequests(trade, receiver, [item3]);

            const res2 = new Map([
                [initiator.id, [
                    {data: item.id, pass: false},
                ]],
                [receiver.id, [
                ]]
            ]);

            assert.hasAllDeepKeys(res2, Array.from(trade._itemRequests.keys()));
            assert.sameDeepMembers(Array.from(res2), Array.from(trade._itemRequests));
        });
    });
    context("Pass On Requested Items", () => {
        it("One Item", () => {
            const item = new Item("I1");
            const item2 = new Item("I2");
            const item3 = new Item("I3");

            db.storeModels([trade, initiator, receiver, item, item2, item3]);

            TradeManipulator.addItemsToItemRequests(trade, initiator, [item, item2]);
            TradeManipulator.addItemsToItemRequests(trade, receiver, [item3]);

            const res = new Map([
                [initiator.id, [
                    {data: item.id, pass: false},
                    {data: item2.id, pass: false}
                ]],
                [receiver.id, [
                    {data: item3.id, pass: false}
                ]]
            ]);

            assert.hasAllDeepKeys(res, Array.from(trade._itemRequests.keys()));
            assert.sameDeepMembers(Array.from(res), Array.from(trade._itemRequests));

            TradeManipulator.passOnRequestedItems(trade, initiator, [item2]);

            const res2 = new Map([
                [initiator.id, [
                    {data: item.id, pass: false},
                    {data: item2.id, pass: true}
                ]],
                [receiver.id, [
                    {data: item3.id, pass: false}
                ]]
            ]);

            assert.hasAllDeepKeys(res2, Array.from(trade._itemRequests.keys()));
            assert.sameDeepMembers(Array.from(res2), Array.from(trade._itemRequests));
        });
        it("Multiple Items", () => {
            const item = new Item("I1");
            const item2 = new Item("I2");
            const item3 = new Item("I3");

            db.storeModels([trade, initiator, receiver, item, item2, item3]);

            TradeManipulator.addItemsToItemRequests(trade, initiator, [item, item2]);
            TradeManipulator.addItemsToItemRequests(trade, receiver, [item3]);

            const res = new Map([
                [initiator.id, [
                    {data: item.id, pass: false},
                    {data: item2.id, pass: false}
                ]],
                [receiver.id, [
                    {data: item3.id, pass: false}
                ]]
            ]);

            assert.hasAllDeepKeys(res, Array.from(trade._itemRequests.keys()));
            assert.sameDeepMembers(Array.from(res), Array.from(trade._itemRequests));

            TradeManipulator.passOnRequestedItems(trade, initiator, [item2]);
            TradeManipulator.passOnRequestedItems(trade, receiver, [item3]);

            const res2 = new Map([
                [initiator.id, [
                    {data: item.id, pass: false},
                    {data: item2.id, pass: true}
                ]],
                [receiver.id, [
                    {data: item3.id, pass: true}
                ]]
            ]);

            assert.hasAllDeepKeys(res2, Array.from(trade._itemRequests.keys()));
            assert.sameDeepMembers(Array.from(res2), Array.from(trade._itemRequests));
        });
    });
    context("Add Questions To Answer Requests", () => {
        it("Add One Question", () => {
            const question = new Information<T>(
                "test",
                new PredicateT({time: 123})
            );
            
            db.storeModels([trade, initiator, question]);

            TradeManipulator.addQuestionsToAnswerRequests(trade, initiator, [question]);

            const res = new Map([
                [initiator.id, [{data: question.id, pass: false}]]
            ]);

            assert.hasAllDeepKeys(res, Array.from(trade._answerRequests.keys()));
            assert.sameDeepMembers(Array.from(res), Array.from(trade._answerRequests));
        });
        it("Add Multiple Questions", () => {
            const question = new Information<T>(
                "test",
                new PredicateT({time: 123})
            );
            const question2 = new Information<T>(
                "test",
                new PredicateT({time: 123})
            );
            const question3 = new Information<T>(
                "test",
                new PredicateT({time: 123})
            );
            
            db.storeModels([trade, initiator, receiver, question, question2, question3]);

            TradeManipulator.addQuestionsToAnswerRequests(trade, initiator, [question, question2]);
            TradeManipulator.addQuestionsToAnswerRequests(trade, receiver, [question3]);
            
            const res = new Map([
                [initiator.id, [
                    {
                        data: question.id,
                        pass: false
                    },
                    {
                        data: question2.id,
                        pass: false
                    }
                ]],
                [receiver.id, [
                    {
                        data: question3.id,
                        pass: false
                    }
                ]]
            ]);

            assert.hasAllDeepKeys(res, Array.from(trade._answerRequests.keys()));
            assert.sameDeepMembers(Array.from(res), Array.from(trade._answerRequests));
        });
    });
    context("Remove Questions From Answer Requests", () => {
        it("One Question", () => {
            const question = new Information<T>(
                "test",
                new PredicateT({time: 123})
            );
            
            db.storeModels([trade, initiator, question]);

            TradeManipulator.addQuestionsToAnswerRequests(trade, initiator, [question]);

            const res = new Map([
                [initiator.id, [{data: question.id, pass: false}]]
            ]);

            assert.hasAllDeepKeys(res, Array.from(trade._answerRequests.keys()));
            assert.sameDeepMembers(Array.from(res), Array.from(trade._answerRequests));

            TradeManipulator.removeQuestionsFromAnswerRequests(trade, initiator, [question]);

            const res2 = new Map([
                [initiator.id, []]
            ]);

            assert.hasAllDeepKeys(res2, Array.from(trade._answerRequests.keys()));
            assert.sameDeepMembers(Array.from(res2), Array.from(trade._answerRequests));

        });
        it("One Question When Multiple Are Present", () => {
            const question = new Information<T>(
                "test",
                new PredicateT({time: 123})
            );
            const question2 = new Information<T>(
                "test",
                new PredicateT({time: 123})
            );
            const question3 = new Information<T>(
                "test",
                new PredicateT({time: 123})
            );
            
            db.storeModels([trade, initiator, receiver, question, question2, question3]);

            TradeManipulator.addQuestionsToAnswerRequests(trade, initiator, [question, question2]);
            TradeManipulator.addQuestionsToAnswerRequests(trade, receiver, [question3]);
            
            const res = new Map([
                [initiator.id, [
                    {
                        data: question.id,
                        pass: false
                    },
                    {
                        data: question2.id,
                        pass: false
                    }
                ]],
                [receiver.id, [
                    {
                        data: question3.id,
                        pass: false
                    }
                ]]
            ]);

            assert.hasAllDeepKeys(res, Array.from(trade._answerRequests.keys()));
            assert.sameDeepMembers(Array.from(res), Array.from(trade._answerRequests));

            TradeManipulator.removeQuestionsFromAnswerRequests(trade, initiator, [question]);

            const res2 = new Map([
                [initiator.id, [
                    {
                        data: question2.id,
                        pass: false
                    }
                ]],
                [receiver.id, [
                    {
                        data: question3.id,
                        pass: false
                    }
                ]]
            ]);

            assert.hasAllDeepKeys(res2, Array.from(trade._answerRequests.keys()));
            assert.sameDeepMembers(Array.from(res2), Array.from(trade._answerRequests));
        });
        it("Multiple Questions", () => {
            const question = new Information<T>(
                "test",
                new PredicateT({time: 123})
            );
            const question2 = new Information<T>(
                "test",
                new PredicateT({time: 123})
            );
            const question3 = new Information<T>(
                "test",
                new PredicateT({time: 123})
            );
            
            db.storeModels([trade, initiator, receiver, question, question2, question3]);

            TradeManipulator.addQuestionsToAnswerRequests(trade, initiator, [question, question2]);
            TradeManipulator.addQuestionsToAnswerRequests(trade, receiver, [question3]);
            
            const res = new Map([
                [initiator.id, [
                    {
                        data: question.id,
                        pass: false
                    },
                    {
                        data: question2.id,
                        pass: false
                    }
                ]],
                [receiver.id, [
                    {
                        data: question3.id,
                        pass: false
                    }
                ]]
            ]);

            assert.hasAllDeepKeys(res, Array.from(trade._answerRequests.keys()));
            assert.sameDeepMembers(Array.from(res), Array.from(trade._answerRequests));

            TradeManipulator.removeQuestionsFromAnswerRequests(trade, initiator, [question, question2]);
            TradeManipulator.removeQuestionsFromAnswerRequests(trade, receiver, [question3]);

            const res2 = new Map([
                [initiator.id, []],
                [receiver.id, []]
            ]);

            assert.hasAllDeepKeys(res2, Array.from(trade._answerRequests.keys()));
            assert.sameDeepMembers(Array.from(res2), Array.from(trade._answerRequests));
        });
    });
    context("Pass On Requested Questions", () => {
        it("One Question", () => {
            const question = new Information<T>(
                "test",
                new PredicateT({time: 123})
            );
            const question2 = new Information<T>(
                "test",
                new PredicateT({time: 123})
            );
            const question3 = new Information<T>(
                "test",
                new PredicateT({time: 123})
            );
            
            db.storeModels([trade, initiator, receiver, question, question2, question3]);

            TradeManipulator.addQuestionsToAnswerRequests(trade, initiator, [question, question2]);
            TradeManipulator.addQuestionsToAnswerRequests(trade, receiver, [question3]);
            
            const res = new Map([
                [initiator.id, [
                    {
                        data: question.id,
                        pass: false
                    },
                    {
                        data: question2.id,
                        pass: false
                    }
                ]],
                [receiver.id, [
                    {
                        data: question3.id,
                        pass: false
                    }
                ]]
            ]);

            assert.hasAllDeepKeys(res, Array.from(trade._answerRequests.keys()));
            assert.sameDeepMembers(Array.from(res), Array.from(trade._answerRequests));

            TradeManipulator.passOnRequestedQuestions(trade, initiator, [question]);

            const res2 = new Map([
                [initiator.id, [
                    {
                        data: question.id,
                        pass: true
                    },
                    {
                        data: question2.id,
                        pass: false
                    }
                ]],
                [receiver.id, [
                    {
                        data: question3.id,
                        pass: false
                    }
                ]]
            ]);

            assert.hasAllDeepKeys(res2, Array.from(trade._answerRequests.keys()));
            assert.sameDeepMembers(Array.from(res2), Array.from(trade._answerRequests));
        });
        it("Multiple Questions", () => {
            const question = new Information<T>(
                "test",
                new PredicateT({time: 123})
            );
            const question2 = new Information<T>(
                "test",
                new PredicateT({time: 123})
            );
            const question3 = new Information<T>(
                "test",
                new PredicateT({time: 123})
            );
            
            db.storeModels([trade, initiator, receiver, question, question2, question3]);

            TradeManipulator.addQuestionsToAnswerRequests(trade, initiator, [question, question2]);
            TradeManipulator.addQuestionsToAnswerRequests(trade, receiver, [question3]);
            
            const res = new Map([
                [initiator.id, [
                    {
                        data: question.id,
                        pass: false
                    },
                    {
                        data: question2.id,
                        pass: false
                    }
                ]],
                [receiver.id, [
                    {
                        data: question3.id,
                        pass: false
                    }
                ]]
            ]);

            assert.hasAllDeepKeys(res, Array.from(trade._answerRequests.keys()));
            assert.sameDeepMembers(Array.from(res), Array.from(trade._answerRequests));

            TradeManipulator.passOnRequestedQuestions(trade, initiator, [question, question2]);
            TradeManipulator.passOnRequestedQuestions(trade, receiver, [question3]);

            const res2 = new Map([
                [initiator.id, [
                    {
                        data: question.id,
                        pass: true
                    },
                    {
                        data: question2.id,
                        pass: true
                    }
                ]],
                [receiver.id, [
                    {
                        data: question3.id,
                        pass: true
                    }
                ]]
            ]);

            assert.hasAllDeepKeys(res2, Array.from(trade._answerRequests.keys()));
            assert.sameDeepMembers(Array.from(res2), Array.from(trade._answerRequests));
        });
    });
    context("Update Gold In Gold Request", () => {
        it("Add Gold", () => {
            db.storeModels([trade, initiator]);

            TradeManipulator.updateGoldInGoldRequest(trade, initiator, 10);

            const res = new Map([
                [initiator.id, {data: 10, pass: false}]
            ]);

            assert.hasAllDeepKeys(res, Array.from(trade._goldRequest.keys()));
            assert.sameDeepMembers(Array.from(res), Array.from(trade._goldRequest));
        });
        it("Remove Gold", () => {
            db.storeModels([trade, initiator]);

            TradeManipulator.updateGoldInGoldRequest(trade, initiator, 10);

            const res = new Map([
                [initiator.id, {data: 10, pass: false}]
            ]);

            assert.hasAllDeepKeys(res, Array.from(trade._goldRequest.keys()));
            assert.sameDeepMembers(Array.from(res), Array.from(trade._goldRequest));

            TradeManipulator.updateGoldInGoldRequest(trade, initiator, -7);

            const res2 = new Map([
                [initiator.id, {data: 3, pass: false}]
            ]);

            assert.hasAllDeepKeys(res2, Array.from(trade._goldRequest.keys()));
            assert.sameDeepMembers(Array.from(res2), Array.from(trade._goldRequest));
        });
    });
    context("Pass On Requested Gold", () => {
        it("", () => {
            () => {
                db.storeModels([trade, initiator]);

                TradeManipulator.updateGoldInGoldRequest(trade, initiator, 10);

                const res = new Map([
                    [initiator.id, {data: 10, pass: false}]
                ]);

                assert.hasAllDeepKeys(res, Array.from(trade._goldRequest.keys()));
                assert.sameDeepMembers(Array.from(res), Array.from(trade._goldRequest));

                TradeManipulator.passOnRequestedGold(trade, initiator);

                const res2 = new Map([
                    [initiator.id, {data: 10, pass: true}]
                ]);

                assert.hasAllDeepKeys(res2, Array.from(trade._goldRequest.keys()));
                assert.sameDeepMembers(Array.from(res2), Array.from(trade._goldRequest));
            }
        });
    });
});