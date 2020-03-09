import { Action } from "./action";
import { logger } from "../../utilities/logger";
import { Validate } from "../validate";
import { Controller } from "../../controllers/controller";
import { Agent, Info } from "../index";

export const ActionArrestAgent: Action = {
  name: "arrest-agent",
  requiredFactionType: new Set(["police"]),
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

    controller.arrestAgent(agent, targetAgent, reason);

    logger.log("Event arrest-agent by agent "
      + agent + " targeting " + targetAgent + " registered.", 2);

    controller.sendUpdates();
  },
  validate: (agent: Agent, socket: any, inputData: any) => {
    let res;
    if (!(res = Validate.validate_agent_logged_in(agent)).status) {
        return res;
    }
    const targetAgent: Agent = Agent.getByID(inputData.agentID);
    if (!(res = Validate.validate_agents_in_same_room(agent, targetAgent)).status) {
        return res;
    }
    // TODO: validate reason info
    return Validate.successMsg;
  }
};
