import { Action } from "./action";
import { logger } from "../../utilities/logger";
import { Validate } from "../validate";
import { Controller } from "../../controllers/controller";
import { Agent, Trade } from "../index";

export const ActionGiveGold: Action = {
  name: "give-gold",
  formats: [
    {
      "agentID": "number",
      "amount": "number"
    }
  ],
  enact: (agent: Agent, inputData: any) => {
    const controller = new Controller();
    const toAgent = Agent.getByID(inputData.agentID);

    controller.giveGold(agent, toAgent, inputData.amount);

    logger.log("Event give-gold from " + agent + " to " + toAgent + " registered.", 2);
    controller.sendUpdates();
  },
  validate: (agent: Agent, socket: any, inputData: any) => {
    let res;
    if (!(res = Validate.validate_agent_logged_in(agent)).status) {
      return res;
    }
    const toAgent = Agent.getByID(inputData.agentID);
    if (!(res = Validate.validate_agent_logged_in(toAgent)).status) {
      return res;
    }
    if (!(res = Validate.validate_not_same_agent(agent, toAgent)).status) {
      return res;
    }
    if (!(res = Validate.validate_agents_share_conversation(agent, toAgent)).status) {
      return res;
    }
    if (!(res = Validate.validate_agent_has_enough_gold(agent, inputData.amount)).status) {
        return res;
    }
    return Validate.successMsg;
  }
};
