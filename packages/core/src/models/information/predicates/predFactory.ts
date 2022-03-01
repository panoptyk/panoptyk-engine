import { PredicateBase } from "./predBase";
import { T, PredicateT } from "./predT";
import { TA, PredicateTA } from "./predTA";
import { TAA, PredicateTAA } from "./predTAA";
import { TAAR, PredicateTAAR } from "./predTAAR";
import { TAARD, PredicateTAARD } from "./predTAARD";
import { TAARK, PredicateTAARK } from "./predTAARK";
import { TAARKK, PredicateTAARKK } from "./predTAARKK";
import { TAR, PredicateTAR } from "./predTAR";
import { TARI, PredicateTARI } from "./predTARI";
import { TARR, PredicateTARR } from "./predTARR";
import { TAARQ, PredicateTAARQ } from "./predTAARQ";


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
    TAARD(terms) {
        return new PredicateTAARD(terms);
    },
    TAARK(terms) {
        return new PredicateTAARK(terms);
    },
    TAARKK(terms) {
        return new PredicateTAARKK(terms);
    },
    TAARQ(terms) {
        return new PredicateTAARQ(terms);
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
