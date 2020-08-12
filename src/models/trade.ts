import { BaseModel } from ".";
import { IDatabase } from "../database/IDatabase";
import { logger } from "../utilities/logger";


export interface AnswerInfo {
  answerID: number;
  maskedInfo: string[];
}

export class Trade extends BaseModel {
  displayName(): string {
    throw new Error("Method not implemented.");
  }
  toString(): string {
    return "Trade (id#" + this.id + ")";
  }

  constructor(id?: number, db?: IDatabase){
    super(id, db);

    logger.log("Trade " + this + " Initialized");
  }

  toJSON(forClient: boolean, context: any): object {
    throw new Error("Method not implemented.");
  }
}
