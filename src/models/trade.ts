import { logger, LOG } from "../utilities/logger";
import { Item } from "./item";
import { IDObject } from "./idObject";
import { Conversation } from "./conversation";
import { Agent } from "./agent";
import { Info } from "./information";

export class Trade extends IDObject {
  public static result = {
    FAILED: 0,
    SUCCESS: 1,
    IN_PROGRESS: 2,
    REQUESTED: 3
  };
  private static actives: Set<Trade> = new Set();
  private static requested: Set<Trade> = new Set();

  private initiatorID: number;
  private receiverID: number;
  private conversationID: number;
  private _resultStatus: number;
  public get resultStatus(): number {
    return this._resultStatus;
  }
  private initiatorItemIDs: Set<number>;
  private initiatorInfoIDs: Map<number, number>;
  private receiverItemIDs: Set<number>;
  private receiverInfoIDs: Map<number, number>;
  private initiatorStatus: boolean;
  private receiverStatus: boolean;

  /**
   * Trade model.
   * @param {Agent} initiatorID - initiating agent
   * @param {Agent} receiverID - responding agent
   * @param {Conversation} conversationID - conversation trade is happening in.
   * @param {number} id - id of trade. If undefined, one will be assigned.
   * @param {number} resultStatus - result status of trade.
   *              0=failed, 1=success, 2=in progress, 3=requested
   */
  constructor(
    initiator: Agent,
    receiver: Agent,
    conversation: Conversation,
    id?: number,
    resultStatus = Trade.result.REQUESTED
  ) {
    super(Trade.name, id);
    this.initiatorID = initiator ? initiator.id : undefined;
    this.receiverID = receiver ? receiver.id : undefined;
    this.conversationID = conversation ? conversation.id : undefined;
    this._resultStatus = resultStatus;

    this.initiatorItemIDs = new Set<number>();
    this.receiverItemIDs = new Set<number>();
    this.initiatorInfoIDs = new Map<number, number>();
    this.receiverInfoIDs = new Map<number, number>();

    this.initiatorStatus = false;
    this.receiverStatus = false;
    switch (this._resultStatus) {
      case Trade.result.IN_PROGRESS: {
        Trade.actives.add(this);
        break;
      }
      case Trade.result.REQUESTED: {
        Trade.requested.add(this);
        break;
      }
    }

    logger.log("Trade " + this + " Initialized.", LOG.INFO);
  }

public toString() {
  return this.id;
}

  /**
   * Load a trade JSON into memory.
   * @param {JSON} json - serialized trade object.
   */
  static load(json: Trade) {
    // Loads previous trades
    let t = Trade.objects[json.id];
    t = t ? t : new Trade(undefined, undefined, undefined, json.id);
    for (const key in json) {
      t[key] = json[key];
    }
    t.initiatorItemIDs = new Set<number>(t.initiatorItemIDs);
    t.receiverItemIDs = new Set<number>(t.initiatorItemIDs);
    t.initiatorInfoIDs = new Map<number, number>(t.initiatorInfoIDs);
    t.receiverInfoIDs = new Map<number, number>(t.receiverInfoIDs);
    t.setStatus(t._resultStatus);
    return t;
  }

  /**
   * Sanatizes data to be serialized
   * @param removePrivateData {boolean} Determines if private is removed information that a client/agent
   *  may not be privy to.
   */
  public serialize(removePrivateData = false) {
    const safeTrade = Object.assign({}, this);
    (safeTrade.initiatorItemIDs as any) = Array.from(safeTrade.initiatorItemIDs);
    (safeTrade.receiverItemIDs as any) = Array.from(safeTrade.receiverItemIDs);
    (safeTrade.initiatorInfoIDs as any) = Array.from(safeTrade.initiatorInfoIDs);
    (safeTrade.receiverInfoIDs as any) = Array.from(safeTrade.receiverInfoIDs);
    return safeTrade;
  }

  /**
   * Get item data for an agent in the trade.
   * @param {Agent} agent - agent object.
   * @returns [Item] array of agent's items involved in trade.
   */
  getAgentItemsData(agent: Agent) {
    let items: Item[];

    if (agent.id === this.initiatorID) {
      items = Item.getByIDs(Array.from(this.initiatorItemIDs));
    }
    else if (agent.id === this.receiverID) {
      items = Item.getByIDs(Array.from(this.receiverItemIDs));
    }
    else {
      logger.log("No matching agent for trade item data.", 0, "trade.js");
    }

    return items;
  }

  /**
   * Get info data for an agent in the trade.
   * @param {Agent} agent - agent object.
   * @returns [Item] array of agent's info involved in trade.
   */
  getAgentInfosData(agent: Agent) {
    let items: Info[];

    if (agent.id === this.initiatorID) {
      items = Info.getByIDs(Array.from(this.initiatorInfoIDs.keys()));
    }
    else if (agent.id === this.receiverID) {
      items = Info.getByIDs(Array.from(this.receiverInfoIDs.keys()));
    }
    else {
      logger.log("No matching agent for trade info data.", 0, "trade.js");
    }

    return items;
  }

  /**
   * Set status of trade.
   * 0=failed, 1=success, 2=in progress, 3=requested
   * @param {number} stat - status to set.
   */
  setStatus(stat: number) {
    this._resultStatus = stat;
    switch (this._resultStatus) {
      case Trade.result.IN_PROGRESS: {
        Trade.actives.add(this);
        Trade.requested.delete(this);
        break;
      }
      case Trade.result.REQUESTED: {
        Trade.requested.add(this);
        Trade.actives.delete(this);
        break;
      }
      default: {
        Trade.requested.delete(this);
        Trade.actives.delete(this);
        break;
      }
    }
  }

  /**
   * Set an agent's ready status. Returns true when both agents are ready.
   * @param {Agent} agent - agent to set status for.
   * @param {boolean} rstatus - status. True = ready, false = not ready.
   */
  setAgentReady(agent: Agent, rstatus: boolean): boolean {
    if (agent.id === this.initiatorID) {
      this.initiatorStatus = rstatus;
    } else if (agent.id === this.receiverID) {
      this.receiverStatus = rstatus;
    }

    return this.initiatorStatus && this.receiverStatus;
  }

  /**
   * Add items to one side of the trade.
   * @param {[Object]} items - items to add to trade.
   * @param {Agent} owner - agent object of agent adding the items.
   */
  addItems(items: Item[], owner: Agent) {
    if (owner.id === this.initiatorID) {
      items.forEach(item => this.initiatorItemIDs.add(item.id));
    } else if (owner.id === this.receiverID) {
      items.forEach(item => this.receiverItemIDs.add(item.id));
    } else {
      logger.log("Agent not in trade", 0, "trade.js");
      return;
    }

    for (const item of items) {
      item.inTransaction = true;
    }
  }

  /**
   * Add info to one side of the trade.
   */
  addInfo(question: Info, answer: Info, owner: Agent) {
    if (owner.id === this.initiatorID) {
      this.initiatorInfoIDs.set(question.id, answer.id);
    } else if (owner.id === this.receiverID) {
      this.receiverInfoIDs.set(question.id, answer.id);
    } else {
      logger.log("Agent not in trade", 0, "trade.js");
      return;
    }
  }

  /**
   * Remove items from one side of the trade.
   * @param {[Object]} items - items to remove from trade.
   * @param {Object} owner - agent object of agent removing the items.
   */
  removeItems(items: Item[], owner: Agent) {
    if (owner.id === this.initiatorID) {
      items.forEach(item => {
        this.initiatorItemIDs.delete(item.id);
        item.inTransaction = false;
      });
    } else if (owner.id === this.receiverID) {
      items.forEach(item => {
        this.receiverItemIDs.delete(item.id);
        item.inTransaction = false;
      });
    } else {
      logger.log("Agent not in trade", 0, "trade.js");
      return;
    }
  }

  /**
   * Remove info from one side of the trade.
   * @param {[Object]} items - info to remove from trade.
   * @param {Object} owner - agent object of agent removing the info.
   */
  removeInfo(items: Info[], owner: Agent) {
    if (owner.id === this.initiatorID) {
      items.forEach(item => {
        this.initiatorInfoIDs.delete(item.id);
      });
    } else if (owner.id === this.receiverID) {
      items.forEach(item => {
        this.receiverInfoIDs.delete(item.id);
      });
    } else {
      logger.log("Agent not in trade", 0, "trade.js");
      return;
    }
  }

  /**
   * Unlocks all the items in the trade.
   */
  cleanup() {
    let unlocked = "";

    for (const id of this.initiatorItemIDs) {
      const item = Item.getByID(id);
      item.in_transaction = false;
      unlocked += item.id + " ";
    }

    for (const id of this.receiverItemIDs) {
      const item = Item.getByID(id);
      item.in_transaction = false;
      unlocked += item.id + " ";
    }

    logger.log("Unlocked trade " + this + " items [ " + unlocked + "]", 2);
  }

  /**
   * Get all active trade objects with this agent.
   * @param {Agent} agent - agent to find trades for.
   * @return [trade]
   */
  static getActiveTradesWithAgent(agent: Agent) {
    const trades = [];

    for (const trade of Trade.actives) {
      if (trade.initiatorID === agent.id || trade.receiverID === agent.id) {
        trades.push(trade);
      }
    }

    return trades;
  }

  /**
   * Get all requested trade objects with this agent.
   * @param {Agent} agent - agent to find trades for.
   * @return [trade]
   */
  static getRequestedTradesWithAgent(agent: Agent) {
    const trades = [];

    for (const trade of Trade.requested) {
      if (trade.initiatorID === agent.id || trade.receiverID === agent.id) {
        trades.push(trade);
      }
    }

    return trades;
  }

  /**
   * Get all active trades between the 2 given agents
   * @param {Agent} agent1
   * @param {Agent} agent2
   */
  static getActiveTradesBetweenAgents(agent1: Agent, agent2: Agent) {
    const trades = [];

    for (const trade of Trade.actives) {
      if (trade.initiatorID === agent1.id && trade.receiverID === agent2.id ||
        trade.initiatorID === agent2.id && trade.receiverID === agent1.id) {
        trades.push(trade);
      }
    }

    return trades;
  }

  /**
   * Get all requested trades between the 2 given agents
   * @param {Agent} agent1
   * @param {Agent} agent2
   */
  static getRequestedTradesBetweenAgents(agent1: Agent, agent2: Agent) {
    const trades = [];

    for (const trade of Trade.requested) {
      if (trade.initiatorID === agent1.id && trade.receiverID === agent2.id ||
        trade.initiatorID === agent2.id && trade.receiverID === agent1.id) {
        trades.push(trade);
      }
    }

    return trades;
  }

  get agentIni(): Agent {
    return Agent.getByID(this.initiatorID);
  }

  get agentRec(): Agent {
    return Agent.getByID(this.receiverID);
  }

  get itemsIni(): Item[] {
    return Item.getByIDs(Array.from(this.initiatorItemIDs));
  }

  get itemsRec(): Item[] {
    return Item.getByIDs(Array.from(this.receiverItemIDs));
  }

  get infoAnsIni(): Info[] {
    return Info.getByIDs(Array.from(this.initiatorInfoIDs.values()));
  }

  get infoAnsRec(): Info[] {
    return Info.getByIDs(Array.from(this.receiverInfoIDs.values()));
  }

  get conversation(): Conversation {
    return Conversation.getByID(this.conversationID);
  }

  get statusIni(): boolean {
    return this.initiatorStatus;
  }

  get statusRec(): boolean {
    return this.receiverStatus;
  }
}
