import { Agent } from "../models";
import {
  TARR,
  PredicateTARR,
  TAAR,
  PredicateTAAR,
  PredicateTerms,
  query,
  metadata,
  QUERY,
  TA,
  PredicateTA,
} from "./predicates";
import { Information } from "./information";
import { InformationManipulator } from "../manipulators/informationManipulator";

function splitQuery<P extends PredicateTerms>(
  query: query<P>
): { terms: P; meta: metadata<P> } {
  const meta: metadata<P> = {};
  const terms: any = {};
  for (const key in query) {
    if (query[key] === QUERY) {
      terms[key] = undefined;
      meta[key] = true;
    } else {
      terms[key] = query[key];
      meta[key] = false;
    }
  }
  return { terms, meta };
}

// Names of actions
const aNames = {
  MOVED: "moved",
  CONVERSED: "conversed",
};

export const Actions = {
  moved(terms: TARR, owner?: Agent) {
    return new Information<TARR>(
      aNames.MOVED,
      new PredicateTARR(terms),
      false,
      owner
    );
  },
  conversed(terms: TAAR, owner?: Agent) {
    return new Information<TAAR>(
      aNames.CONVERSED,
      new PredicateTAAR(terms),
      false,
      owner
    );
  },
};

export const Query = {
  about: {
    agent(agent: Agent) {
      const query = new Information<TA>(
        "",
        new PredicateTA({ time: 1, agent }),
        true
      );
      InformationManipulator.setQueryTargets(query, {
        action: true,
        predMetaData: { time: true, agent: false },
      });
      return query;
    },
  },
  moved(terms: query<TARR>) {
    const split = splitQuery(terms);
    const query = new Information<TARR>(
      aNames.MOVED,
      new PredicateTARR(split.terms),
      true
    );
    InformationManipulator.setQueryTargets(query, {
      action: true,
      predMetaData: split.meta,
    });
    return query;
  },
  conversed(terms: query<TAAR>) {
    const split = splitQuery(terms);
    const query = new Information<TAAR>(
      aNames.CONVERSED,
      new PredicateTAAR(split.terms),
      true
    );
    InformationManipulator.setQueryTargets(query, {
      action: true,
      predMetaData: split.meta,
    });
    return query;
  },
};
