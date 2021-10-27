import {
    MASKED,
    masked,
    metadata,
    query,
    QUERY,
    serializable,
} from "./IPredicate";
import { PredicateBase } from "./predBase";
import { T } from "./predT";
import { Agent } from "../../agent";

export interface TA extends T {
    agent: Agent;
}

/**
 * Creates an action that uses this predicate format
 * TA: predicate(Time, Agent)
 */
export class PredicateTA extends PredicateBase {
    predicateName = "TA";
    _terms: serializable<TA>;

    constructor({ time, agent }: TA) {
        super();
        this._terms.time = time;
        this._terms.agent = agent ? agent.id : -1;
    }

    getTerms(mask?: metadata<TA>, asQuery = false): masked<TA> | query<TA> {
        const terms: TA = {
            time: this._terms.time,
            agent: this.db.retrieveModel(this._terms.agent, Agent) as Agent,
        };

        return PredicateBase.replaceTerms(
            terms,
            asQuery ? QUERY : MASKED,
            mask
        );
    }
}
