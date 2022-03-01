import { Agent, Util, Item } from "@panoptyk/core";
import { Action } from "./action";
import * as Validate from "../validate";
import { TradeController } from "..";

export const ActionOfferItemsTrade: Action = {
    name: "offer-items-trade",
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

        tc.offerItems(agent, agent.trade, items);
        
        Util.logger.log(
            `Event offer-items-trade agent ${agent} offered` +
            `items (${items}) in trade`,
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
        if (!(res = Validate.validTrade(agent.trade, agent)).success) {
            return res;
        }
        if (!(res = Validate.ownsItems(agent, items)).success) {
            return res;
        }
        if (!(res = Validate.notInTransaction(items)).success) {
            return res;
        }

        return Validate.ValidationSuccess;
    }
}
