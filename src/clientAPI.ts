import * as io from "socket.io-client";
import { ValidationResult } from "./models/validate";
import {
  Agent,
  Room,
  Info,
  Trade,
  Item,
  Conversation
} from "./models/index";

const MODELS: any = {
  Agent,
  Room,
  Info,
  Item,
  Trade,
  Conversation
};

export interface UpdatedModels {
  Info: Info[];
  Room: Room[];
  Agent: Agent[];
  Item: Item[];
  Trade: Trade[];
  Conversation: Conversation[];
}

const emit = function(
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
    return (ClientAPI._playerAgent = Agent.getAgentByName(
      ClientAPI.playerAgentName
    ));
  }

  private static async sendWrapper(event: string, payload: any) {
    if (ClientAPI.initialized && ClientAPI.actionSent) {
      const res: ValidationResult = {
        status: false,
        message: "Please wait for action to complete!"
      };
      throw res;
    }
    ClientAPI.actionSent = true;
    const res = await emit(ClientAPI.socket, event, payload);
    ClientAPI.actionSent = false;
    if (res.status) {
      return res;
    } else {
      throw res;
    }
  }

  /**
   * Call init before using anything else in the ClientAPI
   * @param ipAddress address of panoptyk game server
   */
  public static init(ipAddress = "http://localhost:8080") {
    ClientAPI.socket = io.connect(ipAddress);
    // Sets up the hook to recieve updates on relevant models
    ClientAPI.socket.on("updateModels", data => {
      console.log("--Model updates recieved--");
      ClientAPI.updating.push(true);
      const updates: UpdatedModels = {
        Agent: [],
        Info: [],
        Item: [],
        Room: [],
        Trade: [],
        Conversation: []
      };
      for (const key in data) {
        for (const model of data[key]) {
          MODELS[key].load(model);
          updates[key].push(MODELS[key].getByID(model.id));
        }
      }
      // Sort new info
      const agent = ClientAPI.playerAgent;
      if (agent) {
        updates.Info.forEach(i => {
          agent.addInfoToBeSorted(i);
        });
        agent.sortInfo();
      }

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
    const res = await ClientAPI.sendWrapper("login", {
      username: name,
      password
    });
    ClientAPI.playerAgentName = name;
    return res;
  }

  /**
   * Assumes agent has logged into server
   * @param room room to move to
   * @param agent for admins move other agents around
   */
  public static async moveToRoom(room: Room, agent?: Agent) {
    const res = await ClientAPI.sendWrapper("move-to-room", {
      roomID: room.id
    });
    return res;
  }

  /**
   * Request conversation between 2 logged-in agents
   * @param targetAgent agent to request conversation with
   */
  public static async requestConversation(targetAgent: Agent) {
    const res = await ClientAPI.sendWrapper("request-conversation", {
      agentID: targetAgent.id
    });
    return res;
  }

  /**
   * Accept conversation from other agent
   * @param targetAgent agent to accept conversation with
   */
  public static async acceptConversation(targetAgent: Agent) {
    const res = await ClientAPI.sendWrapper("request-conversation", {
      agentID: targetAgent.id
    });
    return res;
  }

  /**
   * Leave current conversation
   * @param targetConversation conversation to leave
   */
  public static async leaveConversation(targetConversation: Conversation) {
    const res = await ClientAPI.sendWrapper("leave-conversation", {
      conversationID: targetConversation.id
    });
    return res;
  }

  /**
   * Request trade between 2 agents in a Conversation
   * @param targetAgent agent to request trade with
   */
  public static async requestTrade(targetAgent: Agent) {
    const res = await ClientAPI.sendWrapper("request-trade", {
      agentID: targetAgent.id
    });
    return res;
  }

  /**
   * Have logged-in agent cancel/reject specified trade
   * @param targetTrade
   */
  public static async cancelTrade(targetTrade: Trade) {
    const res = await ClientAPI.sendWrapper("cancel-trade", {
      tradeID: targetTrade.id
    });
    return res;
  }

  /**
   * Items to offer in specified trade.
   * @param trade
   * @param items
   */
  public static async offerItemsTrade(trade: Trade, items: Item[]) {
    const itemIDs: number[] = [];
    for (const item of items) {
      itemIDs.push(item.id);
    }
    const res = await ClientAPI.sendWrapper("offer-items-trade", {
      tradeID: trade.id,
      itemIDs
    });
    return res;
  }

  /**
   * Items to withdraw from specified trade.
   * @param trade
   * @param items
   */
  public static async withdrawItemsTrade(trade: Trade, items: Item[]) {
    const itemIDs: number[] = [];
    for (const item of items) {
      itemIDs.push(item.id);
    }
    const res = await ClientAPI.sendWrapper("withdraw-items-trade", {
      tradeID: trade.id,
      itemIDs
    });
    return res;
  }

  /**
   * Set trade ready status to true or false/
   * @param trade
   * @param status
   */
  public static async setTradeReadyStatus(trade: Trade, status: boolean) {
    const res = await ClientAPI.sendWrapper("ready-trade", {
      tradeID: trade.id,
      readyStatus: status
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
  public static async askQuestion(question: object) {
    const res = await ClientAPI.sendWrapper("ask-question", { question });
    return res;
  }

  /**
   * Tells owner of question that you have an answer to their question.
   */
  public static async confirmKnowledgeOfAnswerToQuestion(question: Info, answer: Info) {
    const res = await ClientAPI.sendWrapper("confirm-knowledge", {
      questionID: question.id,
      answerID: answer.id
    });
    return res;
  }

  /**
   * Offer an answer to a question as part of a trade.
   */
  public static async offerAnswerTrade(trade: Trade, answer: Info, question: Info) {
    const res = await ClientAPI.sendWrapper("offer-answer-trade", {
      tradeID: trade.id,
      answerID: answer.id,
      questionID: question.id
    });
    return res;
  }

  /**
   * Withdraw an answer from a given trade.
   */
  public static async withdrawInfoTrade(trade: Trade, info: Info) {
    const res = await ClientAPI.sendWrapper("withdraw-info-trade", {
      tradeID: trade.id,
      infoID: info.id
    });
    return res;
  }

  /**
   * Freely give an information item in a conversation.
   */
  public static async tellInfo(info: Info) {
    const res = await ClientAPI.sendWrapper("tell-info", {infoID: info.id});
    return res;
  }

  /**
   * Pass on question in current conversation.
   */
  public static async passOnQuestion(question: Info) {
    const res = await ClientAPI.sendWrapper("pass-question", { infoID: question.id });
    return res;
  }
}
