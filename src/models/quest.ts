import { IDObject } from "./idObject";
import { logger } from "../utilities/logger";
import { Agent } from "./agent";
import { Info } from "./information";
import { Item } from ".";

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
  private _taskID: number;
  public get task(): Info {
    return Info.getByID(this._taskID);
  }

  private _item: number;
  public get item(): Item {
    return Item.getByID(this._item);
  }

  private _turnedInItems: Set<number>;
  public get turnedInItems(): Item[] {
    return Item.getByIDs(Array.from(this._turnedInItems));
  }

  private _deadline: number;
  public get deadline(): number {
    return this._deadline;
  }

  private _turnedInInfo: Set<number>;
  public get turnedInInfo(): Info[] {
    return Info.getByIDs(Array.from(this._turnedInInfo));
  }

  private _amount: number;
  public get amount(): number {
    return this._amount;
  }

  private _rewardXP: number;
  public get rewardXP(): number {
    return this._rewardXP;
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
  constructor(
    receiverAgent: Agent,
    giverAgent: Agent,
    task: Info,
    item: Item,
    type: string,
    amount = 1,
    deadline = 0,
    status = "ACTIVE",
    id?: number
  ) {
    super(Quest.name, id);
    this._receiverID = receiverAgent ? receiverAgent.id : undefined;
    this._giverID = giverAgent ? giverAgent.id : undefined;
    this._taskID = task ? task.id : undefined;
    this._item = item ? item.id : undefined;
    this._status = status;
    this._type = type;
    this._deadline = deadline;
    this._amount = amount > 0 ? amount : 1;
    this._turnedInInfo = new Set<number>();
    this._turnedInItems = new Set();
    this._rewardXP = 0;

    logger.log("Quest " + this + " initialized.", 2);
  }

  /**
   * Load and initialize quest object from JSON.
   * @param {Agent} json - serialized agent JSON from file.
   */
  static load(json: Quest) {
    let q: Quest = Quest.objects[json.id];
    q = q
      ? q
      : new Quest(
          undefined,
          undefined,
          undefined,
          undefined,
          json._type,
          json._amount,
          json._deadline,
          json._status,
          json.id
        );
    for (const key in json) {
      q[key] = json[key];
    }
    q._turnedInInfo = new Set<number>(q._turnedInInfo);
    q._turnedInItems = new Set<number>(q._turnedInItems);
    return q;
  }

  /**
   * Sanatizes data to be serialized
   * @param removePrivateData {boolean} Determines if private is removed information that a client/agent
   *  may not be privy to.
   * @param {Agent} agent - agent to customize info for
   */
  public serialize(agent?: Agent, removePrivateData = false) {
    const safeQuest = Object.assign({}, this);
    if (agent) {
      if (this.type !== "item") {
        safeQuest._taskID = this.task.getAgentsCopy(agent).id;
        const agentTurnedInInfo = new Set<number>();
        for (const info of this.turnedInInfo) {
          const newID = info.getAgentsCopy(agent).id;
          agentTurnedInInfo.add(newID);
        }
        safeQuest._turnedInInfo = agentTurnedInInfo;
      }
    }
    (safeQuest._turnedInInfo as any) = Array.from(safeQuest._turnedInInfo);
    (safeQuest._turnedInItems as any) = Array.from(safeQuest._turnedInItems);
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
    } else {
      logger.log("Failed to change status, invalid status given!", 0);
      return false;
    }
  }

  /**
   * Checks if given info would satisfy quest goal
   * @param info potential solution to quest
   */
  public checkSatisfiability(info: Info): boolean {
    return info.isAnswer(this.task, this.task.getTerms());
  }

  /**
   * Server: Add turned-in info.
   * @param info
   */
  public turnInInfo(info: Info) {
    const infoID = info.isReference() ? info.infoID : info.id;
    this._turnedInInfo.add(infoID);
  }

  public canTurnInItem(item: Item) {
    return this.item.sameAs(item) && this.amount > this._turnedInItems.size;
  }

  /**
   * Server: Add turned-in info.
   * @param info
   */
  public turnInItem(item: Item) {
    this._turnedInItems.add(item.id);
  }

  /**
   * Check if the given info has been turned in for this quest
   * @param info
   */
  public hasTurnedIn(info: Info) {
    return this._turnedInInfo.has(info.id);
  }

  public setRewardXP(amount: number) {
    this._rewardXP = amount;
  }

  public isComplete() {
    if (this._type === "question" || this._type === "command") {
      return this._turnedInInfo.size >= this._amount;
    } else if (this._type === "item") {
      return this._turnedInItems.size >= this._amount;
    }
    return false;
  }
}
