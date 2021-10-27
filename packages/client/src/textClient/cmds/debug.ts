import { ClientAPI } from "../../clientAPI";
import { TextClient } from "../tc";

export function playerObject(this: TextClient, args: string[]) {
    console.log(ClientAPI.playerAgent);
    this._result = "debug: print player object to console";
}
