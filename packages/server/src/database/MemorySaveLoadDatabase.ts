import * as fs from "fs";
import { Util, MemoryDatabase } from "@panoptyk/core";

export class MemorySaveLoadDatabase extends MemoryDatabase {
  save(): Promise<boolean> {
    fs.writeFileSync(
      "game.dat.json",
      Util.SmartJSON.stringify({ _idmap: this._idMap, _models: this._models })
    );
    return Promise.resolve(true);
  }
  load(): Promise<boolean> {
    return new Promise((resolve) => {
      const file = fs.readFileSync("game.dat.json").toString();
      const json = Util.SmartJSON.parse(file);
      this._idMap = json._idMap;
      this._models = json._models;
      resolve(true);
      return;
    });
  }
}
