import { Util, Agent } from "@panoptyk/core";
import { Action } from "./action";
import * as Validate from "../validate";
import { ConversationController } from "../controllers";

export const ActionRejectConversationRequest: Action = {
    name: "reject-conversation-request",
    formats: [
        {
            agentID: "number",
            reject: "boolean",
        },
    ],
    enact: (requester: Agent, inputData: any) => {
        const cc: ConversationController = new ConversationController();
        const requestee: Agent = Util.AppContext.db.retrieveModel(
            inputData.agentID,
            Agent
        ) as Agent;
        if (inputData.reject) {
            cc.rejectConversation(requester, requestee);
        }
        else {
            cc.rejectConversation(requestee, requester);
        }
        Util.logger.log(
            "Event reject-conversation-request from (" +
                requester +
                ") to agent " +
                requestee +
                " registered.",
            "ACTION"
        );
        cc.sendUpdates();
    },
    validate: (agent: Agent, socket: any, inputData: any) => {
        let res;
        if (!(res = Validate.loggedIn(agent)).success) {
            return res;
        }
        const requestee: Agent = Util.AppContext.db.retrieveModel(
            inputData.agentID,
            Agent
        ) as Agent;
        if (!(res = Validate.loggedIn(requestee)).success) {
            return res;
        }
        if (!(res = Validate.sameRoom([agent, requestee])).success) {
            return res;
        }
        if (!(res = Validate.notInConversation([agent, requestee])).success) {
            return res;
        }
        return Validate.ValidationSuccess;
    },
};
