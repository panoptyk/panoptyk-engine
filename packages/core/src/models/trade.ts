import { BaseModel } from "./Imodel";
import { IDatabase } from "../database/IDatabase";
import { logger } from "../utilities";

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
  equals(model: any) {
    return model instanceof Trade && this.id === model.id;
  }

  constructor(id?: number, db?: IDatabase) {
    super(id, db);

    logger.log("Trade " + this + " Initialized", "TRADE");
  }

  toJSON(forClient: boolean, context: any): object {
    throw new Error("Method not implemented.");
  }
}
