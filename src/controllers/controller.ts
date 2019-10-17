import { logger, LOG } from "../utilities/logger";
import * as util from "../utilities/util";
import {
  IDObject,
  Agent,
  Conversation,
  Trade,
  Room,
  Item,
  Info
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
        updates.add(change);
      }
      // sometimes we will have arrays of changes in models
      else {
        for (const item of change) {
          updates.add(item);
        }
      }
    }
    this._updates.set(agent, updates);
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
        payload[name].push(model.serialize());
      }
      // console.log(payload);
      if (agent.socket) {
        agent.socket.emit("updateModels", payload);
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
      addedItems.push(item);

      agent.addItemInventory(addedItems[addedItems.length - 1]);
      addedItems[addedItems.length - 1].giveToAgent(agent);
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
  }

  /**
   * Fetches all agent data and adds it to room
   * @param agent
   */
  public login(agent: Agent) {
    this.updateChanges(agent, [agent.inventory, agent.knowledge]);
    this.addAgentToRoom(agent, agent.room);
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

    // agent.socket.join(newRoom.id); <- should we use this functionality?

    this.updateChanges(agent, [
      newRoom,
      agent,
      newRoom.getAdjacentRooms(),
      newRoom.getAgents(),
      newRoom.getItems()
    ]);
    newRoom.occupants.forEach(occupant => {
      this.updateChanges(occupant, [newRoom, agent]);
    });

    const time = util.getPanoptykDatetime();
    const info = Info.ACTIONS.ENTER.create({ time, agent, loc: newRoom });
    info.owner = agent;

    this.giveInfoToAgents(newRoom.getAgents(), info);
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

    const time = util.getPanoptykDatetime();
    const info = Info.ACTIONS.DEPART.create({ time, agent, loc: oldRoom });
    info.owner = agent;

    this.giveInfoToAgents(oldRoom.getAgents(), info);
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
    for (const trade of Trade.getRequestedTradesWithAgent(agent)) {
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
    this.updateChanges(toAgent, [trade]);
    this.updateChanges(fromAgent, [trade]);
    return trade;
  }

  /**
   * Accept a trade and send updates to both agents.
   * Trade is now ready to accept items.
   * @param {Object} trade - trade object.
   */
  public acceptTrade(trade: Trade) {
    trade.setStatus(2);
    this.updateChanges(trade.agentIni, [trade]);
    this.updateChanges(trade.agentRec, [trade]);
  }

  /**
   * Cancel a trade, send updates to agents, and close out trade.
   * @param {Object} trade - trade object.
   */
  public cancelTrade(trade: Trade) {
    trade.setStatus(0);
    trade.cleanup();
    this.updateChanges(trade.agentIni, [trade]);
    this.updateChanges(trade.agentRec, [trade]);
  }

  /**
   * Do the trade. Send updates to agents, move items, close out trade, and give observation
   *    info to all agents in room.
   * @param {Object} trade - trade object.
   */
  public performTrade(trade: Trade) {
    logger.log("Ending trade " + trade.id, 2);

    const tradedInfo: Info[] = [];
    const generalInfo: Info[] = [];

    if (trade.itemsIni.length > 0) {
      this.removeItemsFromAgentInventory(trade.itemsIni);
      this.addItemsToAgentInventory(trade.agentRec, trade.itemsIni);
    }
    if (trade.itemsRec.length > 0) {
      this.removeItemsFromAgentInventory(trade.itemsRec);
      this.addItemsToAgentInventory(trade.agentIni, trade.itemsRec);
    }

    // complete information trades
    for (const info of trade.infoIni) {
      info.completeTradeCopy(trade.agentRec);
      generalInfo.push(Info.ACTION.TOLD.create(trade.agentIni,
        { 0: util.getPanoptykDatetime(), 1: trade.agentIni.id,
          2: trade.agentRec.id, 3: trade.agentIni.room.id, 4: info.id }));
      tradedInfo.push(info);
    }
    for (const info of trade.infoRec) {
      info.completeTradeCopy(trade.agentIni);
      generalInfo.push(Info.ACTION.TOLD.create(trade.agentRec,
        { 0: util.getPanoptykDatetime(), 1: trade.agentRec.id,
          2: trade.agentIni.id, 3: trade.agentRec.room.id, 4: info.id }));
      tradedInfo.push(info);
    }

    trade.setStatus(1);
    trade.cleanup();

    this.updateChanges(trade.agentIni, [trade, trade.agentIni, tradedInfo]);
    this.updateChanges(trade.agentRec, [trade, trade.agentRec, tradedInfo]);

    // TODO: fix info given at end of trade
    // Info object prep
    const itemsIniStr = [];
    const itemsResStr = [];

    for (const item of trade.itemsIni) {
      itemsIniStr.push(item.itemName);
    }
    for (const item of trade.itemsRec) {
      itemsResStr.push(item.itemName);
    }

    const time = util.getPanoptykDatetime();
    const info = Info.ACTIONS.CONVERSE.create({
      time,
      agent1: trade.agentIni,
      /* is this right ->*/ agent2: trade.agentIni,
      loc: trade.conversation.room
    });
    info.owner = trade.agentIni;

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

    this.updateChanges(agent, [trade]);

    if (endTrade) {
      this.performTrade(trade);
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
   * Give a piece of info to an array of agents.
   * @param {[Object]} agents - agents to give info to.
   * @param {Info} info - info Object.
   */
  public giveInfoToAgents(agents: Agent[], info: Info) {
    const time = util.getPanoptykDatetime();

    for (const agent of agents) {
      const cpy = info.makeCopy(agent, time);
      this.addInfoToAgentInventory(agent, [cpy]);
      this.updateChanges(agent, [agent]);
    }
  }

  public requestConversation(agent: Agent, toAgent: Agent) {
    toAgent.conversationRequest(agent.id);
    this.updateChanges(toAgent, [toAgent]);
  }

  public createConversation(room: Room, agent: Agent, toAgent: Agent) {
    const conversation = new Conversation(room);
    conversation.add_agent(agent);
    conversation.add_agent(toAgent);

    this.addAgentToConversation(conversation, agent);
    this.addAgentToConversation(conversation, toAgent);
    return conversation;
  }

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

  public askQuestion(agent: Agent, questionType: string, predicate: object) {
    const question: Info = Info.ACTION[questionType].create(agent, predicate);
    question.query = true;

    const conversation: Conversation = agent.conversation;
    const relevantAgents = conversation.getAgents();
    for (const other of conversation.getAgents(agent)) {
      this.giveInfoToAgents(relevantAgents, Info.ACTION.ASK.create(agent, {0: util.getPanoptykDatetime(),
        1: agent.id, 2: other.id, 3: conversation.room.id, 4: question.id}));
    }
    this.giveInfoToAgents(relevantAgents, question);
  }

  public answerQuestion(agent: Agent, question: Info, conversation: Conversation) {
    while (question.reference) {
      question = Info.getByID(question.infoID);
    }
    const responseInfo: Info = Info.ACTION.KNOW.create(agent, {0: util.getPanoptykDatetime(), 1: agent, 2: question.id});
    const relevantAgents = conversation.getAgents();
    this.giveInfoToAgents(relevantAgents, (Info.ACTION.TOLD.create(agent, {0: util.getPanoptykDatetime(),
      1: agent.id, 2: question.owner, 3: conversation.room.id, 4: responseInfo.id})));
    this.giveInfoToAgents(relevantAgents, responseInfo);
  }

  public addAnswerToTrade(trade: Trade, answer: Info, question: Info, owner: Agent) {
    this.setTradeUnreadyIfReady(trade, trade.agentIni);
    this.setTradeUnreadyIfReady(trade, trade.agentRec);

    answer = answer.makeTradeCopy(owner, util.getPanoptykDatetime(), question);
    trade.addInfo([answer], owner);

    this.updateChanges(trade.agentIni, [trade, answer, question]);
    this.updateChanges(trade.agentRec, [trade, answer, question]);
  }

  public removeInfoFromTrade(trade: Trade, info: Info, owner: Agent) {
    this.setTradeUnreadyIfReady(trade, trade.agentIni);
    this.setTradeUnreadyIfReady(trade, trade.agentRec);

    trade.removeInfo([info], owner);

    this.updateChanges(trade.agentIni, [trade]);
    this.updateChanges(trade.agentRec, [trade]);
  }
}
