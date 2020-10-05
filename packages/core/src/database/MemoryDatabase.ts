import * as fs from "fs";
import { IDatabase } from "./IDatabase";
import { modelRef, IModel } from "../models";
import { SmartJSON } from "../utilities";

export class MemoryDatabase implements IDatabase {
  storeModels(models: IModel[]): boolean[] {
    const success: boolean[] = [];
    models.forEach((model) => {
      success.push(this.storeModel(model));
    });
    return success;
  }
  retrieveModels(ids: number[], model: modelRef): IModel[] {
    const models: IModel[] = [];
    ids.forEach((id) => {
      models.push(this.retrieveModel(id, model));
    });
    return models;
  }
  _idMap: Map<string, number> = new Map();
  getNextID(model: modelRef): number {
    if (!this._idMap.has(model.name)) {
      this._idMap.set(model.name, 1);
    }
    const id = this._idMap.get(model.name);
    this._idMap.set(model.name, id + 1);
    return id;
  }
  _models: Map<string, Map<number, IModel>> = new Map();
  retrieveModel(id: number, model: modelRef): IModel {
    try {
      return this._models.get(model.name).get(id);
    } catch (error) {
      // console.log(error);
      return undefined;
    }
  }
  storeModel(model: IModel): boolean {
    if (!this._models.has(model.constructor.name)) {
      this._models.set(model.constructor.name, new Map<number, IModel>());
    }
    this._models.get(model.constructor.name).set(model.id, model);
    return true;
  }
  init(): Promise<boolean> {
    this.load();
    return Promise.resolve(true);
  }
  save(): Promise<boolean> {
    fs.writeFileSync(
      "game.dat.json",
      SmartJSON.stringify({ _idmap: this._idMap, _models: this._models })
    );
    return Promise.resolve(true);
  }
  load(): Promise<boolean> {
    return new Promise((resolve) => {
      console.log("before read");
      const file = fs.readFileSync("game.dat.json").toString();
      console.log("past read");
      const json = SmartJSON.parse(file);
      console.log("past parse");
      this._idMap = json._idMap;
      this._models = json._models;
      resolve(true);
      console.log("past resolve");
      return;
    });
  }
  matchModel(query: object, model: modelRef): IModel[] {
    const matches: IModel[] = [];
    let models: IModel[];
    try {
      models = [...this._models.get(model.name).values()];
      models.forEach((m: IModel) => {
        let isMatch = true;
        for (const key in query) {
          if (query[key] instanceof Object && query[key].equals) {
            isMatch = isMatch && query[key].equals((m as any)[key]);
          } else {
            isMatch = isMatch && query[key] === (m as any)[key];
          }
        }
        if (isMatch) {
          matches.push(m);
        }
      });
    } catch (error) {}
    return matches;
  }
}