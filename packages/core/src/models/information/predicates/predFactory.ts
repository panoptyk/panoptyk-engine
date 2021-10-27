import { PredicateBase } from "./predBase";
import { T, PredicateT } from "./predT";
import { TA, PredicateTA } from "./predTA";
import { TAA, PredicateTAA } from "./predTAA";
import { TAAR, PredicateTAAR } from "./predTAAR";
import { TAARK, PredicateTAARK } from "./predTAARK";
import { TAR, PredicateTAR } from "./predTAR";
import { TARI, PredicateTARI } from "./predTARI";
import { TARR, PredicateTARR } from "./predTARR";

export const PredicateFactory: {
    [key: string]: (terms: any) => PredicateBase;
} = {
    T(terms) {
        return new PredicateT(terms);
    },
    TA(terms) {
        return new PredicateTA(terms);
    },
    TAA(terms) {
        return new PredicateTAA(terms);
    },
    TAAR(terms) {
        return new PredicateTAAR(terms);
    },
    TAARK(terms) {
        return new PredicateTAARK(terms);
    },
    TAR(terms) {
        return new PredicateTAR(terms);
    },
    TARI(terms) {
        return new PredicateTARI(terms);
    },
    TARR(terms) {
        return new PredicateTARR(terms);
    },
};
