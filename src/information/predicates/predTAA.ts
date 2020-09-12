import { maskof, serializable } from "./IPredicate";
import { PredicateBase } from "./predBase";
import { TA } from "./predTA";
import { Agent } from "../../models";

export interface TAA extends TA {
  agentB: Agent;
}

/**
 * Creates an action that uses this predicate format
 * TAA: predicate(Time, Agent, AgentB)
 */
export class PredicateTAA extends PredicateBase {
  predicateName = "TAA";
  _terms: serializable<TAA>;

  constructor({ time, agent, agentB }: TAA) {
    super();
    this._terms.time = time;
    this._terms.agent = agent ? agent.id : -1;
    this._terms.agentB = agentB ? agentB.id : -1;
  }

  getTerms(mask?: maskof<TAA>): TAA {
    let terms: TAA = {
      time: this._terms.time,
      agent: this.db.retrieveModel(this._terms.agent, Agent) as Agent,
      agentB: this.db.retrieveModel(this._terms.agentB, Agent) as Agent
    };

    terms = PredicateBase.maskTerms(terms, mask);

    return terms;
  }
}
