import { PredicateBase } from "./predBase";
import {
  MASKED,
  masked,
  metadata,
  PredicateTerms,
  query,
  QUERY,
  serializable,
} from "./IPredicate";

export interface T extends PredicateTerms {
  time: number;
}

/**
 * Creates an action that uses this predicate format
 * T: predicate(Time)
 */
export class PredicateT extends PredicateBase {
  predicateName = "T";
  _terms: serializable<T>;

  constructor({ time }: T) {
    super();
    this._terms.time = time;
  }

  getTerms(mask?: metadata<T>, asQuery = false): T | masked<T> | query<T> {
    const terms: T = {
      time: this._terms.time,
    };

    return PredicateBase.replaceTerms(terms, asQuery ? QUERY : MASKED, mask);
  }
}
