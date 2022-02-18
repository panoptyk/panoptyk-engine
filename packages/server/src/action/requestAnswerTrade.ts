import { Agent, Information, Util } from "@panoptyk/core";
import { Action } from "./action";
import * as Validate from "../validate";
import { TradeController } from "..";

export const ActionRequestAnswerTrade: Action = {
    name: "request-answer-trade",
    formats: [
        {
            questionIDs: "object",
            agentID: "number"
        }
    ],
    enact: (requester: Agent, inputData: any) => {
        const tc: TradeController = new TradeController();
        const requestee = Util.AppContext.db.retrieveModel(
            inputData.agentID,
            Agent
        );
        const questions = Util.AppContext.db.retrieveModels(
            inputData.questionIDs,
            Information
        );

        tc.addAnswerRequests(requestee, requester.trade, questions);

        Util.logger.log(
            `Event request-answer-trade agent (${requester}) requested` +
            `answers for questions ${questions} from ${requestee} in trade`,
            "ACTION"
        );

        tc.sendUpdates();
    },
    validate: (agent: Agent, socket: any, inputData: any) => {
        let res;
        const requestee = Util.AppContext.db.retrieveModel(
            inputData.agentID,
            Agent
        );
        const questions = Util.AppContext.db.retrieveModels(
            inputData.questionIDs,
            Information
        );
        
        if (!(res = Validate.loggedIn(agent)).success) {
            return res;
        }
        if (!(res = Validate.agentInTrade(agent)).success) {
            return res;
        }
        if (!(res = Validate.validTrade(agent.trade, agent)).success) {
            return res;
        }
        if (!(res = Validate.agentsShareTrade(agent, requestee)).success) {
            return res;
        }
        if (!(res = Validate.ownsAnswers(requestee, questions)).success) {
            return res;
        }

        return Validate.ValidationSuccess;
    }
}