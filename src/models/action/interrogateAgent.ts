import { Action } from "./action";
import { logger } from "../../utilities/logger";
import { Validate } from "../validate";
import { Controller } from "../../controllers/controller";
import { Agent } from "../agent";

export const ActionInterrogateAgent: Action = {
  name: "interrogate-agent",
  requiredFactionType: new Set(["police"]),
  formats: [
    {
      agentID: "number"
    }
  ],
  enact: (agent: Agent, inputData: any) => {
    const controller = new Controller();
    const toAgent: Agent = Agent.getByID(inputData.agentID);

    controller.removeAgentFromConversationIfIn(toAgent);
    const interrogation = controller.createConversation(
        agent.room,
        agent,
        toAgent,
        "interrogation"
    );
    logger.log(
        "Event interrogate-agent (" +
        interrogation +
        ") for agent " +
        agent +
        "/" +
        toAgent +
        " registered.",
        2
    );
    controller.sendUpdates();
  },
  validate: (agent: Agent, socket: any, inputData: any) => {
    let res;
    if (!(res = Validate.validate_agent_logged_in(agent)).status) {
      return res;
    }
    const toAgent = Agent.getByID(inputData.agentID);
    if (!(res = Validate.validate_not_same_agent(agent, toAgent)).status) {
      return res;
    }
    if (!(res = Validate.validate_agent_logged_in(toAgent)).status) {
      return res;
    }
    if (!(res = Validate.validate_agents_in_same_room(agent, toAgent)).status) {
      return res;
    }
    if (!(res = Validate.validate_agents_not_conversing([agent])).status) {
      return res;
    }
    return Validate.successMsg;
  }
};
