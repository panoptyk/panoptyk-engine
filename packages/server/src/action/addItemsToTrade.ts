import { Agent, Util, Trade, Item } from "@panoptyk/core";
import { Action } from "./action"
import * as Validate from "../validate";
import { TradeController } from "../controllers/tradeController";

export const ActionAddItemsToTrade: Action = {
    name: "add-items-to-trade",
    formats: [
        {
            agentID: "number",
            tradeID: "number",
            items: "object"
        },
    ],
    enact: (agent: Agent, inputData: any) => {
        const tc: TradeController = new TradeController();
        const targetAgent = Util.AppContext.db.retrieveModel(inputData.agentID, Agent);
        const trade = Util.AppContext.db.retrieveModel(inputData.tradeID, Trade);
        const items: Item[] = inputData.items;

        tc.addItems(targetAgent, trade, items);

        Util.logger.log(
            `Event add-items-to-trade:
                Agent ${targetAgent} added items ${items} to trade ${trade}`,
            "ACTION"
        );

        tc.sendUpdates();
    },
    validate: (agent: Agent, socket: any, inputData: any) => {
        let res;
        const targetAgent = Util.AppContext.db.retrieveModel(inputData.agentID, Agent);
        const trade = Util.AppContext.db.retrieveModel(inputData.tradeID, Trade);
        const items: Item[] = inputData.items;

        if (!(res = Validate.loggedIn(agent)).success) {
            return res;
        }

        if (items?.length && !(res = Validate.ownsItems(targetAgent, items)).success) {
            return res;
        }

        return Validate.ValidationSuccess;
    }
}
