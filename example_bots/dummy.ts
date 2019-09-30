import { ClientAPI } from "../src/core/panoptykClientAPI";

const username = process.argv.length >= 3 ? process.argv[2] : "dummy";
const password = process.argv.length > 3 ? process.argv[3] : "password";

function main() {
    ClientAPI.login(username, password).then(res => {
        console.log("Login success! " + ClientAPI.playerAgent);
    }).catch(err => {
        throw new Error("Login fail!");
    });
}

main();