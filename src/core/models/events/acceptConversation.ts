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
    // TODO: fix event functionality
    // this.room = this.fromAgent.room; // TODO: change this when room validation is added
    // this.conversation = Controller.createConversation(
    //   this.room,
    //   this.fromAgent,
    //   this.toAgent
    // );

    logger.log(
      "Event accept-conversation (" +
        this.conversation.conversation_id +
        ") for agent " +
        this.fromAgent.agentName +
        "/" +
        this.toAgent.agentName +
        " registered.",
      2
    );
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
