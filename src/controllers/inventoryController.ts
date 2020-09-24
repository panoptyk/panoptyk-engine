import { BaseController } from "./baseController";
import { Agent, Item, Room } from "../models";
import {
  RoomManipulator,
  AgentManipulator,
  ItemManipulator,
} from "../manipulators";
import { ConversationController } from "./conversationController";
import { Actions } from "../models/information";

export class InventoryController extends BaseController {
  pickupItem(agent: Agent, item: Item, room: Room): void {
    if (agent.conversation !== undefined) {
      // TODO: Replace undefined with conversation
      const cc: ConversationController = new ConversationController(this);
      cc.removeAgentFromConversation(agent.conversation, agent);
    }

    RoomManipulator.removeItem(room, item);
    ItemManipulator.removeFromRoom(item);
    AgentManipulator.addItemInventory(agent, item);

    room.occupants.forEach((occupant) => {
      this.updateChanges(occupant, [agent, item, room]);
    });

    // Give info
    const info = Actions.pickedup({
      time: Date.now(),
      agent,
      room,
      item,
    });
    this.giveInfoToAgent(info, agent);
    this.disperseInfo(info, room);
  }

  pickupItems(agent: Agent, items: Item[], room: Room): void {
    items.forEach((item) => {
      this.pickupItem(agent, item, room);
    });
  }

  dropItem(agent: Agent, item: Item, room: Room): void {
    AgentManipulator.removeItemInventory(agent, item);
    ItemManipulator.putInRoom(item, room);
    RoomManipulator.addItem(room, item);

    room.occupants.forEach((occupant) => {
      this.updateChanges(occupant, [agent, item, room]);
    });

    // Give info
    const info = Actions.dropped({
        time: Date.now(),
        agent,
        room,
        item,
      });
      this.giveInfoToAgent(info, agent);
      this.disperseInfo(info, room);
  }

  dropItems(agent: Agent, items: Item[], room: Room): void {
    items.forEach((item) => {
      this.dropItem(agent, item, room);
    });
  }
}
