import { Agent, Util, Item, Trade } from "@panoptyk/core";
import { Action } from "./action";
import * as Validate from "../validate";
import { TradeController } from "..";

export const ActionReadyTrade: Action = {
    name: "ready-trade",
    formats: [
        {
            readyStatus: "boolean"
        }
    ],
    enact: (agent: Agent, inputData: any) => {
        const tc: TradeController = new TradeController();
        const status = inputData.readyStatus;

        tc.setAgentReady(agent, status, agent.trade);

        Util.logger.log(
            `Event ready-trade agent (${agent}) set \
            ready status to (${status})`,
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
        if (!(res = Validate.validTrade(agent.trade)).success) {
            return res;
        }

        return Validate.ValidationSuccess
    }
}
