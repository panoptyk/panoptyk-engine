import { Agent, Util, Trade } from "@panoptyk/core"
import { Action } from "./action"
import * as Validate from "../validate";
import { ConversationController } from "../controllers";

export const ActionRejectTradeRequest: Action = {
    name: "reject-trade-request",
    formats: [
        {
            tradeID: "number"
        }
    ],
    enact: (agent: Agent, inputData: any) => {
        const cc: ConversationController = new ConversationController();
        const trade = Util.AppContext.db.retrieveModel(inputData.tradeID, Trade);

        cc.rejectTrade(trade);

        Util.logger.log(
            `Event reject-trade-request:
                Agent ${trade.receiver} rejected trade quest (${trade}) 
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

        if (!(res = Validate.loggedIn(agent)).success) {
            return res;
        }

        if (!(res = Validate.shareConversation([initiator, receiver])).success) {
            return res;
        }

        return Validate.ValidationSuccess;
    }
}
