import { Agent, Util } from "@panoptyk/core";
import { Action } from "./action";
import * as Validate from "../validate";
import { TradeController } from "..";

export const ActionPassGoldRequest: Action = {
    name: "pass-gold-request",
    formats: [
        {}
    ],
    enact: (agent: Agent, inputData: any) => {
        const tc: TradeController = new TradeController();
        
        tc.passOnGoldRequest(agent, agent.trade);

        Util.logger.log(
            `Event pass-gold-request ${agent} agreed to offer` +
            `requested gold in trade`,
            "ACTION"
        );

        tc.sendUpdates();
    },
    validate: (agent: Agent, socket: any, inputData: any) => {
        let res;

        if (!(res = Validate.loggedIn(agent)).success) {
            return res;
        }
        if (!(res = Validate.agentInTrade(agent)).success) {
            return res;
        }
        if (!(res = Validate.validTrade(agent.trade, agent)).success) {
            return res;
        }

        return Validate.ValidationSuccess;
    }
}
