import { logger, LOG } from "../utilities/logger";
import { Item } from "./item";
import { IDObject } from "./idObject";
import { Conversation } from "./conversation";
import { Agent } from "./agent";
import { Info } from "./information";

export interface AnswerInfo {
  answerID: number;
  maskedInfo: string[];
}

export class Trade extends IDObject {
  public static result = {
    FAILED: 0,
    SUCCESS: 1,
    IN_PROGRESS: 2
  };
  private static actives: Set<Trade> = new Set();

  private initiatorID: number;
  private receiverID: number;
  private conversationID: number;
  private _resultStatus: number;
  public get resultStatus(): number {
    return this._resultStatus;
  }
  private initiatorItemIDs: Set<number>;
  private initiatorInfo: Map<number, AnswerInfo>;
  private receiverItemIDs: Set<number>;
  private receiverInfo: Map<number, AnswerInfo>;
  private initiatorStatus: boolean;
  private receiverStatus: boolean;
  private _initiatorRequestedItems: Map<number, boolean>;
  public get initiatorRequestedItems(): Map<number, boolean> {
    return this._initiatorRequestedItems;
  }
  private _receiverRequestedItems: Map<number, boolean>;
  public get receiverRequestedItems(): Map<number, boolean> {
    return this._receiverRequestedItems;
  }
  private _initiatorGold: number;
  public get initiatorGold(): number {
    return this._initiatorGold;
  }
  private _receiverGold: number;
  public get receiverGold(): number {
    return this._receiverGold;
  }

  /**
   * Trade model.
   * @param {Agent} initiatorID - initiating agent
   * @param {Agent} receiverID - responding agent
   * @param {Conversation} conversationID - conversation trade is happening in.
   * @param {number} id - id of trade. If undefined, one will be assigned.
   * @param {number} resultStatus - result status of trade.
   *              0=failed, 1=success, 2=in progress
   */
  constructor(
    initiator: Agent,
    receiver: Agent,
    conversation: Conversation,
    id?: number,
    resultStatus = Trade.result.IN_PROGRESS
  ) {
    super(Trade.name, id);
    this.initiatorID = initiator ? initiator.id : undefined;
    this.receiverID = receiver ? receiver.id : undefined;
    this.conversationID = conversation ? conversation.id : undefined;
    this._resultStatus = resultStatus;

    this.initiatorItemIDs = new Set<number>();
    this.receiverItemIDs = new Set<number>();
    this.initiatorInfo = new Map<number, AnswerInfo>();
    this.receiverInfo = new Map<number, AnswerInfo>();
    this._initiatorRequestedItems = new Map<number, boolean>();
    this._receiverRequestedItems = new Map<number, boolean>();
    this._initiatorGold = 0;
    this._receiverGold = 0;

    this.initiatorStatus = false;
    this.receiverStatus = false;
    if (this._resultStatus === Trade.result.IN_PROGRESS) {
      Trade.actives.add(this);
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
    let t: Trade = Trade.objects[json.id];
    t = t ? t : new Trade(undefined, undefined, undefined, json.id);
    for (const key in json) {
      t[key] = json[key];
    }
    t.initiatorItemIDs = new Set<number>(t.initiatorItemIDs);
    t.receiverItemIDs = new Set<number>(t.receiverItemIDs);
    t.initiatorInfo = new Map<number, AnswerInfo>(t.initiatorInfo);
    t.receiverInfo = new Map<number, AnswerInfo>(t.receiverInfo);
    t._initiatorRequestedItems = new Map<number, boolean>(t._initiatorRequestedItems);
    t._receiverRequestedItems = new Map<number, boolean>(t._receiverRequestedItems);
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
    (safeTrade.initiatorInfo as any) = Array.from(safeTrade.initiatorInfo);
    (safeTrade.receiverInfo as any) = Array.from(safeTrade.receiverInfo);
    (safeTrade._initiatorRequestedItems as any) = Array.from(safeTrade._initiatorRequestedItems);
    (safeTrade._receiverRequestedItems as any) = Array.from(safeTrade._receiverRequestedItems);
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
   * Client: Returns ready status of agent or nothing if agent is not part of trade
   * @param agent
   */
  getAgentReadyStatus(agent: Agent): boolean {
    if (agent.id === this.initiatorID) {
      return this.initiatorStatus;
    }
    else if (agent.id === this.receiverID) {
      return this.receiverStatus;
    }
  }

  /**
   * Server: Set status of trade.
   * 0=failed, 1=success, 2=in progress
   * @param {number} stat - status to set.
   */
  setStatus(stat: number) {
    this._resultStatus = stat;
    switch (this._resultStatus) {
      case Trade.result.IN_PROGRESS: {
        Trade.actives.add(this);
        break;
      }
      default: {
        Trade.actives.delete(this);
        break;
      }
    }
  }

  /**
   * Server: Set an agent's ready status. Returns true when both agents are ready.
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
   * Server: Add info to one side of the trade.
   */
  addInfo(question: Info, answer: Info, owner: Agent, maskedInfo: string[]) {
    // Make sure that master copy of question is added to trade (so both agents can access it)
    const qID = question.isReference() ? question.infoID : question.id;
    const aID = answer.id;
    if (owner.id === this.initiatorID) {
      this.initiatorInfo.set(qID, {answerID: aID, maskedInfo});
    } else if (owner.id === this.receiverID) {
      this.receiverInfo.set(qID, {answerID: aID, maskedInfo});
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
   * Server: Remove info from one side of the trade.
   * @param {[Info]} infos - info to remove from trade.
   * @param {Agent} owner - agent object of agent removing the info.
   */
  removeInfo(infos: Info[], owner: Agent) {
    if (owner.id === this.initiatorID) {
      infos.forEach(info => {
        this.initiatorInfo.delete(info.id);
      });
    } else if (owner.id === this.receiverID) {
      infos.forEach(info => {
        this.receiverInfo.delete(info.id);
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
  static getActiveTradesWithAgent(agent: Agent): Trade[] {
    const trades = [];

    for (const trade of Trade.actives) {
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
  static getActiveTradesBetweenAgents(agent1: Agent, agent2: Agent): Trade[] {
    const trades = [];

    for (const trade of Trade.actives) {
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

  /**
   * Server: Return answers initiator has offered
   */
  get infoAnsIni(): Info[] {
    const answers = [];
    for (const ans of this.initiatorInfo.values()) {
      answers.push(Info.getByID(ans.answerID));
    }
    return answers;
  }

  /**
   * Server: Return answers receiver has offered
   */
  get infoAnsRec(): Info[] {
    const answers = [];
    for (const ans of this.receiverInfo.values()) {
      answers.push(Info.getByID(ans.answerID));
    }
    return answers;
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

  public addRequestedItem(agent: Agent, item: Item) {
    if (agent.id === this.initiatorID) {
      this._initiatorRequestedItems.set(item.id, false);
    }
    else if (agent.id === this.receiverID) {
      this._receiverRequestedItems.set(item.id, false);
    }
  }

  /**
   * Returns item requests for an agent; items that have been passed are set to true
   * @param agent
   */
  public getAgentsRequestedItems(agent: Agent): Map<Item, boolean> {
    const requestMap = new Map<Item, boolean>();
    if (agent.id === this.initiatorID) {
      for (const [id, response] of this._initiatorRequestedItems) {
        requestMap.set(Item.getByID(id), response);
      }
    }
    else if (agent.id === this.receiverID) {
      for (const [id, response] of this._receiverRequestedItems) {
        requestMap.set(Item.getByID(id), response);
      }
    }
    return requestMap;
  }

  /**
   * Given agent passes on other agent's item request
   * @param agent
   * @param item
   */
  public passOnRequestedItem(agent: Agent, item: Item) {
    if (agent.id !== this.initiatorID && this._initiatorRequestedItems.has(item.id)) {
      this._initiatorRequestedItems.set(item.id, true);
    }
    else if (agent.id !== this.receiverID && this._receiverRequestedItems.has(item.id)) {
      this._receiverRequestedItems.set(item.id, true);
    }
  }

  /**
   * Returns true if agent has offered a specific item, false otherwise.
   * @param agent
   * @param item
   */
  public agentOfferedItem(agent: Agent, item: Item): boolean {
    if (agent.id === this.initiatorID) {
      return this.initiatorItemIDs.has(item.id);
    }
    else if (agent.id === this.receiverID) {
      return this.receiverItemIDs.has(item.id);
    }
    return false;
  }

  /**
   * Returns true if agent has offered an answer to the specified question, false otherwise.
   * @param agent
   * @param question
   */
  public agentOfferedAnswer(agent: Agent, info: Info): boolean {
    if (agent.id === this.initiatorID) {
      for (const id of this.initiatorInfo.keys()) {
        if (info.isAnswer(Info.getByID(id))) return true;
      }
    }
    else if (agent.id === this.receiverID) {
      for (const id of this.receiverInfo.keys()) {
        if (info.isAnswer(Info.getByID(id))) return true;
      }
    }
    return false;
  }

  /**
   * Server: Modify gold that agent has offered in trade
   * @param agent
   * @param amount
   */
  public changeOfferedGold(agent: Agent, amount: number) {
    if (agent.id === this.initiatorID) {
      this._initiatorGold += amount;
    }
    else if (agent.id === this.receiverID) {
      this._receiverGold += amount;
    }
  }

  /**
   * Returns the amount of gold an agent has offered in the trade
   * @param agent
   */
  public getAgentsOfferedGold(agent: Agent): number {
    if (agent.id === this.initiatorID) {
      return this._initiatorGold;
    }
    else if (agent.id === this.receiverID) {
      return this._receiverGold;
    }
    return 0;
  }

  /**
   * Returns the questions and how many answers an agent has offered in trade
   * @param agent
   */
  public getAnswersOffered(agent: Agent): { qID: number; masked: boolean }[] {
    let answers: Map<number, AnswerInfo>;
    if (agent.id === this.initiatorID) {
      answers = this.initiatorInfo;
    } else if (agent.id === this.receiverID) {
      answers = this.receiverInfo;
    } else {
      return undefined;
    }
    return Array.from(answers.keys()).map(k => {
      return { qID: k, masked: answers.get(k).maskedInfo === undefined };
    }) as any;
  }
}
