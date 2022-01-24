import { Agent, Util, Information } from "@panoptyk/core";
import { Action } from "./action";
import * as Validate from "../validate";
import { TradeController } from "..";

export const ActionOfferAnswerTrade: Action = {
    name: "offer-answer-trade",
    formats: [
        {
            answerID: "number",
            questionID: "number",
            mask: "object"
        }
    ],
    enact: (agent: Agent, inputData: any) => {
        const answer = Util.AppContext.db.retrieveModel(
            inputData.answerID,
            Information
        );
        const question = Util.AppContext.db.retrieveModel(
            inputData.questionID,
            Information
        );
        const mask: string[] = inputData.mask;
        const tc: TradeController = new TradeController();

        tc.offerAnswers(agent, agent.trade, answer, question, mask);

        Util.logger.log(
            `Event offer-answer-trade agent (${agent}) offer \
            answer (${answer}) to question (${question}) in trade`,
            "ACTION"
        );

        tc.sendUpdates();
    },
    validate: (agent: Agent, socket: any, inputData: any) => {
        let res;
        const answer = Util.AppContext.db.retrieveModel(
            inputData.answerID,
            Information
        );
        const question = Util.AppContext.db.retrieveModel(
            inputData.questionID,
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
        if (!(res = Validate.ownsInfos(agent, [answer])).success) {
            return res;
        }
        if (!(res = Validate.isAnswerToQuestion(answer, question)).success) {
            return res;
        }

        return Validate.ValidationSuccess;
    }
}
