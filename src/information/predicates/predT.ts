import { PredicateBase } from "./predBase";
import { maskof, PredicateTerms, serializable} from "./IPredicate";

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

  getTerms(mask?: maskof<T>): T {
    let terms: T = {
      time: this._terms.time,
    };

    terms = PredicateBase.maskTerms(terms, mask);

    return terms;
  }
}
