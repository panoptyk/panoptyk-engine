import { Action } from "./action";
import { logger } from "../../utilities/logger";
import { Validate } from "../validate";
import { Controller } from "../../controllers/controller";
import { Agent, Trade } from "../index";

export const ActionDropGold: Action = {
  name: "drop-gold",
  formats: [
    {
      "amount": "number"
    }
  ],
  enact: (agent: Agent, inputData: any) => {
    const controller = new Controller();

    controller.dropGold(agent, inputData.amount);

    logger.log("Event drop-gold from " + agent + " registered.", 2);
    controller.sendUpdates();
  },
  validate: (agent: Agent, socket: any, inputData: any) => {
    let res;
    if (!(res = Validate.validate_agent_logged_in(agent)).status) {
      return res;
    }
    if (!(res = Validate.validate_agent_has_enough_gold(agent, inputData.amount)).status) {
        return res;
    }
    if (!(res = Validate.validate_amount_greater_than("gold", inputData.amount, 0)).status) {
        return res;
    }
    return Validate.successMsg;
  }
};
