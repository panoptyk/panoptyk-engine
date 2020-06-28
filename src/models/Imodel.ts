import inject from "../utilities/injectables";
import { IDatabase } from "../database/IDatabase";
import { FileDatabase } from "../database/FileDatabase";

/**
 * Defines the necessary parameters and functions any Panoptyk game model needs.
 * To add new game models to a Panoptyk server, it must implement this interface.
 */
export interface IModel {
  /**
   * Unique ID number to identify specific models
   */
  id: number;
  /**
   * Database the model will use.
   */
  db: IDatabase;
  /**
   * Provides json safe version of model for serialization and databasing
   * @param forClient Is the JSON for a connected client
   * @param context Additional context for use when creating the safe json
   * @returns The json save version of the model.
   */
  toJSON(forClient: boolean, context: any): any;
  /**
   * Load model data from json
   * @param json Json safe version of model
   */
  fromJSON(json: any): void;
  /**
   * In-game name of specfic model instance
   */
  displayName(): string;
  /**
   * Logging name of the specific model instance
   */
  toString(): string;
}

/**
 * Defines type that can be any model class implementing IModel.
 */
export type modelRef = new (...args: any[]) => IModel;

/**
 * Useful starter class for new model.
 * Does not need to be used.
 */
export abstract class BaseModel implements IModel {
  id: number;
  db: IDatabase;

  constructor(id?: number, db?: IDatabase) {
    if (db) {
      this.db = db;
    } else {
      this.db = inject.db;
    }

    if (id) {
      this.id = id;
    } else {
      this.id = this.db.getNextID(this.constructor as any);
    }
  }

  toJSON(forClient: boolean, context: any): object {
    return this;
  }
  fromJSON(json: any): void {
    if (json.id && json.id !== this.id) {
      return;
    }
    for (const key in json) {
      this[key] = json[key];
    }
  }
  abstract displayName(): string;
  abstract toString(): string;

}

// TODO: Turn this into unit test of some sort
// inject.db = new FileDatabase();

// class ModelA extends BaseModel {
//   constructor() {
//     super();
//     console.log("ModelA#" + this.id + " created");
//   }
//   displayName(): string {
//     throw new Error("Method not implemented.");
//   }
//   toString(): string {
//     throw new Error("Method not implemented.");
//   }
// }

// class ModelB extends BaseModel {
//   constructor() {
//     super();
//     console.log("ModelB#" + this.id + " created");
//   }
//   displayName(): string {
//     throw new Error("Method not implemented.");
//   }
//   toString(): string {
//     throw new Error("Method not implemented.");
//   }
// }

// new ModelA();
// new ModelB();
// new ModelA();
// new ModelA();
// new ModelB();
// new ModelB();