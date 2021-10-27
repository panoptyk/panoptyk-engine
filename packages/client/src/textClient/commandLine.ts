import readline from "readline";
import { ClientAPI } from "../clientAPI";
import * as cmds from "./cmds";
import { TextClient } from "./tc";

/////////////////////////////////////////////////////////////////
///////// CMD line Panoptyk Client (for devs) //////////////////
///////////////////////////////////////////////////////////////

const username = process.argv[2] ? process.argv[2] : "idle";
const password = process.argv[3] ? process.argv[3] : "password";
const address = process.argv[4] ? process.argv[4] : "http://localhost:8080";

const DEBUG = true; // add debug/dev commands
const MAX_RETRY = 10;
const RETRY_INTERVAL = 100; // ms before attempLogin() is called again to retry logging in

let _retries = 1;
let _loggedIn = false;
function attemptLogin() {
    ClientAPI.login(username, password)
        .catch((res) => {
            console.log("Failed(%d)....retrying...", _retries);
            if (_retries <= MAX_RETRY) {
                _retries++;
                // tslint:disable-next-line: ban
                setTimeout(attemptLogin, RETRY_INTERVAL);
            }
        })
        .then((res) => {
            console.log("Logged in!");
            _loggedIn = true;
        });
}

// Set up cmd line I/O

const tc = new TextClient();
let rl: readline.Interface = undefined;

function test_and_debug(this: TextClient, args: string[]) {
    // Place any debug code here
    console.log(ClientAPI.playerAgent.inConversation);
    this._result = "::debug::";
}

// add debug commands
if (DEBUG) {
    tc.addCommand("d", [], test_and_debug);
    tc.addCommand(["debug:player", "d:player"], [], cmds.debug.playerObject);
}
// add normal commands
tc.addCommand("move", [1], cmds.move);
tc.addCommand("requestConvo", [1], cmds.requestConvo);
tc.addCommand("declineConvo", [1], cmds.declineConvo);
tc.addCommand("leaveConvo", [0], cmds.leaveConvo);
tc.addCommand("look", [], cmds.look);
tc.addCommand("pickup", [], cmds.pickUp);
tc.addCommand("drop", [], cmds.drop);

function Prompt(promt: string, tc: TextClient) {
    // wait till logged in:
    if (!_loggedIn) {
        // tslint:disable-next-line: ban
        setTimeout(() => {
            Prompt(promt, tc);
        }, 150);
        return;
    }

    rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    rl.question(promt, (answ) => {
        if (answ !== "exit") {
            let r;
            try {
                tc.inputCommand(answ);
                r = tc.getResult();
            } catch (err) {
                r = "!runtime error!";
            }
            if (r !== undefined) {
                console.log(r);
            } else {
                console.log("Unknown command.");
            }
            rl.close();
            Prompt(promt, tc);
        } else {
            rl.close();
            process.exit(0);
        }
    });
}

// init program

function init() {
    console.log("Logging in as: " + username + " to server: " + address);
    ClientAPI.init(address);

    process.on("SIGINT", () => {
        if (rl) {
            rl.close();
        }
        process.exit(0);
    });

    attemptLogin();
    Prompt("panoptyk > ", tc);
}
// begin program
init();
