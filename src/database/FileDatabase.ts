import { IDatabase } from "./IDatabase";
import { modelRef, IModel } from "../models";

export class FileDatabase implements IDatabase {
  storeModels(models: IModel[]): boolean {
    throw new Error("Method not implemented.");
  }
  retrieveModels(id: number[], model: modelRef): IModel[] {
    throw new Error("Method not implemented.");
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
  retrieveModel(id: number, model: modelRef): IModel {
    throw new Error("Method not implemented.");
  }
  storeModel(model: IModel): boolean {
    throw new Error("Method not implemented.");
  }
  init(): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  save(): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  load(): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

}