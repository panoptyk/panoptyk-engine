import { ClientAPI } from "../../clientAPI";
import { Agent, Room, Item } from "@panoptyk/core";
import { TextClient } from "../tc";

// Commands for developers (not "player readable")

export function look(this: TextClient, at: string[]) {
    const player: Agent = ClientAPI.playerAgent;
    let msg: string = "Self: " + player + "\n";

    const all = at.length === 0;

    if (
        all ||
        at.includes("room") ||
        at.includes("rooms") ||
        at.includes("r")
    ) {
        msg += "\n";
        msg += "Room: " + player.room + "\n";
        msg += "Adjacent Rooms: \n";
        player.room.adjacentRooms.forEach((room) => {
            msg += room + "\n";
        });
    }

    if (
        all ||
        at.includes("agent") ||
        at.includes("agents") ||
        at.includes("a")
    ) {
        msg += "\n";
        msg += "Agents in Room:\n";
        player.room.occupants.forEach((occupant) => {
            msg += occupant + "\n";
        });
    }

    if (
        all ||
        at.includes("item") ||
        at.includes("items") ||
        at.includes("i")
    ) {
        msg += "\n";
        msg += "Items in Room:\n";
        player.room.items.forEach((item) => {
            msg += item + "\n";
        });
        msg += "\n";
        msg += "Inventory:\n";
        player.inventory.forEach((item) => {
            msg += item + "\n";
        });
    }

    if (
        all ||
        at.includes("conversation") ||
        at.includes("conversations") ||
        at.includes("c")
    ) {
        msg += "\n";
        msg += "Conversations Requested By:\n";
        player.conversationRequesters.forEach((agent) => {
            msg += agent + "\n";
        });
        msg += "\n";
        if (player.inConversation()) {
            msg += "In Converasation With:\n";
            player.conversation.participants.forEach((agent) => {
                if (!agent.equals(player)) {
                    msg += agent + "\n";
                }
            });
        } else {
            msg += "Not In Conversation.\n";
        }
    }

    this._result = msg;
}

export function move(this: TextClient, destination: string[]) {
    const player: Agent = ClientAPI.playerAgent;
    const oldRoom: Room = player.room;
    const rooms: Room[] = player.room.adjacentRooms;
    const selected = rooms.filter((room) => room.roomName === destination[0]);
    if (selected.length > 0) {
        ClientAPI.moveToRoom(selected[0]);
        this._result = "Moved from " + oldRoom + " to " + selected[0];
    } else {
        this._result = destination[0] + " is not an adjacent room.";
    }
}

export function requestConvo(this: TextClient, people: string[]) {
    const player: Agent = ClientAPI.playerAgent;
    const agentsInRoom: Agent[] = player.room.occupants;
    const selected = agentsInRoom.filter(
        (agent) => agent.agentName === people[0]
    );
    if (selected.length > 0) {
        ClientAPI.requestConversation(selected[0]);
        this._result = "Requested conversation with " + selected[0];
    } else {
        this._result = people[0] + " is not an agent currently in the room.";
    }
}

export function leaveConvo(this: TextClient, args: string[]) {
    const player: Agent = ClientAPI.playerAgent;
    ClientAPI.leaveConversation(player.conversation);
    this._result = "Left the conversation.";
}

export function declineConvo(this: TextClient, requester: string[]) {
    const player: Agent = ClientAPI.playerAgent;
    const requesters: Agent[] = player.conversationRequesters;
    const selected = requesters.filter(
        (agent) => agent.agentName === requester[0]
    );
    if (selected.length > 0) {
        this._result = "Declined requested conversation from " + selected[0];
    } else {
        this._result = requester[0] + " has not requested a conversation.";
    }
}

export function pickUp(this: TextClient, items: string[]) {
    const player: Agent = ClientAPI.playerAgent;
    const roomItems: Item[] = player.room.items;
    const selected = roomItems.filter((item) => items.includes(item.itemName));
    if (selected.length === items.length) {
        ClientAPI.takeItems(selected);
        let msg = "Picked up: ";
        selected.forEach((item) => {
            msg += item + " ";
        });
        msg = msg.slice(0, -2);
        this._result = msg;
    } else {
        let msg = "Tried to pick up invalid item(s): ";
        const names = selected.map((item) => item.itemName);
        const invalid = items.filter((item) => !names.includes(item));
        invalid.forEach((item) => {
            msg += item + ", ";
        });
        msg = msg.slice(0, -2);
        this._result = msg;
    }
}

export function drop(this: TextClient, items: string[]) {
    const player: Agent = ClientAPI.playerAgent;
    const inventory: Item[] = player.inventory;
    const selected = inventory.filter((item) => items.includes(item.itemName));
    if (selected.length === items.length) {
        ClientAPI.dropItems(selected);
        let msg = "Dropped: ";
        selected.forEach((item) => {
            msg += item + " ";
        });
        msg = msg.slice(0, -2);
        this._result = msg;
    } else {
        let msg = "Tried to drop invalid item(s): ";
        const names = selected.map((item) => item.itemName);
        const invalid = items.filter((item) => !names.includes(item));
        invalid.forEach((item) => {
            msg += item + ", ";
        });
        msg = msg.slice(0, -2);
        this._result = msg;
    }
}

export function tellInfo(this: TextClient) {
    const player: Agent = ClientAPI.playerAgent;
    let msg = "failed to tell info within the conversation";

    ClientAPI.tellInfo(player.conversation);
    msg = "info successfully told in the converstaion";

    this._result = msg;
}
