import { Action } from "./action";
import { logger } from "../../utilities/logger";
import { Validate } from "../validate";
import { Controller } from "../../controllers/controller";
import { Agent, Info } from "../index";

export const ActionThankAgent: Action = {
  name: "thank-agent",
  formats: [
    {
      agentID: "number",
      reasonID: "number"
    }
  ],
  enact: (agent: Agent, inputData: any) => {
    const controller = new Controller();
    const targetAgent: Agent = Agent.getByID(inputData.agentID);
    const reason: Info = Info.getByID(inputData.reasonID);

    controller.thankAgent(agent, targetAgent, reason);

    logger.log("Event thank-agent by agent "
      + agent + " targeting " + targetAgent + " registered.", 2);

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
    // TODO: validate reason info
    return Validate.successMsg;
  }
};
