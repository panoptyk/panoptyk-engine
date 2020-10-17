import { IDatabase } from "../../database/IDatabase";
import { logger } from "../../utilities/";
import {
  PredicateFactory,
  PredicateBase,
  metadata,
  PredicateTerms,
  MASKED,
  QUERY,
  masked,
  query,
} from "./predicates";
import { BaseModel } from "../Imodel";
import { Agent } from "../agent";

export type Info = Information<PredicateTerms>;

/**
 * Information model represents all events occuring in the Panoptyk world
 * wrapper to be information for any action, predicate pair using PredicateBase
 */
export class Information<P extends PredicateTerms> extends BaseModel {
  /**
   * type of action
   */
  _action: string;
  /**
   * action's predicate terms
   */
  _pred: PredicateBase;
  /**
   * potential mask or query of information terms
   */
  _metadata: { action: boolean; predMetaData: metadata<P> } = {
    action: false,
    predMetaData: {},
  };

  /**
   * Agent that owns this piece of information
   */
  _owner: number;
  get owner(): Agent {
    return this.db.retrieveModel(this._owner, Agent) as Agent;
  }
  set owner(agent: Agent) {
    this._owner = agent ? agent.id : -1;
  }
  /**
   * time information was created
   */
  _creationTime: number;
  /**
   * does this information represent a question instead of an action
   */
  _query: boolean;
  // _command: boolean; TODO
  _masterCopy: boolean;
  /**
   * in master copies of information keeps track of agent possessed info copies that reference
   *  the master
   */
  _agentCopies: Map<number, number>;
  /**
   * ID of information model this information is a copy of
   */
  _referenceID: number;
  get reference(): Information<P> {
    return this.db.retrieveModel(this._referenceID, Information) as Information<
      P
    >;
  }

  constructor(
    action: string,
    pred: PredicateBase,
    query = false,
    owner?: Agent,
    id?: number,
    db?: IDatabase
  ) {
    super(id, db);
    this._masterCopy = true;
    this._agentCopies = new Map();
    this._creationTime = Date.now();
    this._query = query;
    this._action = action;
    this._pred = pred;
    this.owner = owner;

    logger.log(this + " initialized", "INFO");
  }

  toJSON(forClient: boolean, context: any): object {
    const safeInfo: Information<P> = super.toJSON(
      forClient,
      context
    ) as Information<P>;
    if (forClient) {
      if (context && context.agent instanceof Agent) {
        // TODO: Remove hidden data
      }
    }
    if (this.isMaster()) {
      safeInfo._pred = {} as any;
      safeInfo._pred._terms = this._pred.toJSON(forClient, context) as any;
      (safeInfo._pred as any).predicateName = this._pred.predicateName;
    }
    return safeInfo;
  }

  fromJSON(json: any) {
    if (json.id && json.id !== this.id) {
      return;
    }
    for (const key in json) {
      this[key] = json[key];
    }
    if (this.isMaster()) {
      const pred = PredicateFactory[json._pred.predicateName]({});
      pred.fromJSON(json._pred._terms);
      this._pred = pred;
    } else {
      this._agentCopies = undefined;
    }
  }

  displayName(): string {
    return this.toString();
  }
  toString(): string {
    return "Info#" + this.id;
  }

  isMasked(): boolean {
    for (const key in this._metadata.predMetaData) {
      if (this._metadata.predMetaData[key]) {
        return true;
      }
    }
    return this._metadata.action;
  }

  isMaster(): boolean {
    return this._masterCopy;
  }

  isReference(): boolean {
    return !this.isMaster();
  }

  isQuery(): boolean {
    return this.getMasterCopy()._query;
  }

  shareMasterCopy(info: Information<PredicateTerms>) {
    const master = this.getMasterCopy();
    const otherMaster = info.getMasterCopy();
    return master.id === otherMaster.id;
  }

  getMasterCopy(): Information<P> {
    return this.isMaster() ? this : this.reference;
  }

  getAgentCopy(owner: Agent): Information<P> {
    if (this._masterCopy && owner && this._agentCopies.has(owner.id)) {
      return this.db.retrieveModel(
        this._agentCopies.get(owner.id),
        Information
      ) as Information<P>;
    }
    return undefined;
  }

  getTerms(withMask: false): { action: string } & P;
  getTerms(withMask: true): { action: string | typeof MASKED } & masked<P>;
  getTerms(
    withMask = false
  ): { action: string | typeof MASKED | typeof QUERY } & (
    | P
    | masked<P>
    | query<P>
  ) {
    const master = this.getMasterCopy();
    if (this.isQuery()) {
      return master.getQueryTerms();
    }
    const terms: any = master._pred.getTerms(
      withMask ? this._metadata.predMetaData : undefined
    );
    terms.action = withMask && this._metadata.action ? MASKED : master._action;
    return terms;
  }

  getQueryTerms(): { action: string | typeof QUERY } & query<P> {
    const master = this.getMasterCopy();
    const terms: any = master._pred.getTerms(
      master._metadata.predMetaData,
      true
    );
    terms.action = master._metadata.action ? QUERY : master._action;
    return terms;
  }

  /**
   * Creates a new copy of the information, referencing the master version of the info
   * @param {Agent} owner agent who owns the information copy
   */
  getCopy(owner?: Agent): Information<P> {
    const master = this.getMasterCopy();
    const copy = new Information<P>(
      master._action,
      undefined,
      master._query,
      owner,
      undefined,
      this.db
    );
    copy._referenceID = master.id;
    copy._masterCopy = false;
    copy._agentCopies = undefined;
    if (owner) {
      master._agentCopies.set(owner.id, copy.id);
    }
    return copy;
  }

  equals(model: any): boolean {
    return model instanceof Information && this.id === model.id;
  }

  /**
   * Checks if provided information is equivalent
   * @param info other information model
   */
  equivalent(info: Information<PredicateTerms>) {
    const master = this.getMasterCopy();
    const otherMaster = info.getMasterCopy();
    return (
      master.id === otherMaster.id ||
      (master._query === otherMaster._query &&
        master._action === otherMaster._action &&
        master._pred.compare(otherMaster._pred) === "equal")
    );
  }

  /**
   * Checks if provided question is answered by this information
   * @param question question; must be a query
   */
  answers(question: Information<PredicateTerms>): boolean {
    return question.isAnswer(this);
  }

  /**
   * Checks if provided answer is a valid answer to this query
   * @param answer answer to info; cannot be a query
   */
  isAnswer(answer: Information<PredicateTerms>): boolean {
    const masterQ = this.getMasterCopy();
    const masterA = answer.getMasterCopy();
    if (!masterQ.isQuery() || masterA.isQuery()) {
      return false;
    }
    const predCompare = masterQ._pred.queryCompare(
      masterA._pred,
      masterQ._metadata.predMetaData
    );
    return (
      (masterQ._metadata.action || masterQ._action === masterA._action) &&
      (predCompare === "equal" || predCompare === "subset")
    );
  }
}
