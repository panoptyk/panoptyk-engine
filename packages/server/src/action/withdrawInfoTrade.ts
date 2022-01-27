import { Agent, Util, Information } from "@panoptyk/core";
import { Action } from "./action";
import * as Validate from "../validate";
import { TradeController } from "..";

export const ActionWithdrawInfoTrade: Action = {
    name: "withdraw-info-trade",
    formats: [
        {
            "infoID": "number"
        }
    ],
    enact: (agent: Agent, inputData: any) => {
        const info = Util.AppContext.db.retrieveModel(
            inputData.infoID,
            Information
        );
        const tc: TradeController = new TradeController();

        tc.removeInfo(agent, agent.trade, info);

        Util.logger.log(
            `Event withdraw-info-trade agent (${agent}) withdraw \
            info (${info}) in trade`,
            "ACTION"
        );

        tc.sendUpdates();
    },
    validate: (agent: Agent, socket: any, inputData: any) => {
        let res;
        const info = Util.AppContext.db.retrieveModel(
            inputData.infoID,
            Information
        );
    
        if (!(res = Validate.loggedIn(agent)).success) {
            return res;
        }
        if (!(res = Validate.agentInTrade(agent)).success) {
            return res;
        }
        if (!(res = Validate.validTrade(agent.trade, agent)).success) {
            return res;
        }
        if (!(res = Validate.ownsInfos(agent, [info])).success) {
            return res;
        }

        return Validate.ValidationSuccess;
    }
}
