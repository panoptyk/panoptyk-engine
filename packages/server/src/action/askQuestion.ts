import { Agent, Util, Information, Query, Info } from "@panoptyk/core/lib";
import { Action } from "./action";
import * as Validate from "../validate";
import { ConversationController } from "../controllers";

export const ActionAskQuestion: Action = {
    name: "ask-question",
    formats: [
        {
            question: "object",
            action: "string",
        },
    ],
    enact: (agent: Agent, inputData: any) => {
        const cc: ConversationController = new ConversationController();
        const terms = inputData.question;
        const question = Query[inputData.action](terms);

        cc.askQuestionInConversation(
            agent.conversation,
            agent,
            question
        );

        Util.logger.log(
            `Event ask-question ${question} from questioner ${agent}
                on conversation ${agent.conversation}`,
            "ACTION"
        );

        cc.sendUpdates();
    },
    validate: (agent: Agent, socket: any, inputData: any) => {
        let res;

        if (!(res = Validate.loggedIn(agent)).success) {
            return res;
        }

        const conversation = agent.conversation;

        if (!(res = Validate.conversationInAgentsRoom(conversation, agent.room)).success) {
            return res;
        }

        if (!(res = Validate.hasAgent(conversation, agent)).success) {
            return res;
        }

        if (!(res = Validate.invalidConversation(conversation)).success) {
            return res;
        }

        return Validate.ValidationSuccess;
    }
};
