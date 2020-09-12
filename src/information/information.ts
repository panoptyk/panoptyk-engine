import { BaseModel, Agent } from "../models";
import {
  PredicateBase,
  maskof,
  PredicateTerms,
  PredicateT,
  PredicateTA,
  PredicateTAA,
  PredicateTAAR,
  PredicateTAR,
  PredicateTARR,
  MASKED,
} from "./predicates";
import { IDatabase } from "../database/IDatabase";

/**
 * lookup to find correct class to construct when calling fromJSON()
 */
export const PredicateConstructor: {
  [key: string]: new (...args: any[]) => PredicateBase;
} = {
  T: PredicateT,
  TA: PredicateTA,
  TAA: PredicateTAA,
  TAAR: PredicateTAAR,
  TAR: PredicateTAR,
  TARR: PredicateTARR,
};

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
   * potential mask of information
   */
  _mask: { action: boolean; predMask: maskof<P> } = {
    action: false,
    predMask: {},
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
  }

  toJSON(forClient: boolean, context: any): object {
    const safeInfo = Object.assign({}, this);
    if (forClient) {
      if (context && context.agent instanceof Agent) {
        // TODO: Remove hidden data
      }
    }
    if (this.isMaster()) {
      safeInfo._pred = this._pred.toJSON(forClient, context) as any;
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
      const pred = new PredicateConstructor[this._pred.predicateName]({});
      pred.fromJSON(this._pred);
      this._pred = pred;
    }
  }

  displayName(): string {
    return this.toString();
  }
  toString(): string {
    return "Info#" + this.id;
  }

  isMasked(): boolean {
    const predMasked = false;
    for (const key in this._mask.predMask) {
      if (this._mask.predMask[key]) {
        return true;
      }
    }
    return this._mask.action;
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

  getTerms(withMask = false): { action: string } & P {
    const master = this.getMasterCopy();
    const terms: any = master._pred.getTerms(
      withMask ? this._mask.predMask : undefined
    );
    terms.action = withMask && this._mask.action ? MASKED : master._action;
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

  isAnswer(answer: Information<PredicateTerms>) {
    // TODO
  }

  answers(question: Information<PredicateTerms>) {
    // TODO
  }
}
