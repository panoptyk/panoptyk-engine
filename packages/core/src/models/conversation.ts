import { IDatabase } from "../database/IDatabase";
import { BaseModel } from "./Imodel";
import { Agent } from "./agent";
import { Room } from "./room";
import { logger } from "../utilities";
import { Info, Information } from "./information";

export class Conversation extends BaseModel {
    _room: number;
    get room() {
        return this.db.retrieveModel(this._room, Room);
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
    _log: Set<InfoID>;
    get log(): Info[] {
        return this.db.retrieveModels([...this._log], Information);
    }
    _startTime: number;
    get startTime(): number {
        return this._startTime;
    }
    _endTime: number;
    get endTime(): number {
        return this._endTime;
    }
    _askedQuestions: Set<InfoID>;
    get askedQuestions(): Info[] {
        return this.db.retrieveModels([...this._askedQuestions], Information);
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

        this.room = room;
        this._participants = new Set<number>();
        this._log = new Set<InfoID>();
        this._askedQuestions = new Set<InfoID>();
        this._startTime = -1;
        this._endTime = -1;

        logger.log("Conversation " + this + " Initialized.", "CONVO");
    }

    toJSON(forClient: boolean, context: any): object {
        const safeConvo = super.toJSON(forClient, context);
        return safeConvo;
    }

    containsAgent(agent: Agent): boolean {
        return this._participants.has(agent.id);
    }

    isFull(): boolean {
        return this._participants.keys.length >= this.maxParticipants;
    }
}
