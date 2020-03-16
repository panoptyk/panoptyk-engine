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

  // REMOVE BELOW //
  private initiatorID: number;
  private receiverID: number;
  // REMOVE ABOVE //
  private _agentIDs: Set<number>;
  private _conversationID: number;
  private _resultStatus: number;
  public get resultStatus(): number {
    return this._resultStatus;
  }

  private _itemIDs: Map<number, Set<number>>;
  private _itemRequests: Map<number, Request[]>;

  private _answerIDs: Map<number, Map<number, AnswerInfo[]>>;
  private _answerRequests: Map<number, Request[]>;

  private _gold: Map<number, number>;
  private _goldRequest: Map<number, Request[]>;

  private _status: Map<number, boolean>;

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
    // REMOVE //
    this.initiatorID = initiator ? initiator.id : undefined;
    this.receiverID = receiver ? receiver.id : undefined;
    // REMOVE //
    this._agentIDs = new Set();
    this._agentIDs.add(this.initiatorID);
    this._agentIDs.add(this.receiverID);
    this._conversationID = conversation ? conversation.id : undefined;
    this._resultStatus = resultStatus;

    this._itemIDs = new Map();
    this._itemRequests = new Map();
    this._answerIDs = new Map();
    this._answerRequests = new Map();
    this._gold = new Map();
    this._goldRequest = new Map();
    this._status = new Map();
    if (initiator && receiver) {
      this._status.set(initiator.id, false);
      this._status.set(receiver.id, false);
      this._gold.set(initiator.id, 0);
      this._gold.set(receiver.id, 0);
    }

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
    const safeTrade = Object.assign({}, this); // Is not a deep copy
    if (agent) {
      // get agent copy of question IDs
      const agentSpecificAnswerIDs = new Map();
      this._answerIDs.forEach((questionMap, agentID) => {
        agentSpecificAnswerIDs.set(agentID, new Map());
        questionMap.forEach((answers, qID) => {
          agentSpecificAnswerIDs
            .get(agentID)
            .set((Info.getByID(qID) as Info).getAgentsCopy(agent).id, answers);
        });
      });
      safeTrade._answerIDs = agentSpecificAnswerIDs;
      // get agent copy of question IDs for requests
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

    return safeTrade;
  }

  /**
   * Get item data for an agent in the trade.
   * @param {Agent} agent - agent object.
   * @returns [Item] array of agent's items involved in trade.
   */
  getAgentItemsData(agent: Agent): Item[] {
    let items: Item[] = [];

    if (this._itemIDs.has(agent.id)) {
      items = Item.getByIDs([...this._itemIDs.get(agent.id)]);
    }

    return items;
  }

  /**
   * Client: Returns ready status of agent or nothing if agent is not part of trade
   * @param agent
   */
  getAgentReadyStatus(agent: Agent): boolean {
    let status = undefined;
    if (this._status.has(agent.id)) {
      status = this._status.get(agent.id);
    }
    return status;
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
    this._status.set(agent.id, rstatus);
    return this.allAgentsReady();
  }

  /**
   * Server: Check if all agents are ready to complete trade
   * @return {boolean} True = all ready, false = not all ready.
   */
  allAgentsReady(): boolean {
    return Array.from(this._status.values()).reduce((a, b) => a && b, true);
  }

  /**
   * Server: clear agent's current offered items, gold, info
   * @param agent
   */
  removeAllOffered(agent: Agent) {
    this._gold.set(agent.id, 0);
    this._itemIDs.set(agent.id, new Set());
    this._answerIDs.set(agent.id, new Map());
  }

  /**
   * Add items to one side of the trade.
   * @param {[Object]} items - items to add to trade.
   * @param {Agent} agent - agent object of agent adding the items.
   */
  addItems(items: Item[], agent: Agent) {
    if (!this._itemIDs.has(agent.id)) {
      this._itemIDs.set(agent.id, new Set());
    }
    items.forEach(item => {
      this._itemIDs.get(agent.id).add(item.id);
    });
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
  removeItems(items: Item[], agent: Agent) {
    if (this._itemIDs.has(agent.id)) {
      items.forEach(i => {
        this._itemIDs.get(agent.id).delete(i.id);
      });
    }
  }

  /**
   * Server: Remove info from one side of the trade.
   * @param {[Info]} infos - info to remove from trade.
   * @param {Agent} owner - agent object of agent removing the info.
   */
  removeInfo(infos: Info[], owner: Agent) {
    // TODO: what info is being passed to remove question or answer?
    // NO OP
  }

  /**
   * Get all active trade objects with this agent.
   * @param {Agent} agent - agent to find trades for.
   * @return [trade]
   */
  static getActiveTradesWithAgent(agent: Agent): Trade[] {
    const trades = [];

    for (const trade of Trade.actives) {
      if (trade._agentIDs.has(agent.id)) {
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
      if (trade._agentIDs.has(agent1.id) && trade._agentIDs.has(agent2.id)) {
        trades.push(trade);
      }
    }

    return trades;
  }

  // REMOVE //
  get agentIni(): Agent {
    return Agent.getByID(this.initiatorID);
  }

  get agentRec(): Agent {
    return Agent.getByID(this.receiverID);
  }

  get itemsIni(): Item[] {
    return this.getAgentItemsData(this.agentIni);
  }

  get itemsRec(): Item[] {
    return this.getAgentItemsData(this.agentRec);
  }

  get initiatorGold(): number {
    return this._gold.get(this.initiatorID);
  }

  get receiverGold(): number {
    return this._gold.get(this.receiverID);
  }

  /**
   * Server: Return answers initiator has offered
   */
  get infoAnsIni(): Info[] {
    const answers = [];
    if (this._answerIDs.has(this.initiatorID)) {
      for (const ans of this._answerIDs.get(this.initiatorID).values()) {
        answers.push(...Info.getByIDs(ans.map(a => a.answerID)));
      }
    }
    return answers;
  }

  /**
   * Server: Return answers receiver has offered
   */
  get infoAnsRec(): Info[] {
    const answers = [];
    if (this._answerIDs.has(this.receiverID)) {
      for (const ans of this._answerIDs.get(this.receiverID).values()) {
        answers.push(...Info.getByIDs(ans.map(a => a.answerID)));
      }
    }
    return answers;
  }
  // REMOVE //

  get conversation(): Conversation {
    return Conversation.getByID(this._conversationID);
  }

  /**
   * Get a list of agents for this trade.
   * @param {Agent} ignoreAgent - do not include this agent object in list. (Optional).
   * @return {[Agent]}
   */
  public getAgents(ignoreAgent?: Agent): Agent[] {
    const agents = [];
    for (const id of this._agentIDs) {
      const agent = Agent.getByID(id);
      if (agent !== ignoreAgent) {
        agents.push(agent);
      }
    }
    return agents;
  }

  // REMOVE //
  get statusIni(): boolean {
    return this._status.get(this.initiatorID);
  }

  get statusRec(): boolean {
    return this._status.get(this.receiverID);
  }
  // REMOVE //

  public addRequestedItem(agent: Agent, item: Item) {
    if (!this._itemRequests.has(agent.id)) {
      this._itemRequests.set(agent.id, []);
    }
    if (
      !this._itemRequests
        .get(agent.id)
        .reduce((a, b) => a || b.data === item.id, false)
    ) {
      this._itemRequests.get(agent.id).push({
        data: item.id,
        pass: false
      });
    }
  }

  /**
   * Returns item requests for an agent; items that have been passed are set to true
   * @param agent
   */
  public getAgentsRequestedItems(agent: Agent): Map<Item, boolean> {
    const requestMap = new Map<Item, boolean>();
    if (this._itemRequests.has(agent.id)) {
      this._itemRequests.get(agent.id).forEach(req => {
        requestMap.set(Item.getByID(req.data), req.pass);
      });
    }
    return requestMap;
  }

  /**
   * Given agent passes on other agent's item request
   * @param agent
   * @param item
   */
  public passOnRequestedItem(agent: Agent, item: Item) {
    if (this._itemRequests.has(agent.id)) {
      for (const req of this._itemRequests.get(agent.id)) {
        if (req.data === item.id) {
          req.pass = true;
          break;
        }
      }
    }
  }

  public addRequestedAnswer(agent: Agent, question: Info) {
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

  /**
   * Given agent passes on other agent's answer request to question
   * @param agent
   * @param question
   */
  public passOnRequestedQuestion(agent: Agent, question: Info) {
    const qID = question.isReference() ? question.infoID : question.id;
    if (this._answerRequests.has(agent.id)) {
      for (const req of this._answerRequests.get(agent.id)) {
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
    return (
      this._itemIDs.has(agent.id) && this._itemIDs.get(agent.id).has(item.id)
    );
  }

  /**
   * Returns true if agent has offered an answer to the specified question, false otherwise.
   * @param agent
   * @param question
   */
  public agentOfferedAnswer(agent: Agent, question: Info): boolean {
    const qID = question.isReference() ? question.infoID : question.id;
    return (
      this._answerIDs.has(agent.id) && this._answerIDs.get(agent.id).has(qID)
    );
  }

  public agentAlreadyOfferedAnswer(agent: Agent, answer: Info) {
    const aID = answer.isReference() ? answer.infoID : answer.id;
    const questions = this._answerIDs.get(agent.id);
    if (questions) {
      questions.forEach(answers => {
        answers.forEach(ans => {
          if (ans.answerID === aID) {
            return true;
          }
        });
      });
    }
    return false;
  }

  /**
   * Server: Modify gold that agent has offered in trade
   * @param agent
   * @param amount
   */
  public changeOfferedGold(agent: Agent, amount: number) {
    if (!this._gold.has(agent.id)) {
      this._gold.set(agent.id, 0);
    }
    const gold = this._gold.get(agent.id);
    this._gold.set(agent.id, Math.max(0, gold + amount));
  }

  /**
   * Returns the amount of gold an agent has offered in the trade
   * @param agent
   */
  public getAgentsOfferedGold(agent: Agent): number {
    return this._gold.get(agent.id);
  }

  /**
   * Returns the items an agent has offered in the trade
   * @param agent
   */
  public getAgentsOfferedItems(agent: Agent): Item[] {
    if (!this._itemIDs.has(agent.id)) {
      return [];
    }
    return Item.getByIDs([...this._itemIDs.get(agent.id)]);
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
}
