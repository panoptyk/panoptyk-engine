import { PredicateTerms, Information, maskof } from "../information";

export class InformationManipulator {
  static setMask<P extends PredicateTerms>(
    info: Information<P>,
    mask: { action: boolean; predMask: maskof<P> }
  ): void {
    info._mask = mask;
  }

  static removeMask(info: Information<PredicateTerms>) {
    info._mask = {
      action: false,
      predMask: {},
    };
  }
}
