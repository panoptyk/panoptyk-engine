import { Agent, Util } from "@panoptyk/core";
import { Action } from "./action";
import * as Validate from "../validate";
import { TradeController } from "..";

export const ActionRequestItemTrade: Action = {
    name: "request-item-trade",
    formats: [
        {
            itemNames: "object",
            agentID: "number"
        }
    ],
    enact: (requester: Agent, inputData: any) => {
        const tc: TradeController = new TradeController();
        const requestee = Util.AppContext.db.retrieveModel(
            inputData.agentID,
            Agent
        );
        const items = requestee.inventory
            .filter(item => inputData.itemNames.includes(item.itemName));

        tc.addItemRequests(requestee, requester.trade, items);

        Util.logger.log(
            `Event request-item-trade agent ${requester} requested` +
            `items ${items} from ${requestee} in trade`,
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
        const items = requestee.inventory
            .filter(item => inputData.itemNames.includes(item.itemName));

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
        if (!(res = Validate.ownsItems(requestee, items)).success) {
            return res;
        }
        if (!(res = Validate.notInTransaction(items)).success) {
            return res;
        }

        return Validate.ValidationSuccess;
    }
}
