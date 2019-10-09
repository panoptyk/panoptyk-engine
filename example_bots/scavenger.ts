import { ClientAPI } from "../src/core/panoptykClientAPI";
import { Agent, Room, Info, Trade, Item, Conversation } from "../src/core/models";
import { getPanoptykDatetime } from "../src/core/utilities/util";

const username = process.argv.length >= 3 ? process.argv[2] : "scavenger";
const password = process.argv.length > 3 ? process.argv[3] : "password";

let lastMove: number;
let currentRoom: Room;

async function leaveRoom() {
    const adjacents = ClientAPI.playerAgent.room.getAdjacentRooms();
    const next = Math.floor(Math.random() * Math.floor(adjacents.length));
    await ClientAPI.moveToRoom(adjacents[next]).then(res => {
        lastMove = getPanoptykDatetime();
        currentRoom = ClientAPI.playerAgent.room;
    }).catch(err => {
        console.log(err.message);
    });
}

async function main() {
    let waitAmount: number;
    while (true) {
        waitAmount = 1000;
        // test take-items
        const roomItems = currentRoom.getItems();
        if (roomItems.length > 0) {
            await ClientAPI.takeItems(roomItems);
            // tslint:disable-next-line: ban
            await new Promise(javascriptIsFun => setTimeout(javascriptIsFun, 1000));
        }
        // test drop-items
        const agentItems = ClientAPI.playerAgent.inventory;
        if (agentItems.length > 0) {
            await ClientAPI.dropItems(agentItems);
            // tslint:disable-next-line: ban
            await new Promise(javascriptIsFun => setTimeout(javascriptIsFun, 1000));
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
    currentRoom = ClientAPI.playerAgent.room;
    main();
}

init();