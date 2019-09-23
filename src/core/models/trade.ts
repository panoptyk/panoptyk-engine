import { logger, LOG } from "../utilities/logger";
import { Item } from "./item";
import { IDObject } from "./idObject";
import { Conversation } from "./conversation";
import { Agent } from "./agent";

export class Trade extends IDObject {
  private static actives: Set<Trade> = new Set();
  public static result = {
    FAILED: 0,
    SUCCESS: 1,
    IN_PROGRESS: 2,
    REQUESTED: 3
  };

  private initiatorID: number;
  private receiverID: number;
  private conversationID: number;
  private _resultStatus: number;
  public get resultStatus(): number {
    return this._resultStatus;
  }
  private initiatorItemIDs: number[];
  private receiverItemIDs: number[];
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
    id?,
    resultStatus = Trade.result.REQUESTED
  ) {
    super(Trade.name, id);
    this.initiatorID = initiator ? initiator.id : undefined;
    this.receiverID = receiver ? receiver.id : undefined;
    this.conversationID = conversation ? conversation.id : undefined;
    this._resultStatus = resultStatus;

    this.initiatorItemIDs = [];
    this.receiverItemIDs = [];

    this.initiatorStatus = false;
    this.receiverStatus = false;

    if (this.resultStatus === 3) {
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
    const t = new Item(undefined, undefined, undefined);
    for (const key in json) {
      t[key] = json[key];
    }
    return t;
  }

  /**
   * Get item data for an agent in the trade.
   * @param {Object} agent - agent object.
   * @returns [Object] list of item data dictionaries.
   */
  getAgentItemsData(agent) {
    const data = [];

    if (agent === this.initiatorID || agent === this.receiverID) {
      for (const item of agent === this.initiatorID
        ? this.initiatorItemIDs
        : this.receiverItemIDs) {
        data.push(Item[item].getData());
      }
    } else {
      logger.log("No matching agent for trade item data.", 0, "trade.js");
    }

    return data;
  }

  /**
   * Get 'ready-to-send' data to send to client.
   * @returns {Object}
   */
  getData() {
    return {
      id: this.id,
      agent_ini_id: this.initiatorID,
      agent_res_id: this.receiverID,
      items_ini: this.initiatorItemIDs,
      items_res: this.receiverItemIDs,
      conversation_id: this.conversationID,
      resultStatus: this.resultStatus
    };
  }

  /**
   * Set status of trade.
   * 0=failed, 1=success, 2=in progress, 3=requested
   * @param {number} stat - status to set.
   */
  setStatus(stat) {
    this._resultStatus = stat;
  }

  /**
   * Set an agent's ready status.
   * @param {Agent} agent - agent to set status for.
   * @param {boolean} rstatus - status. True = ready, false = not ready.
   */
  setAgentReady(agent: Agent, rstatus) {
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
  addItems(items, owner: Agent) {
    if (owner.id === this.initiatorID) {
      this.initiatorItemIDs.push(...items);
    } else if (owner.id === this.receiverID) {
      this.receiverItemIDs.push(...items);
    } else {
      logger.log("Agent not in trade", 0, "trade.js");
      return;
    }

    for (const item of items) {
      item.in_transaction = true;
    }
  }

  /**
   * Remove items from one side of the trade.
   * @param {[Object]} items - items to remove from trade.
   * @param {Object} owner - agent object of agent removing the items.
   */
  removeItems(items: Item[], owner: Agent) {
    const itemIDs = [];
    for (const item of items) {
      itemIDs.push(item.id);
    }
    if (owner.id === this.initiatorID) {
      this.initiatorItemIDs = this.initiatorItemIDs.filter(function(x) {
        return itemIDs.indexOf(x) < 0;
      });
    } else if (owner.id === this.receiverID) {
      this.receiverItemIDs = this.receiverItemIDs.filter(function(x) {
        return itemIDs.indexOf(x) < 0;
      });
    } else {
      logger.log("Agent not in trade", 0, "trade.js");
      return;
    }

    for (const item of items) {
      item.inTransaction = false;
    }
  }

  /**
   * Call when trade is over, nomatter if it was successful or not.
   * Unlocks all the items in the trade and removes it from the active trade list.
   */
  cleanup() {
    let unlocked = "";

    for (const item of this.initiatorItemIDs) {
      Item[item].in_transaction = false;
      unlocked += Item[item].item_id + " ";
    }

    for (const item of this.receiverItemIDs) {
      Item[item].in_transaction = false;
      unlocked += Item[item].item_id + " ";
    }

    Trade.actives.delete(this);

    logger.log("Unlocked trade " + this.id + " items [ " + unlocked + "]", 2);
  }

  /**
   * Get all the trade objects with this agent.
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

  get agentIni(): Agent {
    return Agent.getByID(this.initiatorID);
  }

  get agentRec(): Agent {
    return Agent.getByID(this.receiverID);
  }

  get itemsIni(): Item[] {
    return Item.getByIDs(this.initiatorItemIDs);
  }

  get itemsRec(): Item[] {
    return Item.getByIDs(this.receiverItemIDs);
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
