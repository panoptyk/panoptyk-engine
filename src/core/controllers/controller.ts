import { logger, LOG } from "../utilities/logger";
import * as util from "../utilities/util";
import { IDObject, Agent, Trade, Room, Item, Info } from "../models/index";
import { Conversation } from "../models/conversation";


export class Controller {

  private _updates: Map<Agent, Set<IDObject>>;
  public get updates(): Map<Agent, Set<IDObject>> {
    return this._updates;
  }

  constructor() {
    this._updates = new Map<Agent, Set<IDObject>>();
  }


  private updateChanges(agent: Agent, models: IDObject[]) {
    let updates = new Set<IDObject>();
    if (this._updates.has(agent)) {
      updates = this._updates.get(agent);
    }
    // typescript does not have great set support
    for (const change of models) {
      updates.add(change);
    }
    this._updates.set(agent, updates);
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
      if (item.room !== undefined || (item.agent !== undefined)) {
        logger.log("Cannot give item to agent: Agent, item not available " + item.itemName, 0);
        return;
      }
    }

    const addedItems: Item[] = [];

    for (const item of items) {
      addedItems.push(item);

      agent.addItemInventory(addedItems[addedItems.length - 1]);
      addedItems[addedItems.length - 1].giveToAgent(agent);
    }

    this.updateChanges(agent, addedItems);
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

    this.updateChanges(agent, addedInfo);
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
        logger.log("Cannot remove items from agent inventory, not all items from same agent", 0);
        return;
      }
    }

    const removedItems: Item[] = [];

    for (const item of items) {
      item.agent.removeItemInventory(item);
      item.takeFromAgent();
      removedItems.push(item);
    }

    this.updateChanges(agent, removedItems);
  }


  /**
   * Move agent to room. Remove agent from old room, add to new room. Does validation.
   * @param {Object} agent - agent object.
   * @param {Object} newRoom - new room to move agent to.
   */
  public moveAgentToRoom(agent: Agent, newRoom: Room) {
    if (agent === undefined || newRoom === undefined || agent.room === undefined) {
      logger.log("Cannot move agent to room", 0);
      return;
    }

    const oldRoom: Room = agent.room;

    if (!oldRoom.isConnectedTo(newRoom)) {
      logger.log("Cannot move agent. " + oldRoom.roomName + " not adjacent to " + newRoom.roomName, 0);
      return;
    }

    this.removeAgentFromRoom(agent, newRoom);
    this.addAgentToRoom(agent, newRoom, oldRoom);
  }


  /**
   * Add agent to a room. Does validation.
   * @param {Object} agent - agent to add to room.
   * @param {Object} newRoom - room to move agent to.
   * @param {Object} oldRoom - room agent is coming from. (Optional).
   */
  public addAgentToRoom(agent: Agent, newRoom: Room, oldRoom: Room = undefined) {
    if (newRoom === undefined || agent === undefined) {
      logger.log("Cannot add agent to room", 0, "controller.js");
      return;
    }

    agent.putInRoom(newRoom);
    newRoom.addAgent(agent);

    agent.socket.join(newRoom.id);

    this.updateChanges(agent, [newRoom, oldRoom]);

    const time = util.getPanoptykDatetime();
    const info = Info.ACTION.ENTER.create(agent, {0: time, 1: agent.id, 2: newRoom.id});

    this.giveInfoToAgents(newRoom.occupants, info);
  }


  /**
   * Remove agent from a room. Does validation.
   * @param {Object} agent - agent to remove from room.
   * @param {Object} newRoom - room agent is moving to. (Optional).
   */
  public removeAgentFromRoom(agent: Agent, newRoom: Room = undefined, updateAgentModel= true) {
    if (agent === undefined) {
      logger.log("Cannot remove undefined agent from room", 0);
      return;
    }

    const oldRoom = agent.room;

    if (oldRoom === undefined) {
      logger.log("Cannot remove agent " + agent.agentName + " from room, agent is not in room.", 0);
      return;
    }

    this.removeAgentFromConversationIfIn(agent);

    agent.socket.leave(oldRoom.id);

    this.updateChanges(agent, [newRoom]);

    if (updateAgentModel) {
      agent.removeFromRoom();
    }

    const time = util.getPanoptykDatetime();
    const info = Info.ACTION.DEPART.create(agent, {0: time, 1: agent.id, 2: oldRoom.id});

    this.giveInfoToAgents(oldRoom.occupants, info);

    oldRoom.removeAgent(agent);
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
        logger.log("Cannot add item " + item.id  + " to room. Item not available,", 0);
        return;
      }
    }

    for (const item of items) {
      room.addItem(item);
      item.putInRoom(room);
    }

    this.updateChanges(byAgent, items);
    this.updateChanges(byAgent, [room]);
  }


  /**
   * Remove items from a room. Does validation.
   * @param {[Object]} items - list of items to remove from room.
   * @param {Object} byAgent - agent taking the items from room. (Optional).
   */
  public removeItemsFromRoom(items, byAgent= undefined) {
    if (items === undefined || items.length === 0) {
      logger.log("Cannot remove no items from agent", 0);
      return;
    }

    const room = items[0].room;

    for (const item of items) {
      if (item.room !== room) {
        logger.log("Cannot remove items from room, not all items from same room", 0);
        return;
      }
    }

    for (const item of items) {
      room.remove_item(item);
      item.remove_from_room();
    }

    // TODO: server.send.remove_items_room(items, room, byAgent);
  }


  /**
   * Add an agent to a conversation. Does validation.
   * @param {Object} conversation - conversation agent wants to join.
   * @param {Object} agent - agent object
   */
  public addAgentToConversation(conversation, agent) {
    this.removeAgentFromConversationIfIn(agent);

    logger.log("Adding agent " + agent.agentName + " to conversation " + conversation.conversation_id, 2);
    agent.join_conversation(conversation);
    conversation.add_agent(agent);

    // TODO: server.send.agent_join_conversation(agent);
  }


  /**
   * Remove an agent from a conversation. Does validation.
   * @param {Object} conversation - conversation agent wants to leave.
   * @param {Object} agent - agent object
   */
  public removeAgentFromConversation(conversation, agent) {
    logger.log("Removing agent " + agent.agentName + " from conversation " + conversation.conversation_id, 2);

    this.endAllTradesWithAgent(agent);

    agent.leave_conversation();
    conversation.remove_agent(agent);

    // TODO: server.send.agent_leave_conversation(agent: Agent, conversation);

    if (conversation.agents.length === 0) {
      conversation.room.remove_conversation(conversation);
    }
  }


  /**
   * Remove agent from their conversation if they are in one. Otherwise do nothing.
   * @param {Object} agent - agent object
   */
  public removeAgentFromConversationIfIn(agent) {
    if (agent.conversation !== undefined) {
      this.removeAgentFromConversation(agent.conversation, agent);
    }
  }


  /**
   * Cancel all trades containing an agent.
   * @param {Object} agent - agent object.
   */
  public endAllTradesWithAgent(agent) {
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
  public createTrade(conversation, fromAgent, toAgent) {
    const trade = new Trade(fromAgent, toAgent, conversation);

    // TODO: server.send.trade_requested(toAgent.socket, trade);

    return trade;
  }


  /**
   * Accept a trade and send updates to both agents.
   * Trade is now ready to accept items.
   * @param {Object} trade - trade object.
   */
  public acceptTrade(trade) {
    // TODO: server.send.trade_accepted(trade.agent_ini.socket, trade, trade.agent_res);
    // TODO: server.send.trade_accepted(trade.agent_res.socket, trade, trade.agent_ini);
    trade.set_status(2);
  }


  /**
   * Cancel a trade, send updates to agents, and close out trade.
   * @param {Object} trade - trade object.
   */
  public cancelTrade(trade) {
    // TODO: server.send.trade_declined(trade.agent_ini.socket, trade);
    // TODO: server.send.trade_declined(trade.agent_res.socket, trade);
    trade.set_status(0);
    trade.cleanup();
  }


  /**
   * Do the trade. Send updates to agents, move items, close out trade, and give observation
   *    info to all agents in room.
   * @param {Object} trade - trade object.
   */
  public performTrade(trade) {
    logger.log("Ending trade " + trade.trade_id, 2);

    // TODO: server.send.trade_complete(trade.agent_ini.socket, trade);
    // TODO: server.send.trade_complete(trade.agent_res.socket, trade);

    this.removeItemsFromAgentInventory(trade.items_ini);
    this.removeItemsFromAgentInventory(trade.items_res);

    this.addItemsToAgentInventory(trade.agent_ini, trade.items_res);
    this.addItemsToAgentInventory(trade.agent_res, trade.items_ini);

    trade.set_status(1);
    trade.cleanup();

    // Info object prep
    const itemsIniStr = [];
    const itemsResStr = [];

    for (const item of trade.items_ini) {
      itemsIniStr.push(item.name);
    }
    for (const item of trade.items_res) {
      itemsResStr.push(item.name);
    }

    const time = util.getPanoptykDatetime();
    // TODO: var info = Info.ACTION.CONVERSE.create(agent: Agent, {0: time, 1: trade.agent_ini.agent_id, 2: trade.agent_ini.agent_id, 3: trade.conversation.room.room_id});

    // TODO: this.giveInfoToAgents(trade.conversation.room.occupants, info);

    logger.log("Successfully completed trade " + trade.trade_id, 2);
  }


  /**
   * Add items to a trade and send updates.
   * @param {Object} trade - trade object.
   * @param {[Object]} items - array of items to add.
   * @param {Object} ownerAgent - agent adding the items.
   */
  public addItemsToTrade(trade, items, ownerAgent) {
    logger.log("Adding items to trade " + trade.trade_id  + "...", 2);

    this.setTradeUnreadyIfReady(trade, trade.agent_ini);
    this.setTradeUnreadyIfReady(trade, trade.agent_res);

    trade.add_items(items, ownerAgent);

    // TODO: server.send.add_items_trade(trade.agent_ini.socket, trade, items, ownerAgent);
    // TODO: server.send.add_items_trade(trade.agent_res.socket, trade, items, ownerAgent);

    logger.log("Successfully added items to trade " + trade.trade_id, 2);
  }


  /**
   * Remove items from a trade and send updates.
   * @param {Object} trade - trade object.
   * @param {[Object]} items - array of items to remove.
   * @param {Object} ownerAgent - agent removing the items.
   */
  public removeItemsFromTrade(trade, items, ownerAgent) {
    logger.log("Removing items from trade " + trade.trade_id  + "...", 2);

    this.setTradeUnreadyIfReady(trade, trade.agent_ini);
    this.setTradeUnreadyIfReady(trade, trade.agent_res);

    trade.remove_items(items, ownerAgent);

    // TODO: server.send.remove_items_trade(trade.agent_ini.socket, trade, items, ownerAgent);
    // TODO: server.send.remove_items_trade(trade.agent_res.socket, trade, items, ownerAgent);

    logger.log("Successfully removed items from trade " + trade.trade_id, 2);
  }


  /**
   * Update agent trade ready status. If both agents are ready, trade will commence and end.
   * @param {Object} trade - trade object.
   * @param {Object} agent - agent object.
   * @param {boolean} rstatus - true if ready, false if not ready.
   */
  public setTradeAgentStatus(trade, agent: Agent, rstatus) {
    const endTrade = trade.set_agent_ready(agent, rstatus);

    // TODO: server.send.agent_ready_trade(
    //  agent === trade.agent_ini ? trade.agent_ini.socket : trade.agent_res.socket,
    //  trade, agent: Agent, rstatus);

    if (endTrade) {
      this.performTrade(trade);
    }
  }


  /**
   * Will turn an agent ready status to false if it is true.
   * @param {Object} trade - trade object.
   * @param {Object} agent - agent object.
   */
  public setTradeUnreadyIfReady(trade, agent) {
    if (trade.agent_ini === agent && trade.status_ini) {
      this.setTradeAgentStatus(trade, agent, false);
    }
    else if (trade.agent_res === agent && trade.status_res) {
      this.setTradeAgentStatus(trade, agent, false);
    }
  }

  /**
   * Give a piece of info to an array of agents.
   * @param {[Object]} agents - agents to give info to.
   * @param {string} info - info string.
   */
  public giveInfoToAgents(agents, info) {

    const time = util.getPanoptykDatetime();

    for (const agent of agents) {
      const cpy = info.make_copy(agent, time);
      this.addInfoToAgentInventory(agent, [cpy]);
    }
  }


  public requestConversation(agent: Agent, toAgent) {
    toAgent.conversation_requests[agent.id] = agent.id;
    // TODO: server.send.conversation_requested(agent: Agent, toAgent);
  }


  public createConversation(room, agent: Agent, toAgent) {
    const conversation = new Conversation(room);
    conversation.add_agent(agent);
    conversation.add_agent(toAgent);

    this.addAgentToConversation(conversation, agent);
    this.addAgentToConversation(conversation, toAgent);
    return conversation;
  }

}
