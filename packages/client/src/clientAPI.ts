import * as io from "socket.io-client";
import {
    Util,
    ValidationResult,
    Agent,
    Room,
    Info,
    Information,
    Trade,
    Item,
    Conversation,
    Quest,
    Faction,
    ValidationError,
    MemoryDatabase,
} from "@panoptyk/core";
import { UpdatedModels, updateModelsInMem } from "./communication/updateModels";

const emit = function (
    socket: SocketIOClient.Socket,
    event: string,
    payload: any
): Promise<ValidationResult> {
    return new Promise((resolve, reject) => {
        socket.emit(event, payload, (result: ValidationResult) => {
            resolve(result);
        });
    });
};

export class ClientAPI {
    // set of functions with signature function(): void
    private static onUpdateListeners: Set<
        (updatedModels: UpdatedModels) => void
    > = new Set<(updatedModels: UpdatedModels) => void>();
    private static socket: SocketIOClient.Socket = undefined;
    private static initialized = false;
    private static actionSent = false;
    private static updating: boolean[] = [];
    private static playerAgentName = undefined;
    private static playerAgentPassword = undefined;
    private static _playerAgent: Agent = undefined;
    public static get playerAgent(): Agent {
        // No name to use to find agent
        if (!ClientAPI.playerAgentName) {
            return undefined;
        }
        // Skip searching for player agent if already found
        if (
            ClientAPI._playerAgent &&
            ClientAPI._playerAgent.agentName === ClientAPI.playerAgentName
        ) {
            // Get latest verison of player
            return ClientAPI._playerAgent;
        }
        // Search for player agent
        const match = Util.AppContext.db.matchModels(
            { _agentName: ClientAPI.playerAgentName },
            Agent
        );
        if (match.length === 1) {
            ClientAPI._playerAgent = match[0] as Agent;
        }
        return ClientAPI._playerAgent;
    }
    private static _seenAgents = new Set<number>();
    public static get seenAgents(): Agent[] {
        return Util.AppContext.db.retrieveModels(
            Array.from(ClientAPI._seenAgents),
            Agent
        ) as Agent[];
    }
    private static _seenRooms = new Set<number>();
    public static get seenRooms(): Room[] {
        return Util.AppContext.db.retrieveModels(
            Array.from(ClientAPI._seenRooms),
            Room
        ) as Room[];
    }
    private static _seenItems = new Set<number>();
    public static get seenItems(): Item[] {
        return Util.AppContext.db.retrieveModels(
            Array.from(ClientAPI._seenItems),
            Item
        ) as Item[];
    }

    // sends communication to Panoptyk server
    private static async sendWrapper(event: string, payload: any) {
        if (ClientAPI.initialized && ClientAPI.actionSent) {
            const res: ValidationResult = {
                success: false,
                errorCode: ValidationError.None,
                message: "Please wait for action to complete!",
            };
            throw res;
        }
        ClientAPI.actionSent = true;
        const res = await emit(ClientAPI.socket, event, payload);
        ClientAPI.actionSent = false;
        if (res.success) {
            return res;
        } else {
            throw res;
        }
    }

    /**
     * Call init before using anything else in the ClientAPI
     * @param ipAddress address of panoptyk game server
     */
    public static init(ipAddress = "http://localhost:8080", mode = 0) {
        Util.AppContext.db = new MemoryDatabase();
        if (mode === 0) {
            Util.logger.silence();
        }
        ClientAPI.socket = io.connect(ipAddress);
        // Sets up the hook to recieve updates on relevant models
        ClientAPI.socket.on("updateModels", (dataString) => {
            Util.logger.log("--Model updates recieved--", "CLIENT", 2);
            ClientAPI.updating.push(true);
            const data = Util.SmartJSON.parse(dataString);
            const updates = updateModelsInMem(data);

            ClientAPI.updating.pop();
            // alert listeners if there are no more incoming updates
            for (const callback of this.onUpdateListeners) {
                callback(updates);
            }

            // dereference variables
            for (const key in updates) {
                updates[key] = undefined;
            }
        });

        ClientAPI.socket.on("connect", () => {});
        ClientAPI.initialized = true;
    }

    /**
     * Adds function to be called when model is updated
     * @param func function with signature function(u: ClientAPI.UpdateModels): void
     */
    public static addOnUpdateListener(func: (u: UpdatedModels) => void) {
        this.onUpdateListeners.add(func);
    }

    /**
     * Removes callback function from listeners
     * @param func function with signature function(u: ClientAPI.UpdateModels): void
     */
    public static removeOnUpdateListener(func: (u: UpdatedModels) => void) {
        this.onUpdateListeners.delete(func);
    }

    /**
     * Determines if a new action can be attempted at this time
     */
    public static canAct(): boolean {
        return !ClientAPI.actionSent && ClientAPI.updating.length === 0;
    }

    /**
     * Informs if the client is processing a server model update at this time
     */
    public static isUpdating() {
        return ClientAPI.updating.length > 0;
    }

    /**
     * Login action to log player back into the world
     * @param name username
     * @param password password (should be a hash eventually)
     */
    public static async login(name: string, password: string) {
        ClientAPI.playerAgentName = name;
        const res = await ClientAPI.sendWrapper("login", {
            username: name,
            password,
        });
        // save data for reconnection if successful
        if (res.success) {
            ClientAPI.playerAgentPassword = password;
        }
        return res;
    }

    /**
     * Assumes agent has logged into server
     * @param room room to move to
     * @param agent for admins move other agents around
     */
    public static async moveToRoom(room: Room) {
        const res = await ClientAPI.sendWrapper("move-to-room", {
            roomID: room.id,
        });
        return res;
    }

    /**
     * Request conversation between 2 logged-in agents
     * @param targetAgent agent to request conversation with
     */
    public static async requestConversation(targetAgent: Agent) {
        const res = await ClientAPI.sendWrapper("request-conversation", {
            agentID: targetAgent.id,
        });
        return res;
    }

    /**
     * Accept conversation from other agent
     * @param targetAgent agent to accept conversation with
     */
    public static async acceptConversation(targetAgent: Agent) {
        const res = await ClientAPI.sendWrapper("request-conversation", {
            agentID: targetAgent.id,
        });
        return res;
    }

    /**
     * Leave current conversation
     * @param targetConversation conversation to leave
     */
    public static async leaveConversation(
        conversation: Conversation = ClientAPI.playerAgent.conversation
    ) {
        const res = await ClientAPI.sendWrapper("leave-conversation", {
            conversationID: conversation.id,
        });
        return res;
    }

    /**
     * Request trade between 2 agents in a Conversation
     * @param targetAgent agent to request trade with
     */
    public static async requestTrade(targetAgent: Agent) {
        const res = await ClientAPI.sendWrapper("request-trade", {
            agentID: targetAgent.id,
        });
        return res;
    }

    /**
     * Accept trade from another agent in current Conversation
     * @param targetAgent agent to accept trade with
     */
    public static async acceptTrade(targetAgent: Agent) {
        const res = await ClientAPI.sendWrapper("request-trade", {
            agentID: targetAgent.id,
        });
        return res;
    }

    /**
     * Have logged-in agent cancel/reject specified trade
     * @param targetTrade
     */
    public static async cancelTrade(
        trade: Trade = ClientAPI.playerAgent.trade
    ) {
        const res = await ClientAPI.sendWrapper("cancel-trade", {
            tradeID: trade.id,
        });
        return res;
    }

    /**
     * Items to offer in specified trade.
     * @param items
     */
    public static async offerItemsTrade(items: Item[]) {
        const itemIDs: number[] = [];
        for (const item of items) {
            itemIDs.push(item.id);
        }
        const res = await ClientAPI.sendWrapper("offer-items-trade", {
            itemIDs,
        });
        return res;
    }

    /**
     * Items to withdraw from specified trade.
     * @param trade
     * @param items
     */
    public static async withdrawItemsTrade(items: Item[]) {
        const itemIDs: number[] = [];
        for (const item of items) {
            itemIDs.push(item.id);
        }
        const res = await ClientAPI.sendWrapper("withdraw-items-trade", {
            itemIDs,
        });
        return res;
    }

    /**
     * Set trade ready status to true or false/
     * @param trade
     * @param status
     */
    public static async setTradeReadyStatus(status: boolean) {
        const res = await ClientAPI.sendWrapper("ready-trade", {
            readyStatus: status,
        });
        return res;
    }

    /**
     * Take items from room
     * @param items
     */
    public static async takeItems(items: Item[]) {
        const itemIDs: number[] = [];
        for (const item of items) {
            itemIDs.push(item.id);
        }
        const res = await ClientAPI.sendWrapper("take-items", { itemIDs });
        return res;
    }

    /**
     * Drop items in room
     * @param items
     */
    public static async dropItems(items: Item[]) {
        const itemIDs: number[] = [];
        for (const item of items) {
            itemIDs.push(item.id);
        }
        const res = await ClientAPI.sendWrapper("drop-items", { itemIDs });
        return res;
    }

    /**
     * Ask a question in current conversation.
     */
    public static async askQuestion(
        question: any,
        action: string
    ) {
        const res = await ClientAPI.sendWrapper("ask-question", {
            question,
            action
        });
        return res;
    }

    /**
     * Offer an answer to a question as part of a trade.
     */
    public static async offerAnswerTrade(
        answer: Info,
        question: Info,
        mask: string[] = []
    ) {
        const res = await ClientAPI.sendWrapper("offer-answer-trade", {
            answerID: answer.id,
            questionID: question.id,
            mask,
        });
        return res;
    }

    /**
     * Withdraw an answer from a given trade.
     */
    public static async withdrawInfoTrade(info: Info) {
        const res = await ClientAPI.sendWrapper("withdraw-info-trade", {
            infoID: info.id,
        });
        return res;
    }

    /**
     * Tell info within a conversation.
     */
    public static async tellInfo(info: Info) {
        const res = await ClientAPI.sendWrapper("tell-info", {
            infoID: info.id,
        });
        return res;
    }

    /**
     * Pass on question in current conversation.
     */
    public static async passOnQuestion(question: Info) {
        const res = await ClientAPI.sendWrapper("pass-question", {
            infoID: question.id,
        });
        return res;
    }

    /**
     * Request an item in current trade
     * @param item
     */
    public static async requestItemTrade(item: Item) {
        const res = await ClientAPI.sendWrapper("request-item-trade", {
            itemID: item.id,
        });
        return res;
    }

    /**
     * Pass on item request in current trade
     * @param item
     */
    public static async passItemRequestTrade(item: Item) {
        const res = await ClientAPI.sendWrapper("pass-item-request", {
            itemID: item.id,
        });
        return res;
    }

    /**
     * Quest giver gives quest to quest receiver in current Conversation
     * @param giver
     * @param receiver
     * @param taskID questionID
     * @param deadline OPTIONAL deadline of 0 counts as no deadline
     */
    public static async giveQuest(
        giver: Agent,
        receiver: Agent,
        taskID: any,
        deadline = 0,
    ) {
        const res = await ClientAPI.sendWrapper("give-quest", {
            giverID: giver.id,
            receiverID: receiver.id,
            taskID: taskID,
            deadline: deadline,
        });
        return res;
    }

    /**
     * Quest giver marks quest as complete
     * @param quest
     */
     public static async completeQuest(quest: Quest) {
        const res = await ClientAPI.sendWrapper("close-quest", {
            questID: quest.id,
            status: "COMPLETE",
        });
        return res;
    }

    /**
     * Quest giver marks quest as failed
     * @param quest
     */
    public static async failQuest(quest: Quest) {
        const res = await ClientAPI.sendWrapper("close-quest", {
            questID: quest.id,
            status: "FAILED",
        });
        return res;
    }

    /**
     * Tells quest solution to quest giver when in a conversation with them
     * @param quest
     * @param solution
     */
    public static async turnInQuestInfo(
        quest: Quest,
        solution: Info
    ) {
        const res = await ClientAPI.sendWrapper("turn-in-quest-info", {
            questID: quest.id,
            solutionID: solution.id
        });
        return res;
    }

    /**
     * Reject conversation request from targetAgent
     * @param targetAgent
     */
    public static async rejectConversation(targetAgent: Agent) {
        const res = await ClientAPI.sendWrapper("reject-conversation-request", {
            agentID: targetAgent.id,
        });
        return res;
    }

    /**
     * Reject trade request from targetAgent
     * @param targetAgent
     */
    public static async rejectTrade(targetAgent: Agent) {
        const res = await ClientAPI.sendWrapper("reject-trade-request", {
            agentID: targetAgent.id,
        });
        return res;
    }

    /**
     * WIP way to change agent faction/rank
     * @param targetAgent
     * @param faction
     * @param rank
     */
    public static async modifyAgentFaction(
        targetAgent: Agent,
        faction: Faction,
        rank = 10
    ) {
        const res = await ClientAPI.sendWrapper("modify-agent-faction", {
            agentID: targetAgent.id,
            factionID: faction.id,
            rank,
        });
        return res;
    }

    /**
     * Add specified gold amount to trade offering
     * @param amount
     */
    public static async addGoldToTrade(amount: number) {
        const res = await ClientAPI.sendWrapper("modify-gold-trade", {
            amount,
        });
        return res;
    }

    /**
     * Remove specified gold amount from trade offering
     * @param amount
     */
    public static async removeGoldfromTrade(amount: number) {
        amount *= -1;
        const res = await ClientAPI.sendWrapper("modify-gold-trade", {
            amount,
        });
        return res;
    }

    /**
     * Drop specified gold amount into room
     * @param amount
     */
    public static async dropGold(amount: number) {
        const res = await ClientAPI.sendWrapper("drop-gold", {
            amount,
        });
        return res;
    }
}
