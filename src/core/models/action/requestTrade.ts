import { Action } from "./action";
import { logger } from "../../utilities/logger";
import { Validate } from "../validate";
import { Controller } from "../../controllers/controller";
import { Agent, Trade, Conversation } from "../index";

export const ActionRequestTrade: Action = {
  name: "request-trade",
  formats: [
    {
      agentID: "number",
      conversationID: "number"
    }
  ],
  enact: (agent: Agent, inputData: any) => {
    const controller = new Controller();
    const conversation = Conversation.getByID(inputData.conversationID);
    const toAgent = Agent.getByID(inputData.agentID);

    const trade = controller.createTrade(conversation, agent, toAgent);

    logger.log("Event request-trade (" + conversation.conversation_id + ") for agent " + agent.agentName + " registered.", 2);
    controller.sendUpdates();
  },
  validate: (agent: Agent, socket: any, inputData: any) => {
    let res;
    const toAgent = Agent.getByID(inputData.agent_id);
    if (!(res = Validate.validate_agent_logged_in(toAgent)).status) {
      return res;
    }
    if (!(res = Validate.validate_agents_share_conversation(agent, toAgent)).status) {
      return res;
    }
    return Validate.successMsg;
  }
};
