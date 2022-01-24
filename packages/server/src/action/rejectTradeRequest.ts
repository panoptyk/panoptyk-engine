import { Agent, Util } from "@panoptyk/core";
import { Action } from "./action";
import { TradeController } from "..";
import * as Validate from "../validate";

export const ActionRejectTradeRequest: Action = {
    name: "reject-trade-request",
    formats: [
        {
            agentID: "number"
        }
    ],
    enact: (receiver: Agent, inputData: any) => {
        const tc: TradeController = new TradeController();
        const requester = Util.AppContext.db.retrieveModel(inputData.agentID, Agent);

        tc.rejectTrade(requester, receiver);

        Util.logger.log(
            `Event reject-trade-request agent ${receiver} rejected \
            trade request with agent ${requester}`,
            "ACTION"
        );

        tc.sendUpdates();
    },
    validate: (agent: Agent, socket: any, inputData: any) => {
        let res;
        const agentB = Util.AppContext.db.retrieveModel(inputData.agentID, Agent);
        const conversation = agent.conversation;

        if (!(res = Validate.loggedIn(agent)).success) {
            return res;
        }
        if (!(res = Validate.conversationInAgentsRoom(conversation, agent.room)).success) {
            return res;
        }
        if (!(res = Validate.differentAgents(agent, agentB)).success) {
            return res;
        }
        if (!(res = Validate.shareConversation([agent, agentB])).success) {
            return res;
        }

        return Validate.ValidationSuccess;
    }
}


// import { Action } from "./action";
// import { logger } from "../utilities/logger";
// import { Validate } from "./validate";
// import { Controller } from "../../controllers/controller";
// import { Models.Agent, Trade, Conversation } from "../models/index";

// export const ActionRejectTradeRequest: Action = {
//   name: "reject-trade-request",
//   formats: [
//     {
//       agentID: "number"
//     }
//   ],
//   enact: (agent: Models.Agent, inputData: any) => {
//     const controller = new Controller();
//     const toModels.Agent: Models.Agent = Models.Agent.getByID(inputData.agentID);
//     controller.removeTradeRequest(agent, toModels.Agent);
//     logger.log("Event reject-trade-request from (" + agent + ") to agent " + toModels.Agent + " registered.", 2);

//     controller.sendUpdates();
//   },
//   validate: (agent: Models.Agent, socket: any, inputData: any) => {
//     let res;
//     if (!(res = Validate.validate_agent_logged_in(agent)).status) {
//       return res;
//     }
//     const toModels.Agent = Models.Agent.getByID(inputData.agentID);
//     if (!(res = Validate.validate_agent_logged_in(toModels.Agent)).status) {
//       return res;
//     }
//     if (!(res = Validate.validate_agents_share_conversation(agent, toModels.Agent)).status) {
//       return res;
//     }
//     if (!(res = Validate.validate_agents_not_already_trading(agent, toModels.Agent)).status) {
//       return res;
//     }
//     return Validate.successMsg;
//   }
// };
