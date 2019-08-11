import { logger, LOG } from "../utilities/logger";
import * as util from "../utilities/util";
import { Room } from "../models/room";
import { Info } from "../models/information";
import { Trade } from "../models/trade";
import { Conversation } from "../models/conversation";


export class Controller {

/**
 * Add items to agent's inventory. Does validation.
 * @param {Object} agent - agent to give items to.
 * @param {[Object]} items - list of items to give to agent.
 */
public static addItemsToAgentInventory(agent, items) {

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
      logger.log("Cannot give item to agent, item not available " + item.name, 0);
      return;
    }
  }

  const addedItems = [];

  for (const item of items) {
    addedItems.push(item);

    agent.add_item_inventory(addedItems[addedItems.length - 1]);
    addedItems[addedItems.length - 1].give_to_agent(agent);
  }

  //// TODO: server.send.add_items_inventory(agent, addedItems);
}

/**
 * Add info to agent's knowledge. Does validation.
 * @param {Object} agent - agent to give items to.
 * @param {[Object]} info - list of info to give to agent.
 */
public static addInfoToAgentInventory(agent, info) {

  if (agent === undefined) {
    logger.log("Cannot give info to undefined agent", 0);
    return;
  }

  if (info === undefined || info.length === 0) {
    logger.log("Cannot give no info to agent", 0);
    return;
  }

  const addedInfo = [];

  for (const i of info) {
    addedInfo.push(i);

    agent.add_info_knowledge(addedInfo[addedInfo.length - 1]);
    addedInfo[addedInfo.length - 1].give_to_agent(agent);
  }

  // TODO: server.send.add_info_inventory(agent, addedInfo);
}


/**
 * Remove items from agent's inventory. Does validation.
 * @params {[Object]} items - list of items to remove from agent.
 */
public static removeItemsFromAgentInventory(items) {
  if (items === undefined || items.length === 0) {
    logger.log("Cannot remove no items from agent", 1);
    return;
  }

  const agent = items[0].agent;

  for (const item of items) {
    if (item.agent !== agent) {
      logger.log("Cannot remove items from agent inventory, not all items from same agent", 0);
      return;
    }
  }

  const removedItems = [];

  for (const item of items) {
    item.agent.remove_item_inventory(item);
    item.take_from_agent();
    removedItems.push(item);
  }

  // TODO: server.send.remove_items_inventory(agent, removedItems);
}


/**
 * Move agent to room. Remove agent from old room, add to new room. Does validation.
 * @param {Object} agent - agent object.
 * @param {Object} newRoom - new room to move agent to.
 */
public static moveAgentToRoom(agent, newRoom) {
  if (agent === undefined || newRoom === undefined || agent.room === undefined) {
    logger.log("Cannot move agent to room", 0);
    return;
  }

  const oldRoom = Room.objects[agent.room];

  if (!oldRoom.is_connected_to(newRoom)) {
    logger.log("Cannot move agent. " + oldRoom.name + " not adjacent to " + newRoom.name, 0);
    return;
  }

  Controller.removeAgentFromRoom(agent, newRoom);
  Controller.addAgentToRoom(agent, newRoom, oldRoom);
}


/**
 * Add agent to a room. Does validation.
 * @param {Object} agent - agent to add to room.
 * @param {Object} newRoom - room to move agent to.
 * @param {Object} oldRoom - room agent is coming from. (Optional).
 */
public static addAgentToRoom(agent, newRoom, oldRoom= undefined) {
  if (newRoom === undefined || agent === undefined) {
    logger.log("Cannot add agent to room", 0, "controller.js");
    return;
  }

  agent.put_in_room(newRoom);
  newRoom.add_agent(agent);

  agent.socket.join(newRoom.room_id);

  // TODO: server.send.agent_enter_room(agent, oldRoom);
  // TODO: server.send.room_data(agent, newRoom, oldRoom);

  const time = util.getPanoptykDatetime();
  const info = Info.ACTION.ENTER.create(agent, {0: time, 1: agent.agent_id, 2: newRoom.room_id});

  Controller.giveInfoToAgents(newRoom.occupants, info);
}


/**
 * Remove agent from a room. Does validation.
 * @param {Object} agent - agent to remove from room.
 * @param {Object} newRoom - room agent is moving to. (Optional).
 */
public static removeAgentFromRoom(agent, newRoom= undefined, updateAgentModel= true) {
  if (agent === undefined) {
    logger.log("Cannot remove undefined agent from room", 0);
    return;
  }

  const oldRoom = Room.objects[agent.room];

  if (oldRoom === undefined) {
    logger.log("Cannot remove agent " + agent.agentName + " from room, agent is not in room.", 0);
    return;
  }

  Controller.removeAgentFromConversationIfIn(agent);

  agent.socket.leave(oldRoom.room_id);

  // TODO: server.send.agent_exit_room(agent, newRoom);

  if (updateAgentModel) {
    agent.remove_from_room();
  }

  const time = util.getPanoptykDatetime();
  const info = Info.ACTION.DEPART.create(agent, {0: time, 1: agent.agent_id, 2: oldRoom.room_id});

  Controller.giveInfoToAgents(oldRoom.occupants, info);

  oldRoom.remove_agent(agent);
}


/**
 * Add items to a room. Does validation.
 * @param {Object} room - room to add items to.
 * @param {[items]} items - list of items to add to room.
 * @param {Object} byAgent - agent responsible for putting items in room. (Optional).
 */
public static addItemsToRoom(room, items, byAgent= undefined) {
  if (room === undefined || items === undefined || items.length === 0) {
    logger.log("Cannot add items to room", 0);
    return;
  }

  for (const item of items) {
    if (item.room !== undefined || item.agent !== undefined) {
      logger.log("Cannot add item " + item.item_id  + " to room. Item not available,", 0);
      return;
    }
  }

  for (const item of items) {
    room.add_item(item);
    item.put_in_room(room);
  }

  // TODO: server.send.add_items_room(items, room, byAgent);
}


/**
 * Remove items from a room. Does validation.
 * @param {[Object]} items - list of items to remove from room.
 * @param {Object} byAgent - agent taking the items from room. (Optional).
 */
public static removeItemsFromRoom(items, byAgent= undefined) {
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
public static addAgentToConversation(conversation, agent) {
  Controller.removeAgentFromConversationIfIn(agent);

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
public static removeAgentFromConversation(conversation, agent) {
  logger.log("Removing agent " + agent.agentName + " from conversation " + conversation.conversation_id, 2);

  Controller.endAllTradesWithAgent(agent);

  agent.leave_conversation();
  conversation.remove_agent(agent);

  // TODO: server.send.agent_leave_conversation(agent, conversation);

  if (conversation.agents.length === 0) {
    conversation.room.remove_conversation(conversation);
  }
}


/**
 * Remove agent from their conversation if they are in one. Otherwise do nothing.
 * @param {Object} agent - agent object
 */
public static removeAgentFromConversationIfIn(agent) {
  if (agent.conversation !== undefined) {
    Controller.removeAgentFromConversation(agent.conversation, agent);
  }
}


/**
 * Cancel all trades containing an agent.
 * @param {Object} agent - agent object.
 */
public static endAllTradesWithAgent(agent) {
  for (const trade of Trade.getActiveTradesWithAgent(agent)) {
    Controller.cancelTrade(trade);
  }
}


/**
 * Create a trade and send request to appropriate agent.
 * 2param {Object} conversation - conversation object containing both agents.
 * @param {Object} fromAgent - agent object making request.
 * @param {Object} toAgent - agent object getting request.
 * @returns {Object} new trade object.
 */
public static createTrade(conversation, fromAgent, toAgent) {
  const trade = new Trade(fromAgent, toAgent, conversation);

  // TODO: server.send.trade_requested(toAgent.socket, trade);

  return trade;
}


/**
 * Accept a trade and send updates to both agents.
 * Trade is now ready to accept items.
 * @param {Object} trade - trade object.
 */
public static acceptTrade(trade) {
  // TODO: server.send.trade_accepted(trade.agent_ini.socket, trade, trade.agent_res);
  // TODO: server.send.trade_accepted(trade.agent_res.socket, trade, trade.agent_ini);
  trade.set_status(2);
}


/**
 * Cancel a trade, send updates to agents, and close out trade.
 * @param {Object} trade - trade object.
 */
public static cancelTrade(trade) {
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
public static performTrade(trade) {
  logger.log("Ending trade " + trade.trade_id, 2);

  // TODO: server.send.trade_complete(trade.agent_ini.socket, trade);
  // TODO: server.send.trade_complete(trade.agent_res.socket, trade);

  Controller.removeItemsFromAgentInventory(trade.items_ini);
  Controller.removeItemsFromAgentInventory(trade.items_res);

  Controller.addItemsToAgentInventory(trade.agent_ini, trade.items_res);
  Controller.addItemsToAgentInventory(trade.agent_res, trade.items_ini);

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
  // TODO: var info = Info.ACTION.CONVERSE.create(agent, {0: time, 1: trade.agent_ini.agent_id, 2: trade.agent_ini.agent_id, 3: trade.conversation.room.room_id});

  // TODO: Controller.giveInfoToAgents(trade.conversation.room.occupants, info);

  logger.log("Successfully completed trade " + trade.trade_id, 2);
}


/**
 * Add items to a trade and send updates.
 * @param {Object} trade - trade object.
 * @param {[Object]} items - array of items to add.
 * @param {Object} ownerAgent - agent adding the items.
 */
public static addItemsToTrade(trade, items, ownerAgent) {
  logger.log("Adding items to trade " + trade.trade_id  + "...", 2);

  Controller.setTradeUnreadyIfReady(trade, trade.agent_ini);
  Controller.setTradeUnreadyIfReady(trade, trade.agent_res);

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
public static removeItemsFromTrade(trade, items, ownerAgent) {
  logger.log("Removing items from trade " + trade.trade_id  + "...", 2);

  Controller.setTradeUnreadyIfReady(trade, trade.agent_ini);
  Controller.setTradeUnreadyIfReady(trade, trade.agent_res);

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
public static setTradeAgentStatus(trade, agent, rstatus) {
  const endTrade = trade.set_agent_ready(agent, rstatus);

  // TODO: server.send.agent_ready_trade(
  //  agent === trade.agent_ini ? trade.agent_ini.socket : trade.agent_res.socket,
  //  trade, agent, rstatus);

  if (endTrade) {
    Controller.performTrade(trade);
  }
}


/**
 * Will turn an agent ready status to false if it is true.
 * @param {Object} trade - trade object.
 * @param {Object} agent - agent object.
 */
public static setTradeUnreadyIfReady(trade, agent) {
  if (trade.agent_ini === agent && trade.status_ini) {
    Controller.setTradeAgentStatus(trade, agent, false);
  }
  else if (trade.agent_res === agent && trade.status_res) {
    Controller.setTradeAgentStatus(trade, agent, false);
  }
}

/**
 * Give a piece of info to an array of agents.
 * @param {[Object]} agents - agents to give info to.
 * @param {string} info - info string.
 */
public static giveInfoToAgents(agents, info) {

  const time = util.getPanoptykDatetime();

  for (const agent of agents) {
    const cpy = info.make_copy(agent, time);
    Controller.addInfoToAgentInventory(agent, [cpy]);
  }
}


public static requestConversation(agent, toAgent) {
  toAgent.conversation_requests[agent.agent_id] = agent.agent_id;
  // TODO: server.send.conversation_requested(agent, toAgent);
}


public static createConversation(room, agent, toAgent) {
  const conversation = new Conversation(room);
  conversation.add_agent(agent);
  conversation.add_agent(toAgent);

  Controller.addAgentToConversation(conversation, agent);
  Controller.addAgentToConversation(conversation, toAgent);
  return conversation;
}

}
