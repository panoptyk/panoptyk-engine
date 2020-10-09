import * as fs from "fs";
import { Util, MemoryDatabase, IModel } from "@panoptyk/core";

export class MemorySaveLoadDatabase extends MemoryDatabase {
  save(): Promise<boolean> {
    const serialModelMap = new Map<string, string[]>();
    this._models.forEach((val, key) => {
      const serialModels: string[] = [];
      val.forEach((model) => {
        serialModels.push(Util.Serialize.model(model));
      });
      serialModelMap.set(key, serialModels);
    });

    fs.writeFileSync(
      "game.dat.json",
      Util.SmartJSON.stringify({ idMap: this._idMap, models: serialModelMap })
    );
    return Promise.resolve(true);
  }
  load(): Promise<boolean> {
    return new Promise((resolve) => {
      console.log(
        "======================= LOAD =======================\n" +
          "Loading models from game.dat.json..."
      );
      const file = fs.readFileSync("game.dat.json").toString();
      const json = Util.SmartJSON.parse(file);
      const serialModelMap: Map<string, string[]> = json.models;
      this._idMap = json.idMap;
      Util.logger.silence(true);
      serialModelMap.forEach((val, key) => {
        console.log("Loading " + key + "(s): ");
        if (!this._models.has(key)) {
          this._models.set(key, new Map());
        }
        val.forEach((serializedM) => {
          const model = Util.Deserialize.model(serializedM, key);
          console.log("\t" + model.toString());
          this._models.get(key).set(model.id, model);
        });
      });
      Util.logger.logLevel = Util.LOG.INFO;
      console.log("===================== COMPLETE =====================");
      resolve(true);
      return;
    });
  }
}
