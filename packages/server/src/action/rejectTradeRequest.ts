import { Agent, Util } from "@panoptyk/core";
import { Action } from "./action";
import { TradeController } from "..";
import * as Validate from "../validate";

export const ActionRejectTradeRequest: Action = {
    name: "reject-trade-request",
    formats: [
        {
            agentID: "number"
        }
    ],
    enact: (receiver: Agent, inputData: any) => {
        const tc: TradeController = new TradeController();
        const requester = Util.AppContext.db.retrieveModel(inputData.agentID, Agent);

        tc.rejectTrade(requester, receiver);

        Util.logger.log(
            `Event reject-trade-request agent ${receiver} rejected \
            trade request with agent ${requester}`,
            "ACTION"
        );

        tc.sendUpdates();
    },
    validate: (agent: Agent, socket: any, inputData: any) => {
        let res;
        const agentB = Util.AppContext.db.retrieveModel(inputData.agentID, Agent);
        const conversation = agent.conversation;

        if (!(res = Validate.loggedIn(agent)).success) {
            return res;
        }
        if (!(res = Validate.conversationInAgentsRoom(conversation, agent.room)).success) {
            return res;
        }
        if (!(res = Validate.differentAgents(agent, agentB)).success) {
            return res;
        }
        if (!(res = Validate.shareConversation([agent, agentB])).success) {
            return res;
        }

        return Validate.ValidationSuccess;
    }
}
