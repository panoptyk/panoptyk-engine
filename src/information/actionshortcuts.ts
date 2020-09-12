import { Agent } from "../models";
import { TARR, PredicateTARR, TAAR, PredicateTAAR } from "./predicates";
import { Information } from "./information";

export const Actions = {
  moved(terms: TARR, owner?: Agent, query = false) {
    return new Information<TARR>("moved", new PredicateTARR(terms), query, owner);
  },
  conversed(terms: TAAR, owner?: Agent, query = false) {
    return new Information<TAAR>("conversed", new PredicateTAAR(terms), query, owner);
  },
};
