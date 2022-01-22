import { Agent, Util } from "@panoptyk/core";
import { Action } from "./action";
import * as Validate from "../validate";
import { TradeController } from "..";

export const ActionRequestTrade: Action = {
    name: "request-trade",
    formats: [
        {
            agentID: "number"
        },
    ],
    enact: (agent: Agent, inputData: any) => {
        const tc: TradeController = new TradeController();
        const agentB = Util.AppContext.db.retrieveModel(inputData.agentID, Agent);

        const trade = tc.createTrade(agent, agentB, agent.conversation);

        Util.logger.log(
            `Event request-trade agent (${agent}) requested trade (${trade})
            with agent (${agentB})`,
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
        if (!(res = Validate.loggedIn(agentB)).success) {
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
        if (!(res = Validate.agentsNotInTrade(agent, agentB)).success) {
            return res;
        }

        return Validate.ValidationSuccess;
    }
}
