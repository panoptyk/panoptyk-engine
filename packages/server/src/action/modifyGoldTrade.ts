import { Agent, Util } from "@panoptyk/core";
import { Action } from "./action";
import * as Validate from "../validate";
import { TradeController } from "..";

export const ActionModifyGoldTrade: Action = {
    name: "modify-gold-trade",
    formats: [
        {
            "amount": "number"
        }
    ],
    enact: (agent: Agent, inputData: any) => {
        const tc: TradeController = new TradeController();
        const amount = inputData.amount;

        tc.modifyGoldOffered(agent, agent.trade, amount);

        Util.logger.log(
            `Event modify-gold-trade Agent ${agent} \
            modified gold with amount ${amount}`,
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

        return Validate.ValidationSuccess;
    }
}
