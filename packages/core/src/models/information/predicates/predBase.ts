import { IDatabase } from "../../../database/IDatabase";
import AppContext from "../../../utilities/AppContext";
import {
  IPredicate,
  PredicateTerms,
  metadata,
  serializable,
  MASKED,
  PredicateTerm,
  masked,
  query,
  QUERY,
} from "./IPredicate";
import { IModel } from "../../Imodel";

/**
 * Base class for predicates used in information model
 * implementing your own IPredicate class and IInformation class can be difficult
 */
export abstract class PredicateBase implements IModel, IPredicate {
  // Helper functions
  static replaceTerms<P extends PredicateTerms>(
    terms: P,
    replace: typeof MASKED | typeof QUERY = MASKED,
    mask?: metadata<P>
  ): masked<P> | query<P> {
    const copyTerms: any = Object.assign({}, terms);
    if (mask) {
      for (const key in mask) {
        if (key in copyTerms && mask[key]) {
          copyTerms[key] = replace;
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
    this.db = db ?? AppContext.db;
  }

  toJSON(forClient: boolean, context: any): object {
    let json: any  = Object.assign({}, this._terms);
    delete json.db;
    if (forClient) {
      if (context.mask) {
        json = PredicateBase.replaceTerms(json, context.mask);
      }
    }
    return json;
  }
  fromJSON(json: any): void {
    for (const key in json) {
      if (json[key]) {
        this._terms[key] = json[key];
      }
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
  abstract getTerms(metadata?: metadata<PredicateTerms>, asQuery?: boolean): PredicateTerms;

  compare(
    pred: IPredicate,
    mask?: metadata<PredicateTerms>,
    otherMask?: metadata<PredicateTerms>
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

  queryCompare(
    answer: IPredicate,
    query: metadata<PredicateTerms>,
  ): "equal" | "not equal" | "superset" | "subset" | "error" {
    const qTerms = this.getTerms(query, true);
    const terms = {};
    for (const key in qTerms) {
      if (qTerms[key] !== QUERY) {
        terms[key] = qTerms[key];
      }
    }
    const otherTerms = answer.getTerms();

    const qKeys = Object.keys(qTerms);
    const keys = Object.keys(terms);
    const otherKeys = Object.keys(otherTerms);

    if (qKeys.length === otherKeys.length) {
      if (this.predicateName !== answer.predicateName) {
        return "not equal";
      }
      for (const key of keys) {
        if (!PredicateBase.equalTerms(terms[key], otherTerms[key])) {
          return "not equal";
        }
      }
      return "equal";
    } else if (qKeys.length < otherKeys.length) {
      for (const key of keys) {
        if (!PredicateBase.equalTerms(terms[key], otherTerms[key])) {
          return "not equal";
        }
      }
      return "subset";
    } else if (qKeys.length > otherKeys.length) {
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
