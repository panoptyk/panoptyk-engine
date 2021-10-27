import { Util, Agent, Item } from "@panoptyk/core";
import { Action } from "./action";
import * as Validate from "../validate";
import { InventoryController } from "../controllers";

export const ActionDropItems: Action = {
    name: "drop-items",
    formats: [
        {
            itemIDs: "object",
        },
    ],
    enact: (agent: Agent, inputData: any) => {
        const ic: InventoryController = new InventoryController();
        const items: Item[] = Util.AppContext.db.retrieveModels(
            inputData.itemID,
            Item
        ) as Item[];

        ic.dropItems(agent, items, agent.room);

        const itemNames = [];
        for (const item of items) {
            itemNames.push(item.itemName);
        }
        Util.logger.log(
            "Event drop-items (" +
                JSON.stringify(inputData.itemIDs) +
                ") for agent " +
                agent.agentName +
                " registered.",
            "ACTION"
        );

        ic.sendUpdates();
    },
    validate: (agent: Agent, socket: any, inputData: any) => {
        let res;
        if (!(res = Validate.loggedIn(agent)).success) {
            return res;
        }
        if (!(res = Validate.arrayTypes(inputData.itemIDs, "number")).success) {
            return res;
        }
        const items: Item[] = Util.AppContext.db.retrieveModels(
            inputData.itemID,
            Item
        ) as Item[];
        if (!(res = Validate.ownsItems(agent, items)).success) {
            return res;
        }
        if (!(res = Validate.notInTransaction(items)).success) {
            return res;
        }
        return Validate.ValidationSuccess;
    },
};
