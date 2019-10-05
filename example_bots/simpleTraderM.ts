import { ClientAPI } from "../src/core/panoptykClientAPI";
import {
  Agent,
  Room,
  Info,
  Trade,
  Item,
  Conversation
} from "../src/core/models";
import { getPanoptykDatetime } from "../src/core/utilities/util";
import { logger } from "../src/core/utilities/logger";

const username = process.argv[2] ? process.argv[2] : "simpleTrader";
const password = process.argv[3] ? process.argv[3] : "password";
const address = process.argv[4] ? process.argv[4] : "http://localhost:8080";

function init() {
  console.log("Logging in as: " + username + " to server: " + address);
  logger.silence();
  address ? ClientAPI.init(address) : ClientAPI.init();
  setTimeout(actWrapper, 100);
}

let acting = false;
let loggedIn = false;
let endBot = false;
function actWrapper() {
  if (!acting) {
    acting = true;
    if (!loggedIn) {
      ClientAPI.login(username, password)
        .then(res => {
          console.log("Logged in!");
          loggedIn = true;
        })
        .finally(() => {
          acting = false;
        });
    } else {
      act()
        .finally(() => {
          acting = false;
        });
    }
  }
  if (!endBot) {
    setTimeout(actWrapper, 100);
  }
}

function player() {
  return ClientAPI.playerAgent;
}

async function switchRoom() {
  const adjacents = player().room.getAdjacentRooms();
  const rm = Math.floor(Math.random() * adjacents.length);
  await ClientAPI.moveToRoom(adjacents[rm]);
}

const SWITCH_ROOM_INTERVAL = 10; // seconds
let moving = true;
let lastSwitch = 0;
let switchWait = 10;

let stop = false;

async function act() {
  if (moving && Date.now() - lastSwitch > switchWait) {
    await switchRoom();
    lastSwitch = Date.now();
    switchWait = (SWITCH_ROOM_INTERVAL + Math.random() * 5) * 1000;
    console.log("Moved to " + player().room);
  } else if (!stop && player().conversation === undefined) {
    // Try and request a trade with an occupant
    for (const other of player().room.occupants) {
        if (other.id !== player().id) {
            await ClientAPI.requestConversation(other);
            console.log("requested trade with " + other);
            moving = false;
            stop = true;
        }
    }
  }
}

init();
