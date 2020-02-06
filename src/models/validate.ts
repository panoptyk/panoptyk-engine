import { Trade, Item, Room, Agent, Conversation, Info, Quest, Faction } from "./index";

export interface ValidationResult {
  status: boolean;
  message: string;
}

export class Validate {
  public static readonly successMsg: ValidationResult = {
    status: true,
    message: ""
  };
  /**
   * Validate a given dictionary has same keys as one of theprovided ones.
   * @param {[Object]} goodFormats - given formats to match to.
   * @param {Object} inputFormat - dictionary being inspected.
   * @return {Object} {status: boolean, message: string}
   */
  public static validate_key_format(goodFormats, inputFormat) {
    formatLoop: for (const format of goodFormats) {
      if (Object.keys(format).length !== Object.keys(inputFormat).length) {
        break formatLoop;
      }

      for (const eventName in inputFormat) {
        if (!(eventName in format)) {
          break formatLoop;
        }
      }

      for (const eventName in format) {
        if (
          !(
            eventName in inputFormat &&
            typeof inputFormat[eventName] === format[eventName]
          )
        ) {
          break formatLoop;
        }
      }

      return Validate.successMsg;
    }

    return { status: false, message: "Invalid or missing key" };
  }

  /**
   * Validate one room is adjacent to another.
   * @param {Object} oldRoom - starting room.
   * @param {Object} newRoom - target room.
   * @return {Object} {status: boolean, message: string}
   */
  public static validate_room_adjacent(oldRoom: Room, newRoom: Room) {
    if (oldRoom.isConnectedTo(newRoom)) {
      return Validate.successMsg;
    }

    return { status: false, message: "Invalid room movement" };
  }

  /**
   * Validate a list contains all of one type.
   * @param {Object} arr - list
   * @param {string} atype - type
   * @return {Object} {status: boolean, message: string}
   */
  public static validate_array_types(arr: any[], atype: string) {
    for (const item of arr) {
      if (typeof item !== atype) {
        return {
          status: false,
          message: "Invalid type in array (" + typeof item + ")"
        };
      }
    }

    return Validate.successMsg;
  }

  /**
   * Validate agent owns list of items.
   * @param {Agent} agent - agent that might own items.
   * @param {[Item]} items - items agent is supposed to own.
   * @return {Object} {status: boolean, message: string, items:[Object]}
   */
  public static validate_agent_owns_items(agent: Agent, items: Item[]) {
    if (items === undefined) {
      return {
        status: false,
        message: "No such item detected " + JSON.stringify(items)
      };
    }

    for (const item of items) {
      if (item.agent !== agent) {
        return {
          status: false,
          message: "Agent does not have item " + item.itemName
        };
      }
    }

    return { status: true, message: "" };
  }

  /**
   * Validate that an agent is logged in.
   * @param {Object} agent - agent object.
   * @return {Object} {status: boolean, message: string}
   */
  public static validate_agent_logged_in(agent: Agent) {
    if (agent !== undefined) {
      return Validate.successMsg;
    }

    return { status: false, message: "Agent not logged in" };
  }

  /**
   * Checks if a valid username was provided by the client trying to log in
   * @param username username provided by client trying to log in
   * @return {Object} {status: boolean, message: string}
   */
  public static validate_login_username(
    username: string
  ): ValidationResult {
    if (!username || username.length <= 0) {
      return { status: false, message: "Username invalid" };
    }
    return Validate.successMsg;
  }

  /**
   * Validate items are in room.
   * @param {Object} room - room items are supposed to be in.
   * @param {[int]} itemIds - ids of items room is supposed to have.
   * @return {Object} {status: boolean, message: string, items:[Object]}
   */
  public static validate_items_in_room(room: Room, itemIds: number[]) {
    const items: Item[] = Item.getByIDs(itemIds);
    if (items === undefined) {
      return {
        status: false,
        message: "No item for id " + JSON.stringify(itemIds)
      };
    }

    for (const item of items) {
      if (item.room !== room) {
        return { status: false, message: "Item not in room " + room.roomName };
      }
    }

    return { status: true, message: "", items };
  }

  public static validate_room_has_space(room: Room) {
    if (room.occupants.length >= room.maxOccupants) {
      return { status: false, message: "Room is full", room };
    }

    return { status: true, message: "", room };
  }

  /**
   * Make sure an item is not locked.
   * @param {[Object]} items - items to check.
   * @returns {Object} {status: boolean, message: string, items: [Object]}
   */
  public static validate_items_not_in_transaction(items: Item[]) {
    for (const item of items) {
      if (item.inTransaction) {
        return { status: false, message: "Item is currently in transaction" };
      }
    }

    return { status: true, message: "", items };
  }

  /**
   * Make sure a list of items is in a trade.
   * @param {[Object]} items - list of items to check.
   * @param {Object} trade - trade object.
   * @param {Object} owner - agent object.
   * @returns {Object} {status: boolean, message: string, trade: [Object]}
   */
  public static validate_items_in_trade(
    items: Item[],
    trade: Trade,
    owner: Agent
  ) {
    if (owner === trade.agentIni) {
      for (const item of items) {
        if (trade.itemsIni.indexOf(item) < 0) {
          return { status: false, message: "Item not in trade" };
        }
      }
    } else if (owner === trade.agentRec) {
      for (const item of items) {
        if (trade.itemsRec.indexOf(item) < 0) {
          return { status: false, message: "Item not in trade" };
        }
      }
    } else {
      return { status: false, message: "Bad trade" };
    }

    return { status: true, message: "", trade, items };
  }

  /**
   * Check if a trade has an agent ready status.
   * @param {Object} trade - trade object.
   * @param {Object} agent - agent object.
   * @param {boolean} rstatus - ready status.
   * @returns {Object} {status: boolean, message: string, trade: Object}
   */
  public static validate_ready_status(
    trade: Trade,
    agent: Agent,
    rstatus: boolean
  ) {
    if (agent === trade.agentIni) {
      if (trade.statusIni !== rstatus) {
        return { status: false, message: "Trade ready status already set" };
      }
    } else if (agent === trade.agentRec) {
      if (trade.statusRec !== rstatus) {
        return { status: false, message: "Trade ready status already set" };
      }
    } else {
      return { status: false, message: "Agent not in trade" };
    }

    return { status: true, message: "", trade };
  }

  /**
   * Check if a conversation is in given room.
   * @param {int} room - room id to see if conversation is in.
   * @param {Object} conversation - conversation object.
   * @returns {Object} {status: boolean, message: string, conversation: Object}
   */
  public static validate_conversation_exists(
    room: Room,
    conversation: Conversation
  ) {
    if (conversation === undefined) {
      return { status: false, message: "Conversation does not exist" };
    }
    if (conversation.room !== room) {
      return { status: false, message: "Conversation not in agents room" };
    }

    return { status: true, message: "", conversation };
  }

  /**
   * Check if a conversation has space for another agent.
   * @param {Object} conversation - conversation object.
   * @returns {Object} {status: boolean, message: string, conversation: Object}
   */
  public static validate_conversation_has_space(conversation: Conversation) {
    if (conversation.getAgents().length >= conversation.maxAgents) {
      return { status: false, message: "Conversation is full", conversation };
    }

    return { status: true, message: "", conversation };
  }

  /**
   * Check if an agent is in a conversation.
   * @param {Object} conversation - conversation object.
   * @param {Object} agent - agent object.
   * @returns {Object} {status: boolean, message: string, conversation: Object}
   */
  public static validate_conversation_has_agent(
    conversation: Conversation,
    agent: Agent
  ) {
    if (conversation.contains_agent(agent) === undefined) {
      return {
        status: false,
        message: "Agent does not belong to conversation",
        conversation
      };
    }

    return { status: true, message: "", conversation };
  }

  /**
   * Check if two agents are in the same conversation.
   * @param {Agent} agent1 - agent object.
   * @param {Agent} agent2 - agent object.
   * @returns {Object} {status: boolean, message: string, conversation: Object, to_agent: Object}
   */
  public static validate_agents_share_conversation(
    agent1: Agent,
    agent2: Agent
  ) {
    if (!agent1.conversation || agent1.conversation !== agent2.conversation) {
      return { status: false, message: "Agents not in same conversation" };
    }

    return {
      status: true,
      message: "",
      conversation: agent1.conversation,
      to_agent: agent2
    };
  }

  /**
   * Check if two agents are already engaged in a trade together.
   * @param {Agent} agent1 - agent object.
   * @param {Agent} agent2 - agent object.
   * @returns {Object} {status: boolean, message: string}
   */
  public static validate_agents_not_already_trading(
    agent1: Agent,
    agent2: Agent
  ) {
    const shared: Trade[] = Trade.getActiveTradesBetweenAgents(agent1, agent2);
    if (shared.length > 0) {
      return {
        status: false,
        message: "Agents are sharing an active trade: " + shared[0].id
      };
    }
    return { status: true, message: "Agents are not sharing an active trade" };
  }

  /**
   * Check if a trade exists.
   * @param {int} tradeId - id of trade.
   * @returns {Object} {status: boolean, message: string, trade: Object}
   */
  public static validate_trade_exists(tradeId: number) {
    const trade = Trade.getByID(tradeId);

    if (!trade) {
      return {
        status: false,
        message: "Could not find trade with id " + tradeId
      };
    }
    return { status: true, message: "", trade };
  }

  /**
   * Check if a trade has a given status.
   * @param {Trade} trade - trade object.
   * @param {[int]} statusOptions - array of possible statuses.
   * @returns {Object} {status: boolean, message: string, trade: Object}
   */
  public static validate_trade_status(trade: Trade, statusOptions: number[]) {
    if (!trade || statusOptions.indexOf(trade.resultStatus) === -1) {
      return { status: false, message: "Trade not in correct state", trade };
    }
    return { status: true, message: "", trade };
  }

  /**
   * Validates that agent is in the given trade
   * @param agent
   * @param trade
   */
  public static validate_agent_in_trade(agent: Agent, trade: Trade) {
    if (trade.agentIni !== agent && trade.agentRec !== agent) {
      return {
        status: false,
        message: agent + " is not in Trade " + trade
      };
    }
    return Validate.successMsg;
  }

  /**
   * Checks if agents are in the same room
   * @param {Agent} fromAgent - sender
   * @param {Agent} toAgent - receiver
   */
  public static validate_agents_in_same_room(fromAgent: Agent, toAgent: Agent) {
    if (!fromAgent.room.hasAgent(toAgent)) {
      return {
        status: false,
        message:
          fromAgent +
          " is not in same room as " +
          toAgent
      };
    }
    return { status: true, message: "" };
  }

  /**
   * Checks if agents are already in conversations
   * @param {[Agent]} agents
   */
  public static validate_agents_not_conversing(agents: Agent[]) {
    for (const agent of agents) {
      if (agent.conversation !== undefined) {
        return {
          status: false,
          message: agent + " is already in a conversation!"
        };
      }
    }
    return { status: true, message: "" };
  }

  /**
   * Validates that a valid question can be constructed from parameters
   */
  public static validate_valid_question(predicate: any, mask: string[]) {
    const type = Info.ACTIONS[predicate.action];
    if (type === undefined) {
      return {
        status: false,
        message: "Error asking question, " + predicate.action + " is an invalid action!"
      };
    }
    // TODO: Validate predicate and mask predicates
    return {
      status: true,
      message: ""
    };
  }

  /**
   * Validates that a valid question is being answered and that the owner of
   * the question is in the conversation.
   */
  public static validate_can_answer(question: Info, conversation: Conversation) {
    if (question === undefined || !question.isQuery()) {
      return {
        status: false,
        message: "Not a valid question to answer!"
      };
    }
    else if (!conversation.contains_agent(question.owner)) {
      return {
        status: false,
        message: "Agent " + question.owner + " is not in your conversation!"
      };
    }
    return { status: true, message: "" };
  }

  public static validate_agent_owns_info(agent: Agent, info: Info) {
    if (info.owner !== agent) {
      return {
        status: false,
        message: "Cheater! You did not own this information."
      };
    }
    return { status: true, message: "" };
  }

  /**
   * Checks if given answer is related to question
   * @param question
   * @param answer
   * @param mask
   */
  public static validate_info_is_answer(question: Info, answer: Info) {
    if (question.action !== answer.action) {
      return {
        status: false,
        message: "Answer action does not match question action!"
      };
    }
    const questionTerms = question.getTerms();
    const answerTerms = answer.getTerms();
    // make sure answer has same known info as question
    for (const key in questionTerms) {
      if (questionTerms[key] !== undefined &&
        questionTerms[key] !== answerTerms[key]) {
        return {
          status: false,
          message: "Answer " + key + " of " + answerTerms[key] + " does not match the "
            + key + " of " + questionTerms[key] + " in the question!"
        };
      }
    }
    // make sure answer adds some unknown info
    let newInfo = 0;
    for (const key in answerTerms) {
        if (questionTerms[key] === undefined) {
          newInfo += 1;
        }
    }
    if (newInfo < 1) {
      return {
        status: false,
        message: "Answer does not add any new info to question!"
      };
    }
    return { status: true, message: "" };
  }

  /**
   * Checks if agent has already answered question with specific answer
   */
  public static validate_answer_not_used(trade: Trade, answer: Info) {
    const answeringAgent: Agent = answer.owner;
    const askingAgent: Agent = trade.agentIni === answeringAgent ? trade.agentRec : trade.agentIni;
    for (const info of answeringAgent.knowledge) {
      if (info.action === Info.ACTIONS.TOLD.name) {
        // checks if answering agent has told this answer to asking agent
        if (info.agents[1] === askingAgent.id && info.agents[0] === answeringAgent.id && info.infoID === answer.infoID) {
          return {
            status: false,
            message: "You have already told " + askingAgent + " that!"
          };
        }
        // checks if asking agent has told this answer to answering agent
        else if (info.agents[0] === askingAgent.id && info.agents[1] === answeringAgent.id && info.infoID === answer.infoID) {
          return {
            status: false,
            message: askingAgent + " has already told you that!"
          };
        }
      }
    }
    return { status: true, message: "" };
  }

  /**
   * Checks if question has been asked in current conversation
   */
  public static validate_asked_in_conversation(question: Info, conversation: Conversation) {
    if (!conversation.hasQuestion(question)) {
      return {
        status: false,
        message: question + " has not been asked on conversation " + conversation
      };
    }
    return { status: true, message: "" };
  }

  /**
   * Checks if given mask can be applied to specified info item
   * @param info info to be masked
   * @param mask mask to be applied
   */
  public static validate_info_mask(info: Info, mask: string[]) {
    const preds = info.getTerms();
    for (const val of mask) {
      if (preds[val] === undefined) {
        return {
          status: false,
          message: val + " cannot be masked as it does not exist on Info " + info
        };
      }
    }
    return { status: true, message: "" };
  }

  /**
   * Checks if quest was assigned by given agent
   * @param agent
   * @param quest
   */
  public static validate_agent_assigned_quest(agent: Agent, quest: Quest) {
    if (agent !== quest.giver) {
      return {
        status: false,
        message: agent + " did not create quest " + quest
      };
    }
    return { status: true, message: "" };
  }

  /**
   * Checks if given info solves the quest
   * @param info
   * @param quest
   */
  public static validate_info_satisfies_quest(info: Info, quest: Quest) {
    if (!quest.checkSatisfiability(info)) {
      return {
        status: false,
        message: info + " does not solve " + quest
      };
    }
    return { status: true, message: "" };
  }

  /**
   * Prevents stupid requests
   * @param agent
   * @param toAgent
   */
  public static validate_not_same_agent(agent: Agent, toAgent: Agent) {
    if (agent === toAgent) {
      return {
        status: false,
        message: "You cannot send a request to yourself!"
      };
    }
    return { status: true, message: "" };
  }

  /**
   * Makes sure agent has enough gold
   * @param agent
   * @param gold
   */
  public static validate_agent_has_enough_gold(agent: Agent, gold: number) {
    if (gold > 0 && agent.gold < gold) {
      return {
        status: false,
        message: "You do not have enough gold!"
      };
    }
    return { status: true, message: "" };
  }

  /**
   * Makes sure that proposed gold change would not cause negative balance for agent
   * @param agent
   * @param trade
   * @param amount
   */
  public static validate_trade_gold_change(agent: Agent, trade: Trade, amount: number) {
    if (trade.getAgentsOfferedGold(agent) + amount < 0) {
      return {
        status: false,
        message: "You cannot offer less than zero gold!"
      };
    }
    return { status: true, message: "" };
  }

  /**
   * Validation for events that require a minimum number of an object
   * @param obj
   * @param amount
   * @param threshold
   */
  public static validate_amount_greater_than(obj: string, amount: number, threshold: number) {
    if (!(amount > threshold)) {
      return {
        status: false,
        message: "Minimum of " + threshold + " " + obj + " required for action!"
      };
    }
    return { status: true, message: "" };
  }

  /**
   * Check if agent is part of required factionType needed to perform action
   * @param requiredType
   * @param agent
   */
  public static validate_factionType_requirement(requiredType: Set<string>, agent: Agent) {
    if (requiredType) {
      if (!agent.faction || !requiredType.has(agent.faction.factionType)) {
        return {
          status: false,
          message: agent + " is not part of a faction able to do that action"
        };
      }
    }
    return Validate.successMsg;
  }

  /**
   * Checks if agent is in a faction and optionally meets given rank requirement
   * @param agent agent to check
   * @param faction
   * @param rank optional param rank that agent must be <=
   */
  public static validate_agent_faction(agent: Agent, faction: Faction, rank?: number) {
    const agentRank = faction.getAgentRank(agent);
    if (agentRank === undefined) {
      return {
        status: false,
        message: agent + " is not part of faction " + faction
      };
    }
    else if (rank !== undefined && agentRank > rank) {
      return {
        status: false,
        message: agent + " does not meet rank requirement of " + rank + " in faction " + faction
      };
    }
    return { status: true, message: "" };
  }

  /**
   * Validates that item is either illegal or stolen
   * @param item
   */
  public static validate_illegal_item(item: Item) {
    if (!item.itemTags.has("illegal") && !item.itemTags.has("stolen")) {
      return {
        status: false,
        message: item + " is not illegal!"
      };
    }
    return Validate.successMsg;
  }

  /**
   * Validates that the agent is not online or dead
   * @param username
   */
  public static validate_can_login(username: string) {
    const agent = Agent.getAgentByName(username);
    if (agent) {
      if (agent.agentStatus.has("online")) {
        return {
          status: false,
          message: agent + " is already online!"
        };
      }
      if (agent.agentStatus.has("dead")) {
        return {
          status: false,
          message: agent + " is dead and cannot be played."
        };
      }
    }
    return Validate.successMsg;
  }

  /**
   * Makes sure agent's movement is not being restricted by other factors
   * @param agent
   */
  public static validate_can_leave(agent: Agent) {
    if (agent.agentStatus.has("forcedConversation")) {
      return {
        status: false,
        message: agent + " cannot leave forced conversation " + agent.conversation
      };
    }
    return Validate.successMsg;
  }
}
