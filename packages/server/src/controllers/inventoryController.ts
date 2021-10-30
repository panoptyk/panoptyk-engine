import {
    Agent,
    Item,
    Room,
    Recipe,
    RoomManipulator,
    AgentManipulator,
    ItemManipulator,
    Actions,
} from "@panoptyk/core";
import { BaseController } from "./baseController";
import { ConversationController } from "./conversationController";

export class InventoryController extends BaseController {
    pickupItem(agent: Agent, item: Item, room: Room): void {
        if (agent.conversation !== undefined) {
            // TODO: Replace undefined with conversation
            const cc: ConversationController = new ConversationController(this);
            cc.removeAgentFromConversation(agent.conversation, agent);
        }

        RoomManipulator.removeItem(room, item);
        ItemManipulator.removeFromRoom(item);
        AgentManipulator.addItemToInventory(agent, item);

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
        AgentManipulator.removeItemFromInventory(agent, item);
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

    craft(agent: Agent, recipe: Recipe) {
        [...recipe.resourcesRequired.keys()].forEach((resource) => {
            AgentManipulator.modifyResources(
                agent,
                resource,
                recipe.resourcesRequired.get(resource)
            );
        });

        AgentManipulator.addItemToInventory(
            agent,
            new Item(recipe.itemCreated, "unique", 1, undefined, agent)
        );

        // Tell Info
    }
}
