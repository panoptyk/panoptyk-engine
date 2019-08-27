import { Action } from "./action";
import { logger } from "../../utilities/logger";
import { Validate } from "../validate";
import { Controller } from "../../controllers/controller";
import { Agent } from "../agent";

export const ActionAcceptConversation: Action = {
  name: "accept-conversation",
  formats: [
    {
      agentID: "number"
    }
  ],
  enact: (agent: Agent, inputData: any) => {
    const controller = new Controller();
    const room = agent.room; // TODO: change this when room validation is added
    const toAgent = Agent.getByID(inputData.agentID);
    const conversation = controller.createConversation(
      room,
      agent,
      toAgent
    );

    logger.log(
      "Event accept-conversation (" +
        conversation.id +
        ") for agent " +
        agent.agentName +
        "/" +
        toAgent.agentName +
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
    if (!(res = Validate.validate_agent_logged_in(agent)).status) {
      return res;
    }
    return Validate.successMsg;
  }
};
