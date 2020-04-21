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

export interface Request {
  data: any;
  pass: boolean;
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
  private receiverItemIDs: Set<number>;
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
  private _requestedGold: Map<number, number>;
  private _answerIDs: Map<number, Map<number, AnswerInfo[]>>;
  private _answerRequests: Map<number, Request[]>;

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
    this._initiatorRequestedItems = new Map<number, boolean>();
    this._receiverRequestedItems = new Map<number, boolean>();
    this._initiatorGold = 0;
    this._receiverGold = 0;
    this._requestedGold = new Map<number, number>();
    this._answerIDs = new Map();
    this._answerRequests = new Map();

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
    t._answerIDs = new Map<number, Map<number, AnswerInfo[]>>(t._answerIDs);
    t._initiatorRequestedItems = new Map<number, boolean>(t._initiatorRequestedItems);
    t._receiverRequestedItems = new Map<number, boolean>(t._receiverRequestedItems);
    t._requestedGold = new Map<number, number>(t._requestedGold);
    t._answerRequests = new Map<number, Request[]>(t._answerRequests);
    t.setStatus(t._resultStatus);
    return t;
  }

  /**
   * Sanatizes data to be serialized
   * @param removePrivateData {boolean} Determines if private is removed information that a client/agent
   *  may not be privy to.
   * @param {Agent} agent - agent to customize info for
   */
  public serialize(agent?: Agent, removePrivateData = false) {
    const safeTrade = Object.assign({}, this);
    if (agent) {
      const agentInfoCpy = new Map<number, Map<number, AnswerInfo[]>>();
      for (const [agentID, ansPair] of safeTrade._answerIDs) {
        const infoPairs = new Map<number, AnswerInfo[]>();
        for (const [id, ans] of ansPair) {
          const newID = Info.getByID(id).getAgentsCopy(agent).id;
          infoPairs.set(newID, ans);
        }
        agentInfoCpy.set(agentID, infoPairs);
      }
      safeTrade._answerIDs = agentInfoCpy;
      const agentSpecificAnswerRequests = new Map();
      this._answerRequests.forEach((reqs, agentID) => {
        agentSpecificAnswerRequests.set(
          agentID,
          reqs.map(req => {
            return {
              data: (Info.getByID(req.data) as Info).getAgentsCopy(agent).id,
              pass: req.pass
            };
          })
        );
      });
      safeTrade._answerRequests = agentSpecificAnswerRequests;
    }
    (safeTrade.initiatorItemIDs as any) = Array.from(safeTrade.initiatorItemIDs);
    (safeTrade.receiverItemIDs as any) = Array.from(safeTrade.receiverItemIDs);
    (safeTrade._answerIDs as any) = Array.from(safeTrade._answerIDs);
    (safeTrade._answerRequests as any) = Array.from(safeTrade._answerRequests);
    (safeTrade._initiatorRequestedItems as any) = Array.from(safeTrade._initiatorRequestedItems);
    (safeTrade._receiverRequestedItems as any) = Array.from(safeTrade._receiverRequestedItems);
    (safeTrade._requestedGold as any) = Array.from(safeTrade._requestedGold);
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
  }

  /**
   * Server: Add info to one side of the trade.
   */
  addInfo(question: Info, answer: Info, agent: Agent, maskedInfo: string[]) {
    // Make sure that master copy of question is added to trade (so both agents can access it)
    const qID = question.isReference() ? question.infoID : question.id;
    const aID = answer.isReference() ? answer.infoID : answer.id;
    if (!this._answerIDs.has(agent.id)) {
      this._answerIDs.set(agent.id, new Map());
    }
    const agentAns = this._answerIDs.get(agent.id);
    if (!agentAns.has(qID)) {
      agentAns.set(qID, []);
    }
    agentAns.get(qID).push({
      answerID: aID,
      maskedInfo
    });
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
      });
    } else if (owner.id === this.receiverID) {
      items.forEach(item => {
        this.receiverItemIDs.delete(item.id);
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
    if (this._answerIDs.has(owner.id)) {
      for (const info of infos) {
        for (const answers of this._answerIDs.get(owner.id).values()) {
          const targetIdx = answers.findIndex(ans => ans.answerID === info.id);
          if (targetIdx) {
            answers.splice(targetIdx, 1);
            break;
          }
        }
      }
    }
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

  getAgentsAnswers(agent: Agent) {
    const answers = [];
    for (const ans of this._answerIDs.get(agent.id).values()) {
      answers.concat(ans);
    }
    return answers;
  }

  /**
   * TO BE REMOVED
   * Server: Return answers initiator has offered
   */
  get infoAnsIni(): Info[] {
    return this.getAgentsAnswers(this.agentIni);
  }

  /**
   * TO BE REMOVED
   * Server: Return answers receiver has offered
   */
  get infoAnsRec(): Info[] {
    return this.getAgentsAnswers(this.agentRec);
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

  public removeRequestedItem(agent: Agent, item: Item) {
    if (agent.id === this.initiatorID) {
      this._initiatorRequestedItems.delete(item.id);
    }
    else if (agent.id === this.receiverID) {
      this._receiverRequestedItems.delete(item.id);
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
   * Server: Update the amount of gold requested by a given agent
   * @param agent
   * @param amount
   */
  public requestGold(agent: Agent, amount: number) {
    this._requestedGold.set(agent.id, amount);
  }

  /**
   * Returns the amount of gold requested by the agent
   * @param agent
   */
  public getAgentsRequestedGold(agent: Agent): number {
    return this._requestedGold.get(agent.id);
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

  addRequestedAnswer(agent: Agent, question: Info) {
    const qID = question.isReference() ? question.infoID : question.id;
    if (!this._answerRequests.has(agent.id)) {
      this._answerRequests.set(agent.id, []);
    }
    if (
      !this._answerRequests
        .get(agent.id)
        .reduce((a, b) => a || b.data === qID, false)
    ) {
      this._answerRequests.get(agent.id).push({
        data: qID,
        pass: false
      });
    }
  }

  removeRequestedAnswer(agent: Agent, question: Info) {
    const qID = question.isReference() ? question.infoID : question.id;
    if (this._answerRequests.has(agent.id)) {
      const idx = this._answerRequests.get(agent.id).findIndex(req => req.data !== qID);
      if (idx) {
        this._answerRequests.get(agent.id).splice(idx, 1);
      }
    }
  }

  /**
   * Given agent passes on other agent's answer request to question
   * @param agent
   * @param question
   */
  public passOnRequestedQuestion(agent: Agent, question: Info) {
    const qID = question.isReference() ? question.infoID : question.id;
    const other = agent === this.agentRec ? this.agentIni : this.agentRec;
    if (this._answerRequests.has(other.id)) {
      for (const req of this._answerRequests.get(other.id)) {
        if (req.data === qID) {
          req.pass = true;
          break;
        }
      }
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
  public agentOfferedAnswer(agent: Agent, question: Info): boolean {
    const qID = question.isReference() ? question.infoID : question.id;
    return (
      this._answerIDs.has(agent.id) && this._answerIDs.get(agent.id).has(qID) && this._answerIDs.get(agent.id).get(qID).length > 0
    );
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
  public getAnswersOffered(agent: Agent): { qID: number; quantity: number }[] {
    const answers: { qID: number; quantity: number }[] = [];
    if (this._answerIDs.has(agent.id)) {
      this._answerIDs.get(agent.id).forEach((val, key) => {
        answers.push({
          qID: key,
          quantity: val.length
        });
      });
    }
    return answers;
  }

  /**
   * Returns answer requests for an agent; questions that have been passed are set to true
   * @param agent
   */
  public getAgentsRequestedAnswers(agent: Agent): Map<Info, boolean> {
    const requestMap = new Map<Info, boolean>();
    if (this._answerRequests.has(agent.id)) {
      this._answerRequests.get(agent.id).forEach(req => {
        requestMap.set(Info.getByID(req.data), req.pass);
      });
    }
    return requestMap;
  }
}
