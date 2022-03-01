import {
    T,
    TA,
    TAA,
    TAAR,
    TAARD,
    TAARK,
    TAARKK,
    TAARQ,
    TAR,
    TARI,
    TARR,
    PredicateT,
    PredicateTA,
    PredicateTAA,
    PredicateTAAR,
    PredicateTAARD,
    PredicateTAARK,
    PredicateTAARKK,
    PredicateTAARQ,
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
    PICKED_UP: "picked_up",
    DROPPED: "dropped",
    ASKED: "asked",
    TOLD: "told",
    QUEST_GIVEN: "quest_given",
    QUEST_COMPLETED: "quest_completed",
    QUEST_FAILED: "quest_failed",
    QUEST_CLOSED: "quest_closed",
    TRADE_COMPLETED: "trade_completed",
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
    told(terms: TAARKK, owner?: Agent) {
        return new Information<TAARKK>(
            aNames.TOLD,
            new PredicateTAARKK(terms),
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
    questGiven(terms: TAARQ, owner?: Agent) {
        return new Information<TAARQ>(
            aNames.QUEST_GIVEN,
            new PredicateTAARQ(terms),
            false,
            owner
        );
    },
    questCompleted(terms: TAARQ, owner?: Agent) {
        return new Information<TAARQ>(
            aNames.QUEST_COMPLETED,
            new PredicateTAARQ(terms),
            false,
            owner
        );
    },
    questFailed(terms: TAARQ, owner?: Agent) {
        return new Information<TAARQ>(
            aNames.QUEST_FAILED,
            new PredicateTAARQ(terms),
            false,
            owner
        );
    },
    questClosed(terms: TAARQ, owner?: Agent) {
        return new Information<TAARQ>(
            aNames.QUEST_CLOSED,
            new PredicateTAARQ(terms),
            false,
            owner
        );
    },
    tradeCompleted(terms: TAARD, owner?: Agent) {
        return new Information<TAARD>(
            aNames.TRADE_COMPLETED,
            new PredicateTAARD(terms),
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
    told(terms: query<TAARKK>) {
        const split = splitQuery(terms);
        const query = new Information<TAARKK>(
            aNames.TOLD,
            new PredicateTAARKK(split.terms),
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
    questGiven(terms: query<TAARQ>) {
        const split = splitQuery(terms);
        const query = new Information<TAARQ>(
            aNames.QUEST_GIVEN,
            new PredicateTAARQ(split.terms),
            true
        );
        InformationManipulator.setQueryTargets(query, {
            action: true,
            predMetaData: split.meta,
        });
        return query;
    },
    questCompleted(terms: query<TAARQ>) {
        const split = splitQuery(terms);
        const query = new Information<TAARQ>(
            aNames.QUEST_COMPLETED,
            new PredicateTAARQ(split.terms),
            true
        );
        InformationManipulator.setQueryTargets(query, {
            action: true,
            predMetaData: split.meta,
        });
        return query;
    },
    questFailed(terms: query<TAARQ>) {
        const split = splitQuery(terms);
        const query = new Information<TAARQ>(
            aNames.QUEST_FAILED,
            new PredicateTAARQ(split.terms),
            true
        );
        InformationManipulator.setQueryTargets(query, {
            action: true,
            predMetaData: split.meta,
        });
        return query;
    },
    questClosed(terms: query<TAARQ>) {
        const split = splitQuery(terms);
        const query = new Information<TAARQ>(
            aNames.QUEST_CLOSED,
            new PredicateTAARQ(split.terms),
            true
        );
        InformationManipulator.setQueryTargets(query, {
            action: true,
            predMetaData: split.meta,
        });
        return query;
    },
    tradeCompleted(terms: query<TAARD>) {
        const split = splitQuery(terms);
        const query = new Information<TAARD>(
            aNames.TRADE_COMPLETED,
            new PredicateTAARD(split.terms),
            true
        );
        InformationManipulator.setQueryTargets(query, {
            action: true,
            predMetaData: split.meta,
        });
        return query;
    },
};
