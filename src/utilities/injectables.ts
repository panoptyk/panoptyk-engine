import { IDatabase } from "../database/IDatabase";

/**
 * Insertion point for D.I.
 */
class Injectables {
  static _instance: Injectables;
  static get instance(): Injectables {
    if (!Injectables._instance) {
      Injectables._instance = new Injectables();
    }
    return Injectables._instance;
  }
  db: IDatabase;
  constructor() {

  }
}

export default Injectables.instance;