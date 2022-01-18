import { Info, Information } from "../information";
import { T, PredicateT } from "./predT";
import { TA, PredicateTA } from "./predTA";
import { TAA, PredicateTAA } from "./predTAA";
import { TAAR, PredicateTAAR } from "./predTAAR";
import { TAARK, PredicateTAARK } from "./predTAARK";
import { TAARKK, PredicateTAARKK } from "./predTAARKK";
import { TAR, PredicateTAR } from "./predTAR";
import { TARI, PredicateTARI } from "./predTARI";
import { TARR, PredicateTARR } from "./predTARR";
import { TAARQ, PredicateTAARQ } from "./predTAARQ";



export class Check {
    static isPredicateT(info: Info): info is Information<T> {
        return info?.getPredicate()?.predicateName === "T";
    }

    static isPredicateTA(info: Info): info is Information<TA> {
        return info?.getPredicate()?.predicateName === "TA";
    }

    static isPredicateTAA(info: Info): info is Information<TAA> {
        return info?.getPredicate()?.predicateName === "TAA";
    }

    static isPredicateTAAR(info: Info): info is Information<TAAR> {
        return info?.getPredicate()?.predicateName === "TAAR";
    }

    static isPredicateTAARK(info: Info): info is Information<TAARK> {
        return info?.getPredicate()?.predicateName === "TAARK";
    }

    static isPredicateTAARKK(info: Info): info is Information<TAARKK> {
        return info?.getPredicate()?.predicateName === "TAARKK";
    }

    static isPredicateTAR(info: Info): info is Information<TAR> {
        return info?.getPredicate()?.predicateName === "TAR";
    }

    static isPredicateTARI(info: Info): info is Information<TARI> {
        return info?.getPredicate()?.predicateName === "TARI";
    }

    static isPredicateTARR(info: Info): info is Information<TARR> {
        return info?.getPredicate()?.predicateName === "TARR";
    }

    static isPredicateTAARQ(info: Info): info is Information<TAARQ> {
        return info?.getPredicate()?.predicateName === "TAARQ";
    }
}
