import { Agent, Trade, Util } from "@panoptyk/core";
import { Action } from "./action";
import * as Validate from "../validate";
import { TradeController } from "..";

export const ActionCancelTrade: Action = {
    name: "cancel-trade",
    formats: [
        {
            tradeID: "number"
        }
    ],
    enact: (agent: Agent, inputData: any) => {
        const tc: TradeController = new TradeController();
        const trade = Util.AppContext.db.retrieveModel(
            inputData.tradeID,
            Trade
        );

        tc.cancelTrade(trade);

        Util.logger.log(
            `Event cancel-trade Agent (${agent}) canceled trade ${trade}`,
            "ACTION"
        );

        tc.sendUpdates();
    },
    validate: (agent: Agent, socket: any, inputData: any) => {
        let res;
        const trade = Util.AppContext.db.retrieveModel(
            inputData.tradeID,
            Trade
        );

        if (!(res = Validate.loggedIn(agent)).success) {
            return res;
        }

        if (!(res = Validate.validTrade(trade, agent)).success) {
            return res;
        }

        if (!(res = Validate.agentInTrade(agent)).success) {
            return res;
        }

        return Validate.ValidationSuccess;
    }
}
