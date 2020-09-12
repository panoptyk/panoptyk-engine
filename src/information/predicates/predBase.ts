import {
  IPredicate,
  PredicateTerms,
  maskof,
  serializable,
  MASKED,
  PredicateTerm,
} from "./IPredicate";
import { IModel } from "../../models";
import { IDatabase } from "../../database/IDatabase";
import inject from "../../utilities/injectables";

/**
 * Base class for predicates used in information model
 * implementing your own IPredicate class and IInformation class can be difficult
 */
export abstract class PredicateBase implements IModel, IPredicate {
  // Helper functions
  static maskTerms<P extends PredicateTerms>(terms: P, mask?: maskof<P>): P {
    const copyTerms = Object.assign({}, terms);
    if (mask) {
      for (const key in mask) {
        if (key in copyTerms && mask[key]) {
          (copyTerms[key] as any) = MASKED;
        }
      }
    }
    return copyTerms;
  }

  static equalTerms(term1?: PredicateTerm, term2?: PredicateTerm): boolean {
    if (!(term1 instanceof Object) && !(term2 instanceof Object)) {
      return term1 === term2;
    } else if (term1 instanceof Object && term1.equals) {
      return term1.equals(term2 as any);
    } else if (term2 instanceof Object && term2.equals) {
      return term2.equals(term1 as any);
    }
    return false;
  }

  // IModel functionality
  id = -1; // not used
  db: IDatabase;

  constructor(db?: IDatabase) {
    if (db) {
      this.db = db;
    } else {
      this.db = inject.db;
    }
  }

  toJSON(forClient: boolean, context: any): object {
    let copyTerms = Object.assign({}, this._terms);
    if (forClient) {
      if (context.mask) {
        copyTerms = PredicateBase.maskTerms(copyTerms, context.mask);
      }
    }
    return copyTerms;
  }
  fromJSON(json: any): void {
    for (const key in json) {
      this._terms[key] = json[key];
    }
  }
  equals(model: any): boolean {
    if (model instanceof PredicateBase) {
      return this.compare(model) === "equal";
    }
    return false;
  }
  displayName(): string {
    return this.predicateName;
  }
  toString(): string {
    // TODO toString should display all terms
    return this.predicateName;
  }
  // Predicate functionality
  readonly predicateName: string;
  _terms: serializable<PredicateTerms> = {};
  abstract getTerms(mask?: maskof<PredicateTerms>): PredicateTerms;

  compare(
    pred: IPredicate,
    mask?: maskof<PredicateTerms>,
    otherMask?: maskof<PredicateTerms>
  ): "equal" | "not equal" | "superset" | "subset" | "error" {
    const terms = this.getTerms(mask);
    const otherTerms = pred.getTerms(otherMask);

    const keys = Object.keys(terms);
    const otherKeys = Object.keys(otherTerms);

    if (keys.length === otherKeys.length) {
      if (this.predicateName !== pred.predicateName) {
        return "not equal";
      }
      for (const key of keys) {
        if (!PredicateBase.equalTerms(terms[key], otherTerms[key])) {
          return "not equal";
        }
      }
      return "equal";
    } else if (keys.length < otherKeys.length) {
      for (const key of keys) {
        if (!PredicateBase.equalTerms(terms[key], otherTerms[key])) {
          return "not equal";
        }
      }
      return "subset";
    } else if (keys.length > otherKeys.length) {
      for (const key of otherKeys) {
        if (!PredicateBase.equalTerms(terms[key], otherTerms[key])) {
          return "not equal";
        }
      }
      return "superset";
    }

    return "error";
  }
}
