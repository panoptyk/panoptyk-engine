import { Action } from "./action";
import { Agent, Trade } from "../index";
import { Validate } from "../validate";
import { Controller } from "../../controllers/controller";

export const ActionReadyTrade: Action = {
  name: "ready-trade",
  formats: [
    {
      tradeID: "number"
    }
  ],
  enact: (agent: Agent, inputData: any) => {
    const controller = new Controller();
    // TODO: fix event functionality IS THIS A COPY OF readyTrade.ts ???
    const trade: Trade = Trade.getByID(inputData.tradeID);
    controller.setTradeAgentStatus(trade, agent, true);
    controller.sendUpdates();
  },
  validate: (agent: Agent, socket: any, inputData: any) => {
    return Validate.successMsg;
  }
};
