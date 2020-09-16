import { PredicateTerms, Information, metadata, query } from "../information";

export class InformationManipulator {
  /**
   * Adds mask to information model, hiding certain terms, to be labeled "masked"
   * @param {Information} info information to add mask to
   * @param mask true if term is masked
   */
  static setMask<P extends PredicateTerms>(
    info: Information<P>,
    mask: { action: boolean; predMetaData: metadata<P> }
  ): void {
    info._metadata = mask;
  }

  /**
   * Adds query to information model, indicating certain terms to be queried
   * @param {Information} info information to add mask to
   * @param query true if term in question is queried
   */
  static setQueryTargets<P extends PredicateTerms>(
    info: Information<P>,
    query: { action: boolean; predMetaData: metadata<P> }
  ): void {
    info._metadata = query;
  }

  /**
   * removes metadata(mask/query term identificaiton) from specified information model
   * @param {Information} information to remove metadata from
   */
  static removeMetaData(info: Information<PredicateTerms>) {
    info._metadata = {
      action: false,
      predMetaData: {},
    };
  }
}
