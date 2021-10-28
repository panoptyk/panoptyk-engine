import {
    Agent,
    Item,
    Room,
    ItemManipulator,
    RoomManipulator,
    AgentManipulator,
    ConversationManipulator,
} from "@panoptyk/core";
import { BaseController } from "./baseController";
import { ConversationController } from "./conversationController";

export class SpawnController extends BaseController {
    spawnItem(item: Item, room: Room): void {
        ItemManipulator.putInRoom(item, room);
        RoomManipulator.addItem(room, item);

        room.occupants.forEach((occupant) => {
            this.updateChanges(occupant, [item, room]);
        });
    }

    despawnItem(item: Item, room: Room): void {
        ItemManipulator.removeFromRoom(item);
        RoomManipulator.removeItem(room, item);

        room.occupants.forEach((occupant) => {
            this.updateChanges(occupant, [item, room]);
        });
    }

    spawnAgent(agent: Agent, room: Room): void {
        AgentManipulator.putInRoom(agent, room);
        RoomManipulator.addAgent(room, agent);

        this.updateChanges(agent, [
            agent,
            room,
            room.adjacentRooms,
            room.occupants,
            room.items,
        ]);
        room.occupants.forEach((occupant) => {
            this.updateChanges(occupant, [agent, room]);
        });

        // Give Info -- Time masked conversations, items located
    }

    despawnAgent(agent: Agent, room: Room): void {
        if (agent.conversation !== undefined) {
            // TODO: Replace undefined with conversation
            const cc: ConversationController = new ConversationController(this);
            cc.removeAgentFromConversation(agent.conversation, agent);
        }

        agent.conversationsRequested.forEach((requestee) => {
            AgentManipulator.removeRequestedConversation(agent, requestee);
        });
        agent.conversationRequesters.forEach((requester) => {
            AgentManipulator.removeRequestedConversation(requester, agent);
        });

        AgentManipulator.removeFromRoom(agent);
        RoomManipulator.removeAgent(room, agent);

        this.updateChanges(agent, [agent, room]);
        room.occupants.forEach((occupant) => {
            this.updateChanges(occupant, [room]);
        });
    }
}
