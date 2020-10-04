import { IDatabase } from "../database/IDatabase";
import { BaseModel } from "./Imodel";
import { Agent } from "./agent";
import { Room } from "./room";
import { logger } from "../utilities";

export class Conversation extends BaseModel {

  _room: number;
  get room() {
    return this.db.retrieveModel(this._room, Room) as Room;
  }
  set room(room: Room) {
    this._room = room ? room.id : -1;
  }
  _participants: Set<number>;
  get participants() {
    return this.db.retrieveModels([...this._participants], Agent);
  }
  _maxParticipants: number;
  get maxParticipants() {
    return this._maxParticipants;
  }
  displayName(): string {
    throw new Error("Method not implemented.");
  }
  toString(): string {
    return "Conversation (id#" + this.id + ")";
  }
  equals(model: any) {
    return model instanceof Conversation && this.id === model.id;
  }

  constructor(room: Room, id?: number, db?: IDatabase) {
    super(id, db);

    this._room = room.id;
    this._participants = new Set<number>();

    logger.log("Conversation " + this + " Initialized.", "CONVO");
  }

  toJSON(forClient: boolean, context: any): object {
    throw new Error("Method not implemented.");
  }

  containsAgent(agent: Agent): boolean {
    return this._participants.has(agent.id);
  }

  isFull(): boolean {
    return this._participants.keys.length >= this.maxParticipants;
  }
}