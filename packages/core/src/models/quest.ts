import { BaseModel } from "./Imodel";
import { IDatabase } from "../database/IDatabase";
import { logger } from "../utilities";
import { Agent } from "./agent";
import { Info, Information } from "./information";

export const QuestStatus = {
    CLOSED: "closed",
    FALED: "failed",
    COMPLETED: "completed",
    ACTIVE: "active"
};

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

    get question(): Info {
        return this.db.retrieveModel(this._question, Information);
    }

    set question(question: Info) {
        this._question = question ? question.id : -1;
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

    get status(): string {
        return this._status;
    }

    set status(status: string) {
        this._status = status;
    }

    isActive(time: number): boolean {
        return time >= this._creationTime && time <= this._deadline;
    }

    _giver: number;
    _receiver: number;
    _question: InfoID;
    _status: string;
    _deadline: number;
    _creationTime: number;

    constructor(
        questGiver: Agent,
        questReceiver: Agent,
        question: Info,
        status: string,
        deadline: number,
        id?: number, 
        db?: IDatabase
    ) {
        super(id, db);

        this.giver = questGiver;
        this.receiver = questReceiver;
        this.question = question;
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
