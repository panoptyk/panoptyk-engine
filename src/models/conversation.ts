import { BaseModel, Agent, Room } from ".";
import { IDatabase } from "../database/IDatabase";
import { logger } from "../utilities/logger";

export class Conversation extends BaseModel {

  _room: number;
  get room() {
    return this.db.retrieveModel(this._room, Room) as Room;
  }
  _agentIDs: Set<number>;
  displayName(): string {
    throw new Error("Method not implemented.");
  }
  toString(): string {
    return "Conversation (id#" + this.id + ")";
  }

  constructor(room: Room, id?: number, db?: IDatabase) {
    super(id, db);

    this._room = room.id;

    logger.log("Conversation " + this + " Initialized.");
  }

  toJSON(forClient: boolean, context: any): object {
    throw new Error("Method not implemented.");
  }

  containsAgent(agent: Agent): boolean {
    return this._agentIDs.has(agent.id);
  }
}