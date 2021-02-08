import { IDatabase } from "../database/IDatabase";
import { BaseModel } from "./Imodel";
import { logger } from "../utilities";

export class Recipe extends BaseModel {
  _recipeName: string;
  get recipeName(): string {
    return this._recipeName;
  }
  _resourcesRequired: Map<string, number>;
  get resourcesRequired(): Map<string, number> {
    return this._resourcesRequired;
  }

  _itemCreated: string;
  get itemCreated(): string {
    return this._itemCreated;
  }

  constructor(
    name: string,
    resources: Map<string, number>,
    itemCreated: string,
    id?: number,
    db?: IDatabase
  ) {
    super(id, db);
    this._recipeName = name;
    this._resourcesRequired = resources;
    this._itemCreated = itemCreated;
  }

  displayName(): string {
    return this._recipeName;
  }
  toString(): string {
    return this._recipeName + " (id#" + this.id + ")";
  }
}
