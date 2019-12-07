import { IDObject } from "./idObject";
import { logger } from "../utilities/logger";
import { Agent } from "./agent";
import { Info } from "./information";

export class Quest extends IDObject {
    private _giverID: number;
    public get giver(): Agent {
        return Agent.getByID(this._giverID);
    }
    private _receiverID: number;
    public get receiver(): Agent {
        return Agent.getByID(this._receiverID);
    }
    private _status: string;
    public get status(): string {
        return this._status;
    }
    private _type: string;
    public get type(): string {
        return this._type;
    }
    private _infoID: number;
    public get info(): Info {
        return Info.getByID(this._infoID);
    }
    private _taskID: number;
    public get task(): Info {
        return Info.getByID(this._taskID);
    }
    private _deadline: number;
    public get deadline(): number {
        return this._deadline;
    }

    /**
     * Quest model
     * @param receiver receiving agent
     * @param giver giving agent
     * @param task info used to create quest
     * @param goal main action/question of quest
     * @param status compleition status of quest
     * @param id id of quest. If undefined, one will be assigned.
     */
    constructor(receiverAgent: Agent, giverAgent: Agent, task: Info, info: Info,
        type: string, deadline = 0, status = "ACTIVE", id?: number) {
        super(Quest.name, id);
        this._receiverID = receiverAgent ? receiverAgent.id : undefined;
        this._giverID = giverAgent ? giverAgent.id : undefined;
        this._taskID = task ? task.id : undefined;
        this._status = status;
        this._type = type;
        this._deadline = deadline;
        this._infoID = info ? info.id : undefined;

        logger.log("Quest " + this + " initialized.", 2);
    }

    /**
     * Load and initialize quest object from JSON.
     * @param {Agent} json - serialized agent JSON from file.
     */
    static load(json: Quest) {
        let q: Quest = Quest.objects[json.id];
        q = q ? q : new Quest(undefined, undefined, undefined, undefined,
            json._type, json._deadline, json._status, json.id);
        for (const key in json) {
            q[key] = json[key];
        }
        return q;
    }

    /**
     * Sanatizes data to be serialized
     * @param removePrivateData {boolean} Determines if private is removed information that a client/agent
     *  may not be privy to.
     */
    public serialize(removePrivateData = false) {
        const safeQuest = Object.assign({}, this);
        return safeQuest;
    }

    toString() {
        return "Quest(id#" + this.id + ")";
    }

    /**
     * Server: Updates status of quest
     * @param status
     */
    public setStatus(status: string): boolean {
        if (status === "ACTIVE" || status === "FAILED" || status === "COMPLETE") {
            this._status = status;
            return true;
        }
        else {
            logger.log("Failed to change status, invalid status given!", 0);
            return false;
        }
    }

    /**
     * Checks if given info would satisfy quest goal
     * @param info potential solution to quest
     */
    public checkSatisfiability(info: Info): boolean {
        return info.isAnswer(this.task);
    }
}