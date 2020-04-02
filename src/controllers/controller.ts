import { logger, LOG } from "../utilities/logger";
import * as util from "../utilities/util";
import { SmartJSON } from "../utilities/util2";
import {
  IDObject,
  Agent,
  Conversation,
  Trade,
  Room,
  Item,
  Info,
  Quest,
  Faction
} from "../models/index";

export class Controller {
  private _updates: Map<Agent, Set<IDObject>>;
  public get updates(): Map<Agent, Set<IDObject>> {
    return this._updates;
  }

  constructor() {
    this._updates = new Map<Agent, Set<IDObject>>();
  }

  private updateChanges(agent: Agent, models: any[]) {
    let updates = new Set<IDObject>();
    if (this._updates.has(agent)) {
      updates = this._updates.get(agent);
    }
    for (const change of models) {
      if (!Array.isArray(change)) {
        this.addChange(updates, change);
      }
      // sometimes we will have arrays of changes in models
      else {
        for (const item of change) {
          this.addChange(updates, item);
        }
      }
    }
    this._updates.set(agent, updates);
  }

  /**
   * Makes sure that anything mentioned in an Info item is also sent
   * @param updates
   * @param change
   */
  public addChange(updates: Set<IDObject>, change: any) {
    updates.add(change);
    if (change instanceof Info) {
      const terms = change.getTerms();
      for (const term in terms) {
        if (terms[term] instanceof IDObject) {
          this.addChange(updates, terms[term]);
        }
      }
    } else if (change instanceof Agent) {
      // automatically give faction information of agents for now
      if (change.faction) {
        updates.add(change.faction);
      }
    } else if (change instanceof Item) {
      // automatically give item master references
      if (change.id !== change.master.id) {
        updates.add(change.master);
      }
    }
  }

  /**
   * sends update payload to all changed models
   * @param updates Map of updates to send to an agent
   */
  public sendUpdates() {
    for (const [agent, models] of this._updates) {
      const payload = {};
      for (const model of models) {
        const name = model.constructor.name;
        if (!payload[name]) {
          payload[name] = [];
        }
        if (name === Info.name) {
          const info: Info = model as Info;
          payload[name].push(info.serialize(agent, true));
          if (info.isReference()) {
            const master: Info = Info.getByID(info.infoID);
            payload[name].push(master.serialize(agent, true));
          }
        } else {
          payload[name].push(model.serialize(agent, true));
        }
      }
      // console.log(payload);
      if (agent.socket) {
        agent.socket.emit("updateModels", SmartJSON.stringify(payload));
      }
    }
  }

  /**
   * Add items to agent's inventory. Does validation.
   * @param {Object} agent - agent to give items to.
   * @param {[Object]} items - list of items to give to agent.
   */
  public addItemsToAgentInventory(agent: Agent, items: Item[]) {
    if (agent === undefined) {
      logger.log("Cannot give items to undefined agent", 0);
      return;
    }

    if (items === undefined || items.length === 0) {
      logger.log("Cannot give no items to agent", 0);
      return;
    }

    for (const item of items) {
      if (item.room !== undefined || item.agent !== undefined) {
        logger.log(
          "Cannot give item to agent: Agent, item not available " + item,
          0
        );
        return;
      }
    }

    const addedItems: Item[] = [];

    for (const item of items) {
      item.inTransaction = false;
      addedItems.push(item);
      if (item.type === "gold") {
        agent.modifyGold(item.quantity);
      } else {
        agent.addItemInventory(addedItems[addedItems.length - 1]);
        addedItems[addedItems.length - 1].giveToAgent(agent);
      }
    }

    this.updateChanges(agent, [addedItems, agent]);
  }

  /**
   * Add info to agent's knowledge. Does validation.
   * @param {Object} agent - agent to give items to.
   * @param {[Object]} info - list of info to give to agent.
   */
  public addInfoToAgentInventory(agent: Agent, info: Info[]) {
    if (agent === undefined) {
      logger.log("Cannot give info to undefined agent", 0);
      return;
    }

    if (info === undefined || info.length === 0) {
      logger.log("Cannot give no info to agent", 0);
      return;
    }

    const addedInfo: Info[] = [];

    for (const i of info) {
      addedInfo.push(i);

      agent.addInfoKnowledge(addedInfo[addedInfo.length - 1]);
      // addedInfo[addedInfo.length - 1].give_to_agent(agent);
    }

    this.updateChanges(agent, [addedInfo, agent]);
  }

  /**
   * Remove items from agent's inventory. Does validation.
   * @params {[Object]} items - list of items to remove from agent.
   */
  public removeItemsFromAgentInventory(items: Item[]) {
    if (items === undefined || items.length === 0) {
      logger.log("Cannot remove no items from agent", 1);
      return;
    }

    const agent: Agent = items[0].agent;

    for (const item of items) {
      if (item.agent !== agent) {
        logger.log(
          "Cannot remove items from agent inventory, not all items from same agent",
          0
        );
        return;
      }
    }

    const removedItems: Item[] = [];

    for (const item of items) {
      agent.removeItemInventory(item);
      item.takeFromAgent();
      removedItems.push(item);
    }

    this.updateChanges(agent, [removedItems, agent]);
  }

  /**
   * Move agent to room. Remove agent from old room, add to new room. Does validation.
   * @param {Object} agent - agent object.
   * @param {Object} newRoom - new room to move agent to.
   */
  public moveAgentToRoom(agent: Agent, newRoom: Room) {
    if (
      agent === undefined ||
      newRoom === undefined ||
      agent.room === undefined
    ) {
      logger.log("Cannot move agent to room", 0);
      return;
    }

    const oldRoom: Room = agent.room;

    if (!oldRoom.isConnectedTo(newRoom)) {
      logger.log(
        "Cannot move agent. " + oldRoom + " not adjacent to " + newRoom,
        0
      );
      return;
    }

    this.removeAgentFromRoom(agent);
    this.addAgentToRoom(agent, newRoom);

    const time = util.getPanoptykDatetime();
    const info = Info.ACTIONS.MOVE.create({
      time,
      agent,
      loc1: oldRoom,
      loc2: newRoom
    });
    info.owner = agent;

    this.giveInfoToAgents(
      oldRoom.getAgents().concat(newRoom.getAgents()),
      info
    );
  }

  /**
   * Fetches all agent data and adds it to room
   * @param agent
   */
  public login(agent: Agent) {
    this.updateChanges(agent, [
      agent.inventory,
      agent.knowledge,
      agent.activeAssignedQuests,
      agent.activeGivenQuests
    ]);
    if (agent.faction) {
      this.updateChanges(agent, [agent.faction]);
    }
    this.addAgentToRoom(agent, agent.room);
    // inform all agents of master copies of Item
    this.updateChanges(agent, Item.getMasterItems());
  }

  /**
   * Add agent to a room. Does validation.
   * @param {Object} agent - agent to add to room.
   * @param {Object} newRoom - room to move agent to.
   */
  public addAgentToRoom(agent: Agent, newRoom: Room) {
    if (newRoom === undefined || agent === undefined) {
      logger.log("Cannot add agent to room", 0, "controller.js");
      return;
    }

    agent.putInRoom(newRoom);
    newRoom.addAgent(agent);

    this.updateChanges(agent, [
      newRoom,
      agent,
      newRoom.getAdjacentRooms(),
      newRoom.getAgents(),
      newRoom.getItems(),
      newRoom.getConversations()
    ]);
    newRoom.occupants.forEach(occupant => {
      this.updateChanges(occupant, [newRoom, agent]);
    });

    for (const convo of newRoom.getConversations()) {
      // give time masked info of current conversations
      const convoInfo = convo.info;
      const mask = { time: "mask" };
      this.giveInfoToAgents([agent], convoInfo, mask);
    }

    for (const item of newRoom.getItems()) {
      const itemInfo = Info.ACTIONS.LOCATED_IN.create({
        time: util.getPanoptykDatetime(),
        item,
        loc: newRoom,
        quantity: 1
      });
      this.giveInfoToAgents([agent], itemInfo);
    }
  }

  /**
   * Remove agent from a room. Does validation.
   * @param {Object} agent - agent to remove from room.
   * @param {boolean} logout - lets agent remember room if true
   */
  public removeAgentFromRoom(agent: Agent, logout = false) {
    if (agent === undefined) {
      logger.log("Cannot remove undefined agent from room", 0);
      return;
    }

    const oldRoom = agent.room;

    if (oldRoom === undefined) {
      logger.log(
        "Cannot remove agent " + agent + " from room, agent is not in room.",
        0
      );
      return;
    }

    this.removeAgentFromConversationIfIn(agent);

    // end all incoming and outgoing requests
    this.removeAgentsConversationRequests(agent);
    this.removeAgentsTradeRequests(agent);

    if (logout) {
      agent.logout();
    } else {
      agent.removeFromRoom();
    }
    oldRoom.removeAgent(agent);
    this.updateChanges(agent, [agent, oldRoom]);
    oldRoom.occupants.forEach(occupant => {
      this.updateChanges(occupant, [oldRoom]);
    });
  }

  /**
   * Add items to a room. Does validation.
   * @param {Object} room - room to add items to.
   * @param {[items]} items - list of items to add to room.
   * @param {Object} byAgent - agent responsible for putting items in room. (Optional).
   */
  public addItemsToRoom(room: Room, items: Item[], byAgent: Agent = undefined) {
    if (room === undefined || items === undefined || items.length === 0) {
      logger.log("Cannot add items to room", 0);
      return;
    }

    for (const item of items) {
      if (item.room !== undefined || item.agent !== undefined) {
        logger.log(
          "Cannot add item " + item + " to room. Item not available,",
          0
        );
        return;
      }
    }

    for (const item of items) {
      room.addItem(item);
      item.putInRoom(room);
    }

    for (const occupant of room.occupants) {
      this.updateChanges(occupant, [room, items]);
    }
  }

  /**
   * Remove items from a room. Does validation.
   * @param {[Object]} items - list of items to remove from room.
   * @param {Object} byAgent - agent taking the items from room. (Optional).
   */
  public removeItemsFromRoom(items: Item[], byAgent: Agent = undefined) {
    if (items === undefined || items.length === 0) {
      logger.log("Cannot remove no items from agent", 0);
      return;
    }

    const room: Room = items[0].room;

    for (const item of items) {
      if (item.room !== room) {
        logger.log(
          "Cannot remove items from room, not all items from same room",
          0
        );
        return;
      }
    }

    for (const item of items) {
      room.removeItem(item);
      item.remove_from_room();
    }

    for (const occupant of room.occupants) {
      this.updateChanges(occupant, [room, items]);
    }
  }

  /**
   * Add an agent to a conversation. Does validation.
   * @param {Object} conversation - conversation agent wants to join.
   * @param {Object} agent - agent object
   */
  public addAgentToConversation(conversation: Conversation, agent: Agent) {
    this.removeAgentFromConversationIfIn(agent);

    logger.log(
      "Adding agent " + agent.agentName + " to conversation " + conversation.id,
      2
    );
    agent.joinConversation(conversation);
    conversation.add_agent(agent);

    this.updateChanges(agent, [conversation, agent]);
  }

  /**
   * Remove an agent from a conversation. Does validation.
   * @param {Object} conversation - conversation agent wants to leave.
   * @param {Object} agent - agent object
   */
  public removeAgentFromConversation(conversation: Conversation, agent: Agent) {
    logger.log(
      "Removing agent " + agent + " from conversation " + conversation.id,
      2
    );

    this.endAllTradesWithAgent(agent);

    agent.leaveConversation();
    conversation.remove_agent(agent);

    this.updateChanges(agent, [conversation, agent]);
    // let room members know agent is no longer conversing
    agent.room.occupants.forEach(occupant => {
      this.updateChanges(occupant, [agent]);
    });

    // no conversations of 1 or 0 people
    const agents: Agent[] = conversation.getAgents();
    if (agents.length === 1) {
      this.removeAgentFromConversation(conversation, agents[0]);
    } else if (agents.length === 0) {
      conversation.room.removeConversation(conversation);
    }
  }

  /**
   * Remove agent from their conversation if they are in one. Otherwise do nothing.
   * @param {Object} agent - agent object
   */
  public removeAgentFromConversationIfIn(agent: Agent) {
    if (agent.conversation !== undefined) {
      this.removeAgentFromConversation(agent.conversation, agent);
    }
  }

  /**
   * Cancel all trades containing an agent.
   * @param {Object} agent - agent object.
   */
  public endAllTradesWithAgent(agent: Agent) {
    for (const trade of Trade.getActiveTradesWithAgent(agent)) {
      this.cancelTrade(trade);
    }
  }

  /**
   * Create a trade and send request to appropriate agent.
   * 2param {Object} conversation - conversation object containing both agents.
   * @param {Object} fromAgent - agent object making request.
   * @param {Object} toAgent - agent object getting request.
   * @returns {Object} new trade object.
   */
  public createTrade(
    conversation: Conversation,
    fromAgent: Agent,
    toAgent: Agent
  ) {
    const trade = new Trade(fromAgent, toAgent, conversation);
    this.removeAgentsTradeRequests(fromAgent);
    this.removeAgentsTradeRequests(toAgent);
    this.updateChanges(toAgent, [trade]);
    this.updateChanges(fromAgent, [trade]);
    return trade;
  }

  /**
   * Cancel a trade, send updates to agents, and close out trade.
   * @param {Object} trade - trade object.
   */
  public cancelTrade(trade: Trade) {
    trade.agentIni.modifyGold(trade.initiatorGold);
    trade.agentRec.modifyGold(trade.receiverGold);
    trade.setStatus(0);
    for (const item of trade.itemsIni) {
      item.inTransaction = false;
    }
    for (const item of trade.itemsRec) {
      item.inTransaction = false;
    }
    this.updateChanges(trade.agentIni, [trade, trade.agentIni, trade.itemsIni]);
    this.updateChanges(trade.agentRec, [trade, trade.agentRec, trade.itemsRec]);
  }

  /**
   * Do the trade. Send updates to agents, move items, close out trade, and give observation
   *    info to all agents in room.
   * @param {Object} trade - trade object.
   */
  public performTrade(trade: Trade) {
    logger.log("Ending trade " + trade.id, 2);

    const generalInfo: Info[] = [];

    // item trades
    if (trade.itemsIni.length > 0) {
      this.removeItemsFromAgentInventory(trade.itemsIni);
      this.addItemsToAgentInventory(trade.agentRec, trade.itemsIni);
    }
    if (trade.itemsRec.length > 0) {
      this.removeItemsFromAgentInventory(trade.itemsRec);
      this.addItemsToAgentInventory(trade.agentIni, trade.itemsRec);
    }

    // gold trades
    if (trade.initiatorGold > 0) {
      trade.agentRec.modifyGold(trade.initiatorGold);
      const item: Item = new Item("gold", "gold", trade.initiatorGold); // fake item to represent gold bag
      generalInfo.push(
        Info.ACTIONS.GAVE.create({
          time: util.getPanoptykDatetime(),
          agent1: trade.agentIni,
          agent2: trade.agentRec,
          loc: trade.agentRec.room,
          item,
          quantity: trade.initiatorGold
        })
      );
    }
    if (trade.receiverGold > 0) {
      trade.agentIni.modifyGold(trade.receiverGold);
      const item: Item = new Item("gold", "gold", trade.receiverGold); // fake item to represent gold bag
      generalInfo.push(
        Info.ACTIONS.GAVE.create({
          time: util.getPanoptykDatetime(),
          agent1: trade.agentRec,
          agent2: trade.agentIni,
          loc: trade.agentRec.room,
          item,
          quantity: trade.receiverGold
        })
      );
    }

    // complete information trades
    for (const info of trade.infoAnsIni) {
      generalInfo.push(
        Info.ACTIONS.TOLD.create({
          time: util.getPanoptykDatetime(),
          agent1: trade.agentIni,
          agent2: trade.agentRec,
          loc: trade.agentIni.room,
          info
        })
      );
      this.giveInfoToAgents([trade.agentRec], info);
    }
    for (const info of trade.infoAnsRec) {
      generalInfo.push(
        Info.ACTIONS.TOLD.create({
          time: util.getPanoptykDatetime(),
          agent1: trade.agentRec,
          agent2: trade.agentIni,
          loc: trade.agentRec.room,
          info
        })
      );
      this.giveInfoToAgents([trade.agentIni], info);
    }

    trade.setStatus(1);

    this.updateChanges(trade.agentIni, [trade, trade.agentIni]);
    this.updateChanges(trade.agentRec, [trade, trade.agentRec]);

    // Info on items traded
    for (const item of trade.itemsIni) {
      generalInfo.push(
        Info.ACTIONS.GAVE.create({
          time: util.getPanoptykDatetime(),
          agent1: trade.agentIni,
          agent2: trade.agentRec,
          loc: trade.agentRec.room,
          item,
          quantity: 1
        })
      );
    }
    for (const item of trade.itemsRec) {
      generalInfo.push(
        Info.ACTIONS.GAVE.create({
          time: util.getPanoptykDatetime(),
          agent1: trade.agentRec,
          agent2: trade.agentIni,
          loc: trade.agentRec.room,
          item,
          quantity: 1
        })
      );
    }

    for (const info of generalInfo) {
      this.giveInfoToAgents(trade.conversation.room.getAgents(), info);
    }

    logger.log("Successfully completed trade " + trade, 2);
  }

  /**
   * Add items to a trade and send updates.
   * @param {Object} trade - trade object.
   * @param {[Object]} items - array of items to add.
   * @param {Object} ownerAgent - agent adding the items.
   */
  public addItemsToTrade(trade: Trade, items: Item[], ownerAgent: Agent) {
    logger.log("Adding items to trade " + trade + "...", 2);

    this.setTradeUnreadyIfReady(trade, trade.agentIni);
    this.setTradeUnreadyIfReady(trade, trade.agentRec);

    trade.addItems(items, ownerAgent);
    for (const item of items) {
      item.inTransaction = true;
    }

    this.updateChanges(trade.agentIni, [trade, items]);
    this.updateChanges(trade.agentRec, [trade, items]);

    logger.log("Successfully added items to trade " + trade, 2);
  }

  /**
   * Remove items from a trade and send updates.
   * @param {Object} trade - trade object.
   * @param {[Object]} items - array of items to remove.
   * @param {Object} ownerAgent - agent removing the items.
   */
  public removeItemsFromTrade(trade: Trade, items: Item[], ownerAgent: Agent) {
    logger.log("Removing items from trade " + trade.id + "...", 2);

    this.setTradeUnreadyIfReady(trade, trade.agentIni);
    this.setTradeUnreadyIfReady(trade, trade.agentRec);

    trade.removeItems(items, ownerAgent);
    for (const item of items) {
      item.inTransaction = false;
    }

    this.updateChanges(trade.agentIni, [trade, items]);
    this.updateChanges(trade.agentRec, [trade, items]);

    logger.log("Successfully removed items from trade " + trade.id, 2);
  }

  /**
   * Update agent trade ready status. If both agents are ready, trade will commence and end.
   * @param {Object} trade - trade object.
   * @param {Object} agent - agent object.
   * @param {boolean} rstatus - true if ready, false if not ready.
   */
  public setTradeAgentStatus(trade: Trade, agent: Agent, rstatus: boolean) {
    const endTrade = trade.setAgentReady(agent, rstatus);
    if (endTrade) {
      this.performTrade(trade);
    } else {
      this.updateChanges(trade.agentRec, [trade]);
      this.updateChanges(trade.agentIni, [trade]);
    }
  }

  /**
   * Will turn an agent ready status to false if it is true.
   * @param {Object} trade - trade object.
   * @param {Object} agent - agent object.
   */
  public setTradeUnreadyIfReady(trade: Trade, agent: Agent) {
    if (trade.agentIni === agent && trade.statusIni) {
      this.setTradeAgentStatus(trade, agent, false);
    } else if (trade.agentRec === agent && trade.statusRec) {
      this.setTradeAgentStatus(trade, agent, false);
    }
  }

  /**
   * DO NOT CALL, call giveInfoToAgents instead to ensure proper masking
   * Makes sure that an agent is given the proper info along with all embedded info
   * @param agent
   * @param info
   * @param time
   * @param mask complete mask, should include info's mask or bad things will happen
   */
  private giveInfoToAgentRec(
    agent: Agent,
    infoItem: Info,
    time: number,
    mask: object
  ): Info {
    const existingCopy = agent.getInfoRef(infoItem);
    if (existingCopy === undefined) {
      const cpy = infoItem.makeCopy(agent, time);
      cpy.setMask(mask);
      // give any embedded info if necessary
      const embeddedInfo: Info = infoItem.getTerms().info;
      if (embeddedInfo !== undefined) {
        const embeddedCpy = this.giveInfoToAgentRec(
          agent,
          embeddedInfo,
          time,
          embeddedInfo.mask
        );
        cpy.setReplacementInfo(embeddedCpy);
      }
      this.addInfoToAgentInventory(agent, [cpy]);
      return cpy;
    } else if (existingCopy.isMasked()) {
      // update mask if info would unmask more details
      existingCopy.simplifyMask(mask);
      this.updateChanges(agent, [existingCopy]);
    }
    return existingCopy;
  }

  /**
   * Give a piece of masked info to an array of agents.
   * @param {[Object]} agents - agents to give info to.
   * @param {Info} info - info Object.
   * @param {Object} mask - optional mask to apply to given Info
   */
  public giveInfoToAgents(agents: Agent[], info: Info, mask = {}) {
    const time = util.getPanoptykDatetime();
    if (info.isMasked()) {
      // merge given mask with info's current mask
      for (const key in info.mask) {
        if (!(key in mask)) {
          mask[key] = info.mask[key];
        }
      }
    }
    for (const agent of agents) {
      this.giveInfoToAgentRec(agent, info, time, mask);
    }
  }

  /**
   * Used to distribute a newly made masterInfo that has a mask to apply on the embedded info
   * @param agents
   * @param masterInfo
   * @param maskForEmb
   */
  private distributeMaskedEmbeddedInfo(
    agents: Agent[],
    masterInfo: Info,
    maskForEmb = {}
  ) {
    const time = util.getPanoptykDatetime();
    const embInfo: Info = Info.getByID(masterInfo.infoID);
    if (embInfo.isMasked()) {
      for (const key in embInfo.mask) {
        if (!(key in maskForEmb)) maskForEmb[key] = embInfo.mask[key];
      }
    }
    for (const agent of agents) {
      const embCpy = this.giveInfoToAgentRec(agent, embInfo, time, maskForEmb);
      const cpy = masterInfo.makeCopy(agent, time);
      cpy.setReplacementInfo(embCpy);
      this.addInfoToAgentInventory(agent, [cpy]);
    }
  }

  /**
   * Informs receiving agent of trade request.
   * @param agent sending agent
   * @param toAgent receiving agent
   */
  public requestTrade(agent: Agent, toAgent: Agent) {
    Agent.tradeRequest(toAgent, agent);
    this.updateChanges(toAgent, [toAgent]);
    this.updateChanges(agent, [agent]);
  }

  /**
   * Informs toAgent that agent has rejected its trade request.
   * @param agent
   * @param toAgent
   */
  public removeTradeRequest(agent: Agent, toAgent: Agent) {
    Agent.removeTradeRequest(toAgent, agent);
    this.updateChanges(toAgent, [toAgent]);
    this.updateChanges(agent, [agent]);
  }

  /**
   * Informs receiving agent of conversation request.
   * @param agent sending agent
   * @param toAgent receiving agent
   */
  public requestConversation(agent: Agent, toAgent: Agent) {
    Agent.conversationRequest(toAgent, agent);
    this.updateChanges(toAgent, [toAgent]);
    this.updateChanges(agent, [agent]);
  }

  /**
   * Informs toAgent that agent has rejected its conversation request.
   * @param agent
   * @param toAgent
   */
  public removeConversationRequest(agent: Agent, toAgent: Agent) {
    Agent.removeConversationRequest(toAgent, agent);
    this.updateChanges(toAgent, [toAgent]);
    this.updateChanges(agent, [agent]);
  }

  /**
   * Remove all incoming and outoging trade requests for an agent
   * @param agent
   */
  public removeAgentsTradeRequests(agent: Agent) {
    for (const other of agent.tradeRequested) {
      this.removeTradeRequest(other, agent);
    }
    for (const other of agent.tradeRequesters) {
      this.removeTradeRequest(agent, other);
    }
  }

  /**
   * Remove all incoming and outgoing trade requests for an agent
   * @param agent
   */
  public removeAgentsConversationRequests(agent: Agent) {
    for (const other of agent.conversationRequested) {
      this.removeConversationRequest(other, agent);
    }
    for (const other of agent.conversationRequesters) {
      this.removeConversationRequest(agent, other);
    }
  }

  /**
   * Creates a conversation between sending and receiving agent.
   * @param room current room
   * @param agent sending agent
   * @param toAgent receiving agent
   */
  public createConversation(room: Room, agent: Agent, toAgent: Agent) {
    const conversation = new Conversation(room);
    conversation.add_agent(agent);
    conversation.add_agent(toAgent);

    this.addAgentToConversation(conversation, agent);
    this.addAgentToConversation(conversation, toAgent);
    this.removeAgentsConversationRequests(agent);
    this.removeAgentsConversationRequests(toAgent);

    const time = util.getPanoptykDatetime();
    const info = Info.ACTIONS.CONVERSE.create({
      time,
      agent1: agent,
      agent2: toAgent,
      loc: room
    });
    this.giveInfoToAgents(room.getAgents(), info);
    conversation.info = info;

    return conversation;
  }

  /**
   * Sending agent picks up items from their current room
   * @param agent sending agent
   * @param items items to pick up
   */
  public pickUpItems(agent: Agent, items: Item[]) {
    this.removeAgentFromConversationIfIn(agent);
    this.removeItemsFromRoom(items, agent);
    this.addItemsToAgentInventory(agent, items);

    // inform other users agent has taken items
    const time = util.getPanoptykDatetime();
    for (const item of items) {
      const info = Info.ACTIONS.PICKUP.create({
        time,
        agent,
        item,
        loc: agent.room,
        quantity: 1
      });
      info.owner = agent;
      this.giveInfoToAgents(agent.room.getAgents(), info);
    }
  }

  /**
   * Sending agent drops items into their current room
   * @param agent sending agent
   * @param items items
   */
  public dropItems(agent: Agent, items: Item[]) {
    const room = agent.room;
    this.removeItemsFromAgentInventory(items);
    this.addItemsToRoom(room, items, agent);

    // inform other users agent has taken items
    const time = util.getPanoptykDatetime();
    for (const item of items) {
      const info = Info.ACTIONS.DROP.create({
        time,
        agent,
        item,
        loc: agent.room,
        quantity: 1
      });
      info.owner = agent;
      this.giveInfoToAgents(agent.room.getAgents(), info);
    }
  }

  /**
   * Sending agent asks question to their current conversation
   * @param agent sending agent
   * @param predicate valid Info question data
   */
  public askQuestion(agent: Agent, predicate: any, desiredInfo: string[], questionID?: number) {
    let question: Info = Info.getByID(questionID);
    if (!question) {
      question = predicate.action ? Info.ACTIONS[predicate.action].create(
        predicate,
        "question"
      ) : Info.PREDICATE[predicate.predicate].create(
        predicate,
        "question"
      );
    } else {
      question = question.isReference() ? Info.getByID(question.infoID) : question;
    }

    const conversation: Conversation = agent.conversation;
    conversation.logQuestion(question, desiredInfo);
    const relevantAgents = conversation.getAgents();
    for (const other of conversation.getAgents(agent)) {
      this.giveInfoToAgents(
        relevantAgents,
        Info.ACTIONS.ASK.create({
          time: util.getPanoptykDatetime(),
          agent1: agent,
          agent2: other,
          loc: conversation.room,
          info: question
        })
      );
      this.updateChanges(other, [conversation]);
    }
    this.updateChanges(agent, [conversation]);
    this.giveInfoToAgents(relevantAgents, question);
  }

  /**
   * Agent passes on specified question in conversation
   */
  public passOnQuestion(
    agent: Agent,
    question: Info,
    conversation: Conversation
  ) {
    conversation.passOnQuestion(question, agent);
    for (const member of conversation.getAgents()) {
      this.updateChanges(member, [conversation]);
    }
  }

  /**
   * Adds answer to given question to specified trade.
   * @param trade Relevant trade
   * @param answer Info answer to given question
   * @param question Info question
   * @param owner sending agent
   */
  public addAnswerToTrade(
    trade: Trade,
    answer: Info,
    question: Info,
    owner: Agent,
    maskedInfo: string[]
  ) {
    this.setTradeUnreadyIfReady(trade, trade.agentIni);
    this.setTradeUnreadyIfReady(trade, trade.agentRec);
    // update mask with fields that are already masked by answer
    const compare = new Set(maskedInfo);
    for (const key in answer.getTerms()) {
      if (answer.mask[key] === "mask" && !compare.has(key)) {
        maskedInfo.push(key);
      }
    }
    trade.addInfo(question, answer, owner, maskedInfo);

    this.updateChanges(trade.agentIni, [trade]);
    this.updateChanges(trade.agentRec, [trade]);
  }

  /**
   * Removes specieifed Info answer from the specified trade
   * @param trade Relevant trade
   * @param info Info answer in trade
   * @param owner sending agent
   */
  public removeInfoFromTrade(trade: Trade, info: Info, owner: Agent) {
    this.setTradeUnreadyIfReady(trade, trade.agentIni);
    this.setTradeUnreadyIfReady(trade, trade.agentRec);

    trade.removeInfo([info], owner);

    this.updateChanges(trade.agentIni, [trade]);
    this.updateChanges(trade.agentRec, [trade]);
  }

  /**
   * Sending agent gives out Info item in their current conversation
   * @param agent Sending agent
   * @param info Free info
   */
  public tellInfoFreely(agent: Agent, info: Info, maskedInfo: string[]) {
    const agents = agent.conversation.getAgents();
    // apply mask if given
    const mask = {};
    for (const val of maskedInfo) {
      mask[val] = "mask";
    }
    for (const other of agents) {
      if (other !== agent) {
        const knowInfo = Info.ACTIONS.TOLD.create({
          time: util.getPanoptykDatetime(),
          agent1: agent,
          agent2: other,
          loc: agent.room,
          info
        });
        this.giveInfoToAgents([other], info, mask);
        this.distributeMaskedEmbeddedInfo(agents, knowInfo, mask);
      }
    }
  }

  /**
   * Sending agent gives quest to other agent
   * @param agent
   * @param toAgent
   * @param predicate valid predicate to construct info
   */
  public sendQuest(
    agent: Agent,
    toAgent: Agent,
    task: any,
    item: Item,
    type: string,
    amount: number,
    deadline: number
  ) {
    let quest: Quest = undefined;
    const relevantAgents = agent.conversation.getAgents();
    if (type === "item") {
      quest = new Quest(
        toAgent,
        agent,
        undefined,
        item,
        type,
        amount,
        deadline
      );
    } else {
      const query: Info = task.action
        ? Info.ACTIONS[task.action].create(task, type)
        : Info.PREDICATE[task.predicate].create(task, type);
      quest = new Quest(
        toAgent,
        agent,
        query,
        undefined,
        type,
        amount,
        deadline
      );
      this.giveInfoToAgents(relevantAgents, query);
    }
    const questInfo: Info = Info.ACTIONS.QUEST.create({
      time: util.getPanoptykDatetime(),
      agent1: agent,
      agent2: toAgent,
      loc: agent.room,
      quest
    });
    Agent.addQuest(quest);
    this.updateChanges(toAgent, [toAgent, quest]);
    this.updateChanges(agent, [agent, quest]);
    this.giveInfoToAgents(relevantAgents, questInfo);
    return quest;
  }

  /**
   * Removes quest from active list and generates appropiate updates
   * @param quest
   * @param closeType FAILED or COMPLETE
   */
  public closeQuest(agent: Agent, quest: Quest, closeType: string) {
    let closeInfo: Info;
    if (closeType === "COMPLETE") {
      closeInfo = Info.ACTIONS.QUEST_COMPLETE.create({
        time: util.getPanoptykDatetime(),
        agent1: quest.giver,
        agent2: quest.receiver,
        loc: agent.room,
        quest
      });
      quest.receiver.faction.addAgentExp(quest.receiver, quest.rewardXP);
    } else if (closeType === "FAILED") {
      closeInfo = Info.ACTIONS.QUEST_FAILED.create({
        time: util.getPanoptykDatetime(),
        agent1: quest.giver,
        agent2: quest.receiver,
        loc: agent.room,
        quest
      });
    }
    Agent.removeQuest(quest);
    quest.setStatus(closeType);
    this.updateChanges(quest.giver, [quest.giver, quest]);
    this.updateChanges(quest.receiver, [quest.receiver, quest]);
    const relevantAgents = agent.conversation.getAgents();
    this.giveInfoToAgents(relevantAgents, closeInfo);
  }

  /**
   * Turn-in a verified info for given quest
   * @param quest
   * @param info
   */
  public turnInQuestInfo(agent: Agent, quest: Quest, info: Info) {
    this.tellInfoFreely(agent, info, []);
    quest.turnInInfo(info);
    this.updateChanges(quest.giver, [quest]);
    this.updateChanges(quest.receiver, [quest]);
  }

  /**
   * Turn-in a verified item for given quest
   * @param quest
   * @param info
   */
  public turnInQuestItem(agent: Agent, quest: Quest, item: Item) {
    quest.turnInItem(item);
    quest.receiver.removeItemInventory(item);
    quest.giver.addItemInventory(item);
    item.giveToAgent(quest.giver);
    this.updateChanges(quest.giver, [quest, quest.giver]);
    this.updateChanges(quest.receiver, [quest, quest.receiver]);
  }

  /**
   * Agent requests an item within a trade
   * @param agent
   * @param trade
   * @param item
   */
  public requestItemTrade(agent: Agent, trade: Trade, item: Item) {
    trade.addRequestedItem(agent, item);
    this.updateChanges(trade.agentIni, [trade, item]);
    this.updateChanges(trade.agentRec, [trade, item]);
  }

  /**
   * Agent requests an answer to question within a trade
   * @param agent
   * @param trade
   * @param question
   */
  public requestInfoTrade(agent: Agent, trade: Trade, question: Info) {
    trade.addRequestedAnswer(agent, question);
    this.giveInfoToAgents(trade.getAgents(), question);
    this.updateChanges(trade.agentIni, [trade, question]);
    this.updateChanges(trade.agentRec, [trade, question]);
  }

  /**
   * Agent passes on item request in current trade
   * @param agent
   * @param trade
   * @param item
   */
  public passOnItemRequest(agent: Agent, trade: Trade, item: Item) {
    trade.passOnRequestedItem(agent, item);
    this.updateChanges(trade.agentIni, [trade]);
    this.updateChanges(trade.agentRec, [trade]);
  }

  /**
   * Agent passes on item request in current trade
   * @param agent
   * @param trade
   * @param question
   */
  public passOnInfoRequest(agent: Agent, trade: Trade, question: Info) {
    trade.passOnRequestedQuestion(agent, question);
    this.updateChanges(trade.agentIni, [trade]);
    this.updateChanges(trade.agentRec, [trade]);
  }

  /**
   * WIP function to change an agent's faction/rank
   * @param targetAgent
   * @param faction
   * @param rank
   */
  public modifyAgentFaction(
    targetAgent: Agent,
    faction: Faction,
    rank: number
  ) {
    // faction.setAgentRank(targetAgent, rank);
    targetAgent.faction = faction;
    this.updateChanges(targetAgent, [targetAgent, targetAgent.faction]);
  }

  /**
   * Modifies amount of gold offered by agent in trade (can be negative)
   * @param agent
   * @param trade
   * @param amount
   */
  public modifyGoldTrade(agent: Agent, trade: Trade, amount: number) {
    agent.modifyGold(-1 * amount);
    trade.changeOfferedGold(agent, amount);
    this.updateChanges(trade.agentIni, [trade, trade.agentIni]);
    this.updateChanges(trade.agentRec, [trade, trade.agentIni]);
  }

  /**
   * Agent drops amount of gold into current room
   * @param agent
   * @param amount
   */
  public dropGold(agent: Agent, amount: number) {
    const room: Room = agent.room;
    agent.modifyGold(-1 * amount);

    const item: Item = new Item("gold", "gold", amount);
    this.addItemsToRoom(room, [item], agent);
    const time = util.getPanoptykDatetime();
    const info = Info.ACTIONS.DROP.create({
      time,
      agent,
      item,
      loc: agent.room,
      quantity: amount
    });
    info.owner = agent;
    this.giveInfoToAgents(agent.room.getAgents(), info);
  }

  /**
   * Very basic steal item action that should be upgraded for better gameplay
   * @param agent
   * @param targetAgent
   * @param item
   */
  public stealItem(agent: Agent, targetAgent: Agent, item: Item) {
    this.removeItemsFromAgentInventory([item]);
    this.addItemsToAgentInventory(agent, [item]);
    item.addItemTag("stolen");
    const info = Info.ACTIONS.STOLE.create({
      agent1: agent,
      agent2: targetAgent,
      item,
      quantity: 1,
      loc: agent.room,
      time: util.getPanoptykDatetime()
    });
    this.giveInfoToAgents([agent, targetAgent], info);
  }

  /**
   * Confiscate action for police factions to take illegal or stolen item
   * @param agent
   * @param targetAgent
   * @param item
   */
  public confiscateItem(agent: Agent, targetAgent: Agent, item: Item) {
    this.removeItemsFromAgentInventory([item]);
    this.addItemsToAgentInventory(agent, [item]);
    item.removeItemTag("stolen");
    const info = Info.ACTIONS.CONFISCATED.create({
      agent1: agent,
      agent2: targetAgent,
      item,
      quantity: 1,
      loc: agent.room,
      time: util.getPanoptykDatetime()
    });
    this.giveInfoToAgents([agent, targetAgent], info);
  }

  /**
   * Teller informs other agents in its conversation that it owns specified items
   * @param teller
   * @param items
   */
  public tellItemOwnership(teller: Agent, items: Item[]) {
    for (const item of items) {
      const time = util.getPanoptykDatetime();
      const itemInfo = Info.ACTIONS.POSSESS.create({
        time,
        agent: teller,
        item,
        loc: teller.room,
        quantity: 1
      });
      this.giveInfoToAgents([teller], itemInfo);
      for (const other of teller.conversation.getAgents(teller)) {
        this.giveInfoToAgents([other], itemInfo);
        const toldInfo = Info.ACTIONS.TOLD.create({
          time,
          agent1: teller,
          agent2: other,
          loc: teller.room,
          info: itemInfo
        });
        this.giveInfoToAgents([teller, other], toldInfo);
      }
    }
  }
}
