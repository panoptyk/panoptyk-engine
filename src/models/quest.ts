import { BaseModel } from ".";
import { IDatabase } from "../database/IDatabase";
import { logger } from "../utilities/logger";

export class Quest extends BaseModel {
    displayName(): string {
        throw new Error("Method not implemented.");
    }
    toString(): string {
      return "Quest(id#" + this.id + ")";
    }

    constructor(id?: number, db?: IDatabase){
      super(id, db);

      logger.log("Quest " + this + " Initialized");
    }

    toJSON(forClient: boolean, context: any): object {
      throw new Error("Method not implemented.");
    }
}
