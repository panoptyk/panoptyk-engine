import { BaseModel } from "./Imodel";
import { IDatabase } from "../database/IDatabase";
import { logger } from "../utilities";
import { Agent } from "./agent";
import { Info, Information } from "./information";

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
        return this.db.retrieveModel(this._task, Information);
    }

    set task(task: Info) {
        this._task = task ? task.id : -1;
    }

    get giver(): Agent {
        return this.db.retrieveModel(this._giver, Agent);
    }

    set giver(giver: Agent) {
        this._giver = giver ? giver.id : -1;
    }

    get receiver(): Agent {
        return this.db.retrieveModel(this._receiver, Agent);
    }

    set receiver(receiver: Agent) {
        this._receiver = receiver ? receiver.id : -1;
    }

    isActive(time: number): boolean {
        return time >= this._creationTime && time <= this._deadline;
    }

    turnInQuest(status): void {
        this._status = status;
    }

    _giver: number;
    _receiver: number;
    _task: InfoID;
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

        this.giver = questGiver;
        this.receiver = questReceiver;
        this.task = task;
        this._status = status;
        this._deadline = deadline;
        this._creationTime = Date.now();

        logger.log("Quest " + this + " Initialized", "QUEST");
    }

    isQuestCompleted(answer: Info): boolean {
        let task: Info = this.task;

        return task.isAnswer(answer);
    }

    toJSON(forClient: boolean, context: any): object {
        const safeQuest = super.toJSON(forClient, context);
        return safeQuest;
    }
}
