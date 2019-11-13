import { Action } from "./action";
import { logger } from "../../utilities/logger";
import { Validate } from "../validate";
import { Controller } from "../../controllers/controller";
import { Agent, Trade, Conversation, Info } from "../index";

export const ActionGiveQuest: Action = {
  name: "give-quest",
  formats: [
    {
      agentID: "number",
      infoID: "number"
    }
  ],
  enact: (agent: Agent, inputData: any) => {
    const controller = new Controller();
    const task = Info.getByID(inputData.infoID);
    const toAgent = Agent.getByID(inputData.agentID);
    controller.sendQuest(agent, toAgent, task);
    controller.sendUpdates();
  },
  validate: (agent: Agent, socket: any, inputData: any) => {
    let res;
    const conversation = agent.conversation;
    if (!(res = Validate.validate_agent_logged_in(agent)).status) {
        return res;
    }
    if (!(res = Validate.validate_conversation_exists(agent.room, conversation)).status) {
        return res;
    }
    if (!(res = Validate.validate_conversation_has_agent(conversation, agent)).status) {
        return res;
    }
    if (!(res = Validate.validate_required_rank(agent, 0)).status) {
        return res;
    }
    const info: Info = Info.getByID(inputData.infoID);
    if (!(res = Validate.validate_valid_quest(info)).status) {
      return res;
    }
    return Validate.successMsg;
  }
};
