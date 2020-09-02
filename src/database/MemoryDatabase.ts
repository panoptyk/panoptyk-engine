import { IDatabase } from "./IDatabase";
import { modelRef, IModel, Item } from "../models";

export class MemoryDatabase implements IDatabase {
  storeModels(models: IModel[]): boolean[] {
    const success: boolean[] = [];
    models.forEach(model => {
      success.push(this.storeModel(model));
    });
    return success;
  }
  retrieveModels(ids: number[], model: modelRef): IModel[] {
    const models: IModel[] = [];
    ids.forEach(id => {
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
      console.log(error);
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
    return;
  }
  save(): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  load(): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

}