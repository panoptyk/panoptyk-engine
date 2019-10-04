import { ClientAPI } from "../src/core/panoptykClientAPI";
import { Agent, Room, Info, Trade, Item, Conversation } from "../src/core/models";
import { getPanoptykDatetime } from "../src/core/utilities/util";

const username = process.argv.length >= 3 ? process.argv[2] : "dummy";
const password = process.argv.length > 3 ? process.argv[3] : "password";

function pickRoom(): number {
    const adjacents = ClientAPI.playerAgent.room.getAdjacentRooms();
    const next = Math.floor(Math.random() * Math.floor(adjacents.length));
    return adjacents[next].id;
}

async function main() {
    await ClientAPI.login(username, password).then(res => {
        console.log("Login success! " + ClientAPI.playerAgent);
    }).catch(err => {
        throw new Error("Login fail!");
    });
    // aimlessly switch rooms every 3 seconds
    let lastMove = getPanoptykDatetime();
    while (true) {
        if (getPanoptykDatetime() - lastMove >= 3) {
            await ClientAPI.moveToRoom(pickRoom()).then(res => {
                lastMove = getPanoptykDatetime();
            }).catch(err => {
                throw new Error(err);
            });
        }
    }
}

main();