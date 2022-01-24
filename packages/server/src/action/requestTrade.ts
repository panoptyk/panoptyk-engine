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
    enact: (initiator: Agent, inputData: any) => {
        const tc: TradeController = new TradeController();
        const receiver = Util.AppContext.db.retrieveModel(inputData.agentID, Agent);

       
        if (initiator.tradeRequesters.indexOf(receiver) === -1) {
            tc.requestTrade(initiator, receiver);
            Util.logger.log(
                `Event request-trade agent (${initiator}) requested trade \ 
                with agent ${receiver}`,
                "ACTION"
            );
        }
        else {
            const trade = tc.createTrade(initiator, receiver, initiator.conversation);
        
            Util.logger.log(
                `Event accept-trade agent (${initiator}) accepted trade ${trade} \
                with agent (${receiver})`,
                "ACTION"
            );
        }
        
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
