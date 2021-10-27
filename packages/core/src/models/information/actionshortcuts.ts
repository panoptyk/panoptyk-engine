import {
    T,
    TA,
    TAA,
    TAAR,
    TAARK,
    TAR,
    TARI,
    TARR,
    PredicateT,
    PredicateTA,
    PredicateTAA,
    PredicateTAAR,
    PredicateTAARK,
    PredicateTAR,
    PredicateTARI,
    PredicateTARR,
    QUERY,
    query,
    metadata,
    PredicateTerms,
} from "./predicates";
import { Information } from "./information";
import { InformationManipulator } from "../../manipulators/informationManipulator";
import { Agent } from "../agent";

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
export const aNames = {
    MOVED: "moved",
    CONVERSED: "conversed",
    PICKED_UP: "picked up",
    DROPPED: "dropped",
    ASKED: "asked",
    TOLD: "told",
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
    told(terms: TAARK, owner?: Agent) {
        return new Information<TAARK>(
            aNames.TOLD,
            new PredicateTAARK(terms),
            false,
            owner
        );
    },
    asked(terms: TAARK, owner?: Agent) {
        return new Information<TAARK>(
            aNames.ASKED,
            new PredicateTAARK(terms),
            false,
            owner
        );
    },
    pickedup(terms: TARI, owner?: Agent) {
        return new Information<TARI>(
            aNames.PICKED_UP,
            new PredicateTARI(terms),
            false,
            owner
        );
    },
    dropped(terms: TARI, owner?: Agent) {
        return new Information<TARI>(
            aNames.DROPPED,
            new PredicateTARI(terms),
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
    told(terms: query<TAARK>) {
        const split = splitQuery(terms);
        const query = new Information<TAARK>(
            aNames.TOLD,
            new PredicateTAARK(split.terms),
            true
        );
        InformationManipulator.setQueryTargets(query, {
            action: true,
            predMetaData: split.meta,
        });
        return query;
    },
    asked(terms: query<TAARK>) {
        const split = splitQuery(terms);
        const query = new Information<TAARK>(
            aNames.ASKED,
            new PredicateTAARK(split.terms),
            true
        );
        InformationManipulator.setQueryTargets(query, {
            action: true,
            predMetaData: split.meta,
        });
        return query;
    },
    pickedup(terms: query<TARI>) {
        const split = splitQuery(terms);
        const query = new Information<TARI>(
            aNames.PICKED_UP,
            new PredicateTARI(split.terms),
            true
        );
        InformationManipulator.setQueryTargets(query, {
            action: true,
            predMetaData: split.meta,
        });
        return query;
    },
    dropped(terms: query<TARI>) {
        const split = splitQuery(terms);
        const query = new Information<TARI>(
            aNames.DROPPED,
            new PredicateTARI(split.terms),
            true
        );
        InformationManipulator.setQueryTargets(query, {
            action: true,
            predMetaData: split.meta,
        });
        return query;
    },
};
