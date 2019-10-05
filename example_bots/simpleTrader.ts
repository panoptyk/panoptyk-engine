import { ClientAPI } from "../src/core/panoptykClientAPI";
import { Agent, Room, Info, Trade, Item, Conversation } from "../src/core/models";
import { getPanoptykDatetime } from "../src/core/utilities/util";

const username = process.argv.length >= 3 ? process.argv[2] : "simpleTrader";
const password = process.argv.length > 3 ? process.argv[3] : "password";

let lastMove: number;
let holds: number;
let currentRoom: Room;

async function leaveRoom() {
    const adjacents = ClientAPI.playerAgent.room.getAdjacentRooms();
    const next = Math.floor(Math.random() * Math.floor(adjacents.length));
    await ClientAPI.moveToRoom(adjacents[next]).then(res => {
        lastMove = getPanoptykDatetime();
        currentRoom = ClientAPI.playerAgent.room;
    }).catch(err => {
        console.log(err);
    });
}

async function sendRequests() {
    for (const other of currentRoom.occupants) {
        if (other.id !== ClientAPI.playerAgent.id) {
            await ClientAPI.requestConversation(other).catch(err => {
                console.log(err);
            });
        }
    }
}

async function main() {
    let waitAmount: number;
    while (true) {
        if (ClientAPI.playerAgent.conversation === undefined &&
            ClientAPI.playerAgent.conversationRequesters.length === 0) {
                waitAmount = currentRoom.occupants.length > 1 ? 10 : 5;
                await sendRequests();
        }
        else if (ClientAPI.playerAgent.conversation !== undefined) {
            waitAmount = 20;
            console.log("yay conversation!!");
        }
        else {
            waitAmount = 99999999;
            await ClientAPI.acceptConversation(ClientAPI.playerAgent.conversationRequesters[0]).catch(err => {
                console.log(err);
            });
            // skip rest of loop since we now have a conversation
            continue;
        }

        if (getPanoptykDatetime() - lastMove > waitAmount) {
            await leaveRoom();
        }

        // delay next iteration of loop to avoid spinning cpu
        // tslint:disable-next-line: ban
        await new Promise(javascriptIsFun => setTimeout(javascriptIsFun, 500));
    }
}

async function init() {
    ClientAPI.init();
    await ClientAPI.login(username, password).then(res => {
        console.log("Login success! " + ClientAPI.playerAgent);
    }).catch(err => {
        throw new Error("Login fail!");
    });
    lastMove = getPanoptykDatetime();
    holds = 0;
    currentRoom = ClientAPI.playerAgent.room;
    main();
}

init();