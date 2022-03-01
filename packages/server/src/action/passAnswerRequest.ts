import { Agent, Util, Information } from "@panoptyk/core";
import { Action } from "./action";
import * as Validate from "../validate";
import { TradeController } from "..";

export const ActionPassAnswerRequest: Action = {
    name: "pass-answer-request",
    formats: [
        {
            questionIDs: "object"
        }
    ],
    enact: (agent: Agent, inputData: any) => {
        const tc: TradeController = new TradeController();
        const questions = Util.AppContext.db.retrieveModels(
            inputData.questionIDs,
            Information
        );

        tc.passOnAnswerRequests(agent, agent.trade, questions);

        Util.logger.log(
            `Event pass-answer-request ${agent} agreed to offer` +
            `answers for questions ${questions} in trade`,
            "ACTION"
        );

        tc.sendUpdates();
    },
    validate: (agent: Agent, socket: any, inputData: any) => {
        let res;
        
        if (!(res = Validate.loggedIn(agent)).success) {
            return res;
        }
        if (!(res = Validate.agentInTrade(agent)).success) {
            return res;
        }
        if (!(res = Validate.validTrade(agent.trade, agent)).success) {
            return res;
        }

        return Validate.ValidationSuccess;
    }
}