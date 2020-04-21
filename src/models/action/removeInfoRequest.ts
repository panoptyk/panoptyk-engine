import { Action } from "./action";
import { logger } from "../../utilities/logger";
import { Validate } from "../validate";
import { Controller } from "../../controllers/controller";
import { Agent, Trade } from "../index";
import { Info } from "../information";

export const ActionRemoveInfoRequest: Action = {
  name: "remove-info-request",
  formats: [
    {
        questionID: "number"
    }
  ],
  enact: (agent: Agent, inputData: any) => {
    const controller = new Controller();
    const question: Info = Info.getByID(inputData.questionID);
    const trade: Trade = agent.trade;

    controller.removeAnswerRequest(agent, trade, question);

    logger.log("Event remove-info-request from " + agent + " on " + trade + " registered.", 2);
    controller.sendUpdates();
  },
  validate: (agent: Agent, socket: any, inputData: any) => {
    let res;
    if (!(res = Validate.validate_agent_logged_in(agent)).status) {
      return res;
    }
    const trade: Trade = agent.trade;
    if (!(res = Validate.validate_trade_status(trade, [2])).status) {
      return res;
    }
    return Validate.successMsg;
  }
};