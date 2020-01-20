import { Action } from "./action";
import { logger } from "../../utilities/logger";
import { Validate } from "../validate";
import { Controller } from "../../controllers/controller";
import { Agent, Trade, Conversation, Info } from "../index";

export const ActionTellInfo: Action = {
  name: "tell-info",
  formats: [
    {
      infoID: "number",
      mask: "object"
    }
  ],
  enact: (agent: Agent, inputData: any) => {
    const controller = new Controller();
    const info: Info = Info.getByID(inputData.infoID);
    const mask: string[] = inputData.mask;

    controller.tellInfoFreely(agent, info, mask);
    logger.log("Event tell-info " + info, 2);
    controller.sendUpdates();
  },
  validate: (agent: Agent, socket: any, inputData: any) => {
    let res;
    if (!(res = Validate.validate_agent_logged_in(agent)).status) {
      return res;
    }
    const conversation = agent.conversation;
    if (!(res = Validate.validate_conversation_exists(agent.room, conversation)).status) {
        return res;
    }
    if (!(res = Validate.validate_conversation_has_agent(conversation, agent)).status) {
        return res;
    }
    const info: Info = Info.getByID(inputData.infoID);
    if (!(res = Validate.validate_agent_owns_info(agent, info)).status) {
        return res;
    }
    const mask: string[] = inputData.mask;
    if (!(res = Validate.validate_info_mask(info, mask)).status) {
      return res;
    }
    return Validate.successMsg;
  }
};
