import { IModel } from "../../models";

export interface IPredicate {
  readonly predicateName: string;
  _terms: serializable<PredicateTerms>;
  /**
   * @returns all terms for this predicate
   */
  getTerms(mask?: maskof<PredicateTerms>): PredicateTerms;
  /**
   * compares this predicate with provided predicate
   * @param pred predicate to compare to
   * @param mask apply mask to this predicate
   * @param otherMask apply mask to provided predicate
   * @returns whether this predicate is equal, not equal, a subset, or a superset of the provided predicate
   */
  compare(
    pred: IPredicate,
    mask?: maskof<PredicateTerms>,
    otherMask?: maskof<PredicateTerms>
  ): "equal" | "not equal" | "superset" | "subset" | "error";
}

export const MASKED: "-" = "-";
export const QUERY: "?" = "?";

export type PredicateTerm = typeof MASKED | typeof QUERY | number | boolean | IModel;

export interface PredicateTerms {
  [key: string]: PredicateTerm;
}

export type maskof<T> = {
  [P in keyof T]?: boolean;
};

export type serializable<T> = {
  [P in keyof T]: T[P] extends IModel ? number : T[P];
};
