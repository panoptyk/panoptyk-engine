import { IModel } from "../../Imodel";

export interface IPredicate {
    readonly predicateName: string;
    _terms: serializable<PredicateTerms>;
    /**
     * @returns all terms for this predicate
     */
    getTerms(): PredicateTerms;
    getTerms(
        mask?: metadata<PredicateTerms>
    ): PredicateTerms | metadata<PredicateTerms>;
    /**
     * compares this predicate with provided predicate
     * @param pred predicate to compare to
     * @param mask apply mask to this predicate
     * @param otherMask apply mask to provided predicate
     * @returns whether this predicate is equal, not equal, a subset, or a superset of the provided predicate
     */
    compare(
        pred: IPredicate,
        mask?: metadata<PredicateTerms>,
        otherMask?: metadata<PredicateTerms>
    ): "equal" | "not equal" | "superset" | "subset" | "error";
    /**
     * compares this predicate as query with provided predicate
     * @param answer predicate to compare to
     * @param querydata apply querydata to this predicate
     * @returns whether this predicate is equal, not equal, a subset, or a superset of the provided predicate
     */
    queryCompare(
        answer: IPredicate,
        querydata?: metadata<PredicateTerms>
    ): "equal" | "not equal" | "superset" | "subset" | "error";
}

export const MASKED: "masked" = "masked";
export const QUERY: "query" = "query";

export type PredicateTerm =
    | typeof MASKED
    | typeof QUERY
    | number
    | boolean
    | IModel;

export interface PredicateTerms {
    [key: string]: PredicateTerm;
}

export type metadata<T extends PredicateTerms> = {
    [P in keyof T]?: boolean;
};

export type serializable<T extends PredicateTerms> = {
    [P in keyof T]: T[P] extends IModel ? number : T[P];
};

export type masked<T extends PredicateTerms> = {
    [P in keyof T]: typeof MASKED | T[P];
};

export type query<T extends PredicateTerms> = {
    [P in keyof T]: typeof QUERY | T[P];
};
