import { Util, Agent, Item, Recipe } from "@panoptyk/core";
import { Action } from "./action";
import * as Validate from "../validate";
import { InventoryController } from "../controllers";

export const ActionCraft: Action = {
    name: "craft",
    formats: [
        {
            recipeID: "number",
        },
    ],
    enact: (agent: Agent, inputData: any) => {
        const ic: InventoryController = new InventoryController();
        ic.craft(
            agent,
            Util.AppContext.db.retrieveModel(
                inputData.recipeID,
                Recipe
            ) as Recipe
        );

        ic.sendUpdates();
    },
    validate: (agent: Agent, socket: any, inputData: any) => {
        let res;
        if (!(res = Validate.loggedIn(agent)).success) {
            return res;
        }
        if (
            !(res = Validate.arrayTypes(inputData.recipeID, "number")).success
        ) {
            return res;
        }
        const recipe: Recipe = Util.AppContext.db.retrieveModel(
            inputData.recipeID,
            Recipe
        ) as Recipe;
        if (!(res = Validate.hasResources(agent, recipe)).success) {
            return res;
        }
        return Validate.ValidationSuccess;
    },
};
