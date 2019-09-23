import { Trade, Item, Room, Agent, Conversation } from "../models/index";

export interface ValidationResult {
  status: boolean;
  message: string;
}

export class Validate {
  public static readonly successMsg: ValidationResult = { status: true, message: ""};
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
   * @param {Object} old_room - starting room.
   * @param {Object} new_room - target room.
   * @return {Object} {status: boolean, message: string}
   */
  public static validate_room_adjacent(old_room: Room, new_room: Room) {
    if (old_room.isConnectedTo(new_room)) {
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
   * @param {Object} agent - agent that might own items.
   * @param {[int]} item_ids - ids of items agent is supposed to own.
   * @return {Object} {status: boolean, message: string, items:[Object]}
   */
  public static validate_agent_owns_items(agent: Agent, item_ids: number[]) {
    const items: Item[] = Item.getByIDs(item_ids);
    if (items === null) {
      return {
        status: false,
        message: "No item for id " + JSON.stringify(item_ids)
      };
    }

    for (const item of items) {
      if (item.agent === agent) {
        return {
          status: false,
          message: "Agent does not have item " + item.itemName
        };
      }
    }

    return { status: true, message: "", items };
  }

  /**
   * Validate that an agent is logged in.
   * @param {Object} agent - agent object.
   * @return {Object} {status: boolean, message: string}
   */
  public static validate_agent_logged_in(agent: Agent) {
    if (agent !== null) {
      return Validate.successMsg;
    }

    return { status: false, message: "Agent not logged in" };
  }

  /**
   * Validate items are in room.
   * @param {Object} room - room items are supposed to be in.
   * @param {[int]} item_ids - ids of items room is supposed to have.
   * @return {Object} {status: boolean, message: string, items:[Object]}
   */
  public static validate_items_in_room(room: Room, item_ids: number[]) {
    const items: Item[] = Item.getByIDs(item_ids);
    if (items === null) {
      return {
        status: false,
        message: "No item for id " + JSON.stringify(item_ids)
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
  public static validate_items_in_trade(items: Item[], trade: Trade, owner: Agent) {
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
  public static validate_ready_status(trade: Trade, agent: Agent, rstatus: boolean) {
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
  public static validate_conversation_exists(room: Room, conversation: Conversation) {
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
    if (conversation.get_agent_ids().length >= conversation.maxAgents) {
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
  public static validate_conversation_has_agent(conversation: Conversation, agent: Agent) {
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
   * @param {Object} agent1 - agent object.
   * @param {Object} agent2 - agent object.
   * @returns {Object} {status: boolean, message: string, conversation: Object, to_agent: Object}
   */
  public static validate_agents_share_conversation(agent1: Agent, agent2: Agent) {
    // if (agent1.conversation !== agent2.conversation || !agent1.conversation) {
    //   return {status:false, message: 'Agents not in same conversation'}
    // }

    return {
      status: true,
      message: "",
      conversation: agent1.conversation,
      to_agent: agent2
    };
  }

  /**
   * Check if two agents are already engaged in a trade together.
   * @param {Object} agent1 - agent object.
   * @param {Object} agent2 - agent object.
   * @returns {Object} {}
   */
  public static validate_agents_not_already_trading(agent1, agent2) {}

  /**
   * Check if a trade exists.
   * @param {int} trade_id - id of trade.
   * @returns {Object} {status: boolean, message: string, trade: Object}
   */
  public static validate_trade_exists(trade_id) {
    const trade = Trade.getByID(trade_id);

    if (!trade) {
      return {
        status: false,
        message: "Could not find trade with id " + trade_id
      };
    }

    return { status: true, message: "", trade };
  }

  /**
   * Check if a trade has a given status.
   * @param {Object} trade - trade object.
   * @param {[int]} status_options - array of possible statuses.
   * @returns {Object} {status: boolean, message: string, trade: Object}
   */
  public static validate_trade_status(trade, status_options) {
    if (!trade || status_options.indexOf(trade.result_status) === -1) {
      return { status: false, message: "Trade not in correct state", trade };
    }

    return { status: true, message: "", trade };
  }
}
