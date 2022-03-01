import { Agent, Util } from "@panoptyk/core";
import { Action } from "./action";
import * as Validate from "../validate";
import { TradeController } from "..";

export const ActionRequestGoldTrade: Action = {
    name: "request-gold-trade",
    formats: [
        {
            amount: "number",
            agentID: "number",
        }
    ],
    enact: (requester: Agent, inputData: any) => {
        const tc: TradeController = new TradeController();
        const requestee = Util.AppContext.db.retrieveModel(
            inputData.agentID,
            Agent
        );
        const amount = inputData.amount;
        
        tc.addGoldRequest(requestee, requester.trade, amount);

        Util.logger.log(
            `Event request-gold-trade agent ${requester} requested` +
            `${amount} gold from ${requestee} in trade`,
            "ACTION"
        );

        tc.sendUpdates();
    },
    validate: (agent: Agent, socket: any, inputData: any) => {
        let res;
        const requestee = Util.AppContext.db.retrieveModel(
            inputData.agentID,
            Agent
        );
        const amount = inputData.amount;

        if (!(res = Validate.loggedIn(agent)).success) {
            return res;
        }
        if (!(res = Validate.agentInTrade(agent)).success) {
            return res;
        }
        if (!(res = Validate.validTrade(agent.trade, agent)).success) {
            return res;
        }
        if (!(res = Validate.agentsShareTrade(agent, requestee)).success) {
            return res;
        }
        if (!(res = Validate.hasEnoughGold(requestee, amount)).success) {
            return res;
        }

        return Validate.ValidationSuccess;
    }
}
