import { Agent, Util, Trade } from "@panoptyk/core";
import { Action } from "./action"
import * as Validate from "../validate";
import { ConversationController } from "..";

export const ActionAcceptTradeRequest: Action = {
    name: "accept-trade-request",
    formats: [
        {
            tradeID: "number"
        },
    ],
    enact: (agent: Agent, inputData: any) => {
        const cc: ConversationController = new ConversationController();
        const trade = Util.AppContext.db.retrieveModel(inputData.tradeID, Trade);

        cc.acceptTrade(trade);

        Util.logger.log(
            `Event accept-trade-request:
                Agent ${trade.receiver} accepted trade quest (${trade}) 
                from agent ${trade.initiator}`,
            "ACTION"
        );

        cc.sendUpdates();
    },
    validate: (agent: Agent, socket: any, inputData: any) => {
        let res;
        const trade = Util.AppContext.db.retrieveModel(inputData.tradeID, Trade);
        const initiator = trade.initiator;
        const receiver = trade.receiver;
        const itemsFromInitiator = trade.itemsFromInitiator;
        const itemsFromReceiver = trade.itemsFromReceiver;

        if (!(res = Validate.loggedIn(agent)).success) {
            return res;
        }

        if (!(res = Validate.shareConversation([initiator, receiver])).success) {
            return res;
        }

        if (itemsFromInitiator?.length && !(res = Validate.ownsItems(agent, itemsFromInitiator)).success) {
            return res;
        }

        if (itemsFromReceiver?.length && !(res = Validate.ownsItems(receiver, itemsFromReceiver)).success) {
            return res;
        }

        return Validate.ValidationSuccess;
    }
}
