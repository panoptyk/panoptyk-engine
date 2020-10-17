import { ClientAPI } from "@panoptyk/client";
import { TextClient } from "../../TextClient";

export function playerObject(this: TextClient, args: string[]) {
  console.log(ClientAPI.playerAgent);
  this._result = "debug: print player object to console";
}