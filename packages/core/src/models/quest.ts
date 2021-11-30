import { BaseModel } from "./Imodel";
import { IDatabase } from "../database/IDatabase";
import { logger } from "../utilities";
import { Agent } from "./agent";
import { Info } from "./information";

export class Quest extends BaseModel {
    displayName(): string {
        throw new Error("Method not implemented.");
    }
    toString(): string {
        return "Quest(id#" + this.id + ")";
    }
    equals(model: any) {
        return model instanceof Quest && this.id === model.id;
    }

    get checkQuestStatus(): string {
        return this._status;
    }

    get task(): Info {
        return this._task;
    }

    isActive(time: number): boolean {
        return time >= this._creationTime && time <= this._deadline;
    }

    turnInQuest(status): void {
        this._status = status;
    }

    _giver: Agent;
    _receiver: Agent;
    _task: Info;
    _status: string;
    _deadline: number;
    _creationTime: number;

    constructor(
        questGiver: Agent,
        questReceiver: Agent,
        task: Info,
        status: string = "ACTIVE",
        deadline: number,
        id?: number, 
        db?: IDatabase
    ) {
        super(id, db);

        this._giver = questGiver;
        this._receiver = questReceiver;
        this._task = task;
        this._status = status;
        this._deadline = deadline;
        this._creationTime = Date.now();

        logger.log("Quest " + this + " Initialized", "QUEST");
    }

    toJSON(forClient: boolean, context: any): object {
        const safeQuest = super.toJSON(forClient, context);
        return safeQuest;
    }
}
