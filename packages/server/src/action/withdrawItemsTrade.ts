import { Agent, Util, Item, Trade } from "@panoptyk/core";
import { Action } from "./action";
import * as Validate from "../validate";
import { TradeController } from "..";

export const ActionWithdrawItemsTrade: Action = {
    name: "withdraw-items-trade",
    formats: [
        {
            "itemIDs": "object"
        }
    ],
    enact: (agent: Agent, inputData: any) => {
        const tc: TradeController = new TradeController();
        const items = Util.AppContext.db.retrieveModels(
            inputData.itemIDs, 
            Item
        );

        tc.removeItems(agent, agent.trade, items);
        
        Util.logger.log(
            `Event withdraw-items-trade agent ${agent} withdraw \
            items (${items}) from trade`,
            "ACTION"
        );

        tc.sendUpdates();
    },
    validate: (agent: Agent, socket: any, inputData: any) => {
        let res;
        const items = Util.AppContext.db.retrieveModels(
            inputData.itemIDs, 
            Item
        );

        if (!(res = Validate.loggedIn(agent)).success) {
            return res;
        }
        if (!(res = Validate.agentInTrade(agent)).success) {
            return res;
        }
        if (!(res = Validate.ownsItems(agent, items)).success) {
            return res;
        }

        return Validate.ValidationSuccess;
    }
}
